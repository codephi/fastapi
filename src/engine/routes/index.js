const { getAll, getOne, create, update, remove } = require('./routes')

function queryToProperties (schema) {
  const properties = {}
  Object.entries(schema).forEach(([_, { name, ...value }]) => {
    properties[name] = value
  })
  return properties
}

function responseToProperties (properties) {
  const newProperties = {}
  Object.entries(properties).map(([key, value]) => {
    newProperties[key] = propertiesToItems(value)
  })
  return newProperties
}

function propertiesToItems (value) {
  if (value.type !== 'object' && value.properties !== undefined) {
    value.items = value.properties
    delete value.properties
  }

  return value
}

function resolveResponses (responses) {
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

module.exports.createRoute = ({ fastify, paths, model }) => {
  Object.entries(paths).forEach(([path, operations]) => {
    Object.entries(operations).forEach(([method, operation]) => {
      const route = {
        method: method.toUpperCase(),
        url: path,
        schema: {
          response: resolveResponses(operation.responses)
        },
        handler: async (request, reply) => {
          if (method === 'get') {
            if (operation.responses['200'].description.includes('array')) {
              return getAll(model, model.name)(request, reply)
            } else {
              return getOne(model, model.name)(request, reply)
            }
          } else if (method === 'post') {
            return create(model, model.name)(request, reply)
          } else if (method === 'put') {
            return update(model, model.name)(request, reply)
          } else if (method === 'delete') {
            return remove(model, model.name)(request, reply)
          }
          reply.code(501).send({ error: 'Not implemented yet' })
        }
      }

      // if (operation.requestBody) {
      //   route.schema.body = {
      //     type: 'object',
      //     properties: toProperties(
      //       operation.requestBody.content['application/json'].schema
      //     )
      //   }
      // }

      // if (operation.parameters) {
      //   const query = operation.parameters.filter((p) => p.in === 'query')
      //   if (query.length > 0) {
      //     route.schema.querystring = queryToProperties(query)
      //   }
      // }

      fastify.route(route)
    })
  })
}
