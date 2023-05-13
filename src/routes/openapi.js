module.exports = (schemas) => {
  return [
    {
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
        const openapi = {
          openapi: '3.0.0',
          info: {
            title: process.env.APP_NAME || 'Fastapi',
            description: process.env.APP_DESCRIPTION || 'Fastapi',
            version: process.env.APP_VERSION || '1.0.0'
          },
          paths: schemas
        }

        reply.send(openapi)
      }
    },
    {
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
        const openapi = {
          openapi: '3.0.0',
          info: {
            title: process.env.APP_NAME || 'Fastapi',
            description: process.env.APP_DESCRIPTION || 'Fastapi',
            version: process.env.APP_VERSION || '1.0.0'
          },
          paths: schemas
        }

        reply.send(openapi)
      }
    }
  ]
}
