const { getAll, getOne, create, update, remove } = require('./routes');
const { fastify } = require('../../middle/serve');

const queryToProperties = (properties) => {
  const newProperties = {};
  properties.forEach(({ name, ...value }) => {
    newProperties[name] = value.schema;
  });
  return newProperties;
};

const responseToProperties = (properties = {}) => {
  const newProperties = {};
  Object.entries(properties).forEach(([key, value]) => {
    newProperties[key] = propertiesToItems(value);
  });
  return newProperties;
};

const propertiesToItems = (value) => {
  if (value.type !== 'object' && value.properties !== undefined) {
    value.items = value.properties;
    delete value.properties;
  }

  return value;
};

const resolveResponses = (responses) => {
  if (!responses) return {};

  const response = {};
  Object.entries(responses).forEach(([code, { description, content }]) => {
    response[code] = {
      description,
      type: 'object',
      properties: responseToProperties(
        content['application/json'].schema.properties
      )
    };
  });
  return response;
};

const getRouteHandler = (method, model, operation) => {
  if (method === 'get') {
    if (operation['x-admin'].types.includes('list')) {
      return getAll(model);
    } else {
      return getOne(model);
    }
  } else if (method === 'post') {
    return create(model);
  } else if (method === 'put') {
    return update(model);
  } else if (method === 'delete') {
    return remove(model);
  }
};

const resolvePath = (path) => {
  const newPath = path.replace(/{/g, ':').replace(/}/g, '');
  return newPath;
};

const createRoute = ({ path, method, handler }) => {
  const [methodName, operation] = Object.entries(method)[0];

  const route = {
    method: methodName.toUpperCase(),
    url: resolvePath(path),
    schema: {
      response: resolveResponses(operation.responses)
    },
    handler
  };

  if (operation.requestBody) {
    route.schema.body = responseToProperties(
      operation.requestBody.content['application/json'].schema
    );
  }

  if (operation.parameters) {
    const query = operation.parameters.filter((p) => p.in === 'query');
    if (query.length > 0) {
      const querySchema = {
        type: 'object',
        properties: queryToProperties(query)
      };
      route.schema.querystring = querySchema;
    }
  }

  fastify.route(route);
};

const createRouteModel = ({ paths, model, handlers }) => {
  Object.entries(paths).forEach(([path, operations]) => {
    Object.entries(operations).forEach(([method, operation]) => {
      const handler =
        handlers && handlers[method]
          ? handlers[method]
          : getRouteHandler(method, model, operation);

      createRoute({ fastify, path, method: { [method]: operation }, handler });
    });
  });
};

const createRouteHandler = ({ paths, handler }) => {
  Object.entries(paths).forEach(([path, operations]) => {
    Object.entries(operations).forEach(([method, operation]) => {
      if (!['get', 'post', 'put', 'delete'].includes(method)) return;
      createRoute({ fastify, path, method: { [method]: operation }, handler });
    });
  });
};

module.exports.createRouteHandler = createRouteHandler;
module.exports.createRouteModel = createRouteModel;
