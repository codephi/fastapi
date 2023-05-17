const fastify = require('fastify')({ logger: true });

const listen = (callback) => {
  fastify.listen(
    {
      port: 3000
    },
    callback
  );
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
