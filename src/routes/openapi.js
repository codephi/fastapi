const { createFullDoc } = require('../engine/openapi/doc')

module.exports = (paths) => {
  const openapi = createFullDoc(paths)

  return {
    paths: {
      '/documentation/json': {
        get: {
          tags: ['Documentation'],
          summary: 'Get OpenAPI JSON',
          description: 'Get OpenAPI JSON'
        }
      }
    },
    handler: (_request, reply) => {
      reply.send(openapi)
    }
  }
}
