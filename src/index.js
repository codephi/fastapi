require('dotenv').config()
const { fastify, start } = require('./middle/serve')
const { generateSchemas } = require('./engine/generateSchemas')
const { Example } = require('./models/Example')
const { createRoute } = require('./routes')
const tags = {
  list: ['List'],
  create: ['Create']
}

const url = 'http://localhost:3000'
const openApiSchema = generateSchemas(Example, tags)
createRoute({ fastify, paths: openApiSchema.paths, url, model: Example })

start((err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  fastify.log.info(`Server listening on ${address}`)
})
