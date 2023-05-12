const fastify = require('fastify')({ logger: true })

const start = (callback) => {
  fastify.listen({
    port: process.env.PORT || 3000
  }, callback)
}

module.exports = {
  start,
  fastify
}
