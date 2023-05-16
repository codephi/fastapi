const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cors'), {
  origin: '*',
});

const start = (callback) => {
  fastify.listen(
    {
      port: 3000,
    },
    callback,
  );
};

module.exports = {
  start,
  fastify,
};
