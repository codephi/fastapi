const { getAll, getOne, create, update, remove } = require('./routes')

const queryToProperties = (properties) => {
  const newProperties = {}
  Object.entries(properties).forEach(([_, { name, ...value }]) => {
    newProperties[name] = value.schema
  })
  return newProperties
}

const responseToProperties = (properties) => {
  const newProperties = {}
  Object.entries(properties).forEach(([key, value]) => {
    newProperties[key] = propertiesToItems(value)
  })
  return newProperties
}

const propertiesToItems = (value) => {
  if (value.type !== 'object' && value.properties !== undefined) {
    value.items = value.properties
    delete value.properties
  }

  return value
}

const resolveResponses = (responses) => {
  if (!responses) return {}

  const response = {}
  Object.entries(responses).forEach(([code, { description, content }]) => {
    response[code] = {
      description,
      type: 'object',
      properties: responseToProperties(content['application/json'].schema.properties)
    }
  })
  return response
}

const getRouteHandler = (method, model, operation) => {
  if (method === 'get') {
    if (operation.responses['200'].description.includes('array')) {
      return getAll(model, model.name)
    } else {
      return getOne(model, model.name)
    }
  } else if (method === 'post') {
    return create(model, model.name)
  } else if (method === 'put') {
    return update(model, model.name)
  } else if (method === 'delete') {
    return remove(model, model.name)
  }
}

const createRoute = ({ fastify, path, method, handler }) => {
  const [methodName, operation] = Object.entries(method)[0]

  const route = {
    method: methodName.toUpperCase(),
    url: path,
    schema: {
      response: resolveResponses(operation.responses)
    },
    handler
  }

  if (operation.requestBody) {
    route.schema.body = responseToProperties(
      operation.requestBody.content['application/json'].schema
    )
  }

  if (operation.parameters) {
    const query = operation.parameters.filter((p) => p.in === 'query')
    if (query.length > 0) {
      route.schema.querystring = queryToProperties(query)
    }
  }

  fastify.route(route)
}

const createRouteModel = ({ fastify, paths, model }) => {
  Object.entries(paths).forEach(([path, operations]) => {
    Object.entries(operations).forEach(([method, operation]) => {
      const handler = getRouteHandler(method, model, operation)
      createRoute({ fastify, path, method: { [method]: operation }, handler })
    })
  })
}

const createRouteHandler = ({ fastify, paths, handler }) => {
  Object.entries(paths).forEach(([path, operations]) => {
    Object.entries(operations).forEach(([method, operation]) => {
      createRoute({ fastify, path, method: { [method]: operation }, handler })
    })
  })
}
module.exports.createRouteHandler = createRouteHandler
module.exports.createRouteModel = createRouteModel
