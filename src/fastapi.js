const { fastify, listen } = require('./middle/serve');
const { generateSchemas } = require('./engine/openapi');
const { createRouteModel, createRouteHandler } = require('./engine/routes');
const {
  databaseConnect,
  testDatabaseConnection,
  getSequelize,
} = require('./middle/database');
const { importModel } = require('./engine/sequelize/generateModel');
const health = require('./routes/health');
const builderOpeapi = require('./routes/openapi');

const setup = ({ model, tags }) => {
  const models = importModel(model);

  let openApiSchemaPaths = {};

  Object.keys(models).forEach((key) => {
    const paths = generateSchemas(models[key], tags).paths;

    createRouteModel({ paths, model: models[key] });

    openApiSchemaPaths = { ...openApiSchemaPaths, ...paths };
  });

  const openapi = builderOpeapi({
    ...openApiSchemaPaths,
    ...health.paths,
  });

  createRouteHandler({ ...health });
  createRouteHandler({ ...openapi });

  fastify.setErrorHandler(function (error, request, reply) {
    reply.send(error);
  });

  listen(async (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }

    fastify.log.info(`Server listening on ${address}`);

    if (process.env.DB_TEST_CONNECTION !== 'off') {
      try {
        await testDatabaseConnection();
        fastify.log.info('Database connection established');
      } catch (error) {
        fastify.log.error('Unable to connect to the database:', error);
        process.exit(1);
      }
    }

    console.log(fastify.printRoutes());
  });
};

module.exports = {
  setup,
  fastify,
  createRoute: createRouteHandler,
  databaseConnect,
  getSequelize,
};
