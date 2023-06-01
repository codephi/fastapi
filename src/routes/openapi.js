const { createFullDoc } = require('../resources/openapi/doc');

module.exports = (paths) => {
  const doc = createFullDoc(paths);

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
      reply.send(doc);
    }
  };
};
