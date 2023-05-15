if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const tags = {
  create: ['create'],
  read: ['read'],
  update: ['update'],
  delete: ['Delete'],
  list: ['list'],
};

const { fastify, start } = require('./middle/serve');
const { generateSchemas } = require('./engine/openapi');
const { createRouteModel, createRouteHandler } = require('./engine/routes');
const { testDatabaseConnection } = require('./middle/database');
const { importModel } = require('./engine/sequelize/generateModel');
const models = importModel();

let openApiSchemaPaths = {};
Object.keys(models).forEach((key) => {
  const paths = generateSchemas(models[key], tags).paths;

  createRouteModel({ paths, model: models[key] });

  openApiSchemaPaths = { ...openApiSchemaPaths, ...paths };
});

const health = require('./routes/health');

const openapi = require('./routes/openapi')({
  ...openApiSchemaPaths,
  ...health.paths,
});

createRouteHandler({ ...health });
createRouteHandler({ ...openapi });

start(async (err, address) => {
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
