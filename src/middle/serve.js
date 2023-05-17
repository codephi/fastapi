const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cors'), {
  origin: '*',
});

const listen = (callback) => {
  fastify.listen(
    {
      port: 3000,
    },
    callback,
  );
};

module.exports = {
  listen,
  fastify,
};
