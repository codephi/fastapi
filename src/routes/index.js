const { getAll, getOne, create, update, remove } = require('./routes')

module.exports.createRoute = ({ fastify, paths, model }) => {
  Object.entries(paths).forEach(([path, operations]) => {
    Object.entries(operations).forEach(([method, operation]) => {
      const route = {
        method: method.toUpperCase(),
        url: path,
        schema: {
          params: operation.parameters
            ? operation.parameters.filter((p) => p.in === 'path')
            : undefined,
          query: operation.parameters
            ? operation.parameters.filter((p) => p.in === 'query')
            : undefined,
          body: operation.requestBody
            ? operation.requestBody.content['application/json'].schema
            : undefined,
          response: Object.fromEntries(
            Object.entries(operation.responses).map(
              ([statusCode, response]) => [
                statusCode,
                response.content['application/json'].schema
              ]
            )
          )
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

      fastify.route(route)
    })
  })
}
