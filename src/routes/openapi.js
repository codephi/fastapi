const { createFullDoc } = require('../engine/openapi/doc');

module.exports = (paths) => {
  const doc = createFullDoc(paths);

  return {
    doc,
    paths: {
      '/documentation/json': {
        get: {
          tags: ['Documentation'],
          summary: 'Get OpenAPI JSON',
          description: 'Get OpenAPI JSON',
        },
      },
    },
    handler: (_request, reply) => {
      reply.send(openapi);
    },
  };
};
