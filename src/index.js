if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { fastify, start } = require('./middle/serve')
const { generateSchemas } = require('./engine/openapi')
const { Example } = require('./models/Example')
const { createRouteModel, createRouteHandler } = require('./engine/routes')
const tags = {
  list: ['List'],
  create: ['Create']
}

const openApiSchema = generateSchemas(Example, tags)
// createRouteModel({ fastify, paths: openApiSchema.paths, model: Example })

const health = require('./routes/health')
createRouteHandler({ fastify, ...health });

start((err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  fastify.log.info(`Server listening on ${address}`)
})
