module.exports = (pathSchema) => {
  const openapi = {
    openapi: '3.0.0',
    info: {
      title: process.env.APP_NAME || 'Fastapi',
      description: process.env.APP_DESCRIPTION || 'Fastapi',
      version: process.env.APP_VERSION || '1.0.0'
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:3000'
      }
    ],
    paths: resolvePaths(pathSchema)
  }

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

const resolvePaths = (schemas) => {
  Object.keys(schemas).forEach((path) => {
    schemas[path].servers = [
      {
        url: process.env.APP_URL || 'http://localhost:3000'
      }
    ]
  })
}
