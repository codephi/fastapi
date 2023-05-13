if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { fastify, start } = require('./middle/serve')
const { generateSchemas } = require('./engine/openapi')
const { Example } = require('./models/Example')
const { createRouteModel, createRouteHandler } = require('./engine/routes')
const { testDatabaseConnection } = require('./middle/database')

const tags = {
  list: ['List'],
  create: ['Create']
}

const openApiSchema = generateSchemas(Example, tags)
createRouteModel({ fastify, paths: openApiSchema.paths, model: Example })

const health = require('./routes/health')
createRouteHandler({ fastify, ...health })

const openapi = require('./routes/openapi')({ ...openApiSchema.paths, ...health.paths })
createRouteHandler({ fastify, ...openapi })

start(async (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  fastify.log.info(`Server listening on ${address}`)

  if (process.env.DB_EST_CONNECTION_OFF === 'true') {
    try {
      await testDatabaseConnection()
      fastify.log.info('Database connection established')
    } catch (error) {
      fastify.log.error('Unable to connect to the database:', error)
      process.exit(1)
    }
  }
})
