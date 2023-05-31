const fastify = require('fastify')({ logger: true });

const listen = (config, callback) => {
  fastify.listen(config, callback);
};

const preBuilder = () => {
  fastify.register(require('@fastify/cors'), {
    origin: '*'
  });
};

module.exports = {
  preBuilder,
  listen,
  fastify
};
