const { fastify, listen: serveListen, preBuilder } = require('./middle/serve');
const { generateSchemas } = require('./resources/openapi');
const { createRouteModel, createRouteHandler } = require('./resources/routes');
const { resolveResponses } = require('./resources/openapi/generateSchema');
const { createTables } = require('./resources/sequelize/createTables');
const {
  databaseConnect,
  testDatabaseConnection,
  getSequelize
} = require('./middle/database');
const { importModel } = require('./resources/sequelize/generateModel');
const health = require('./routes/health');
const builderOpeapi = require('./routes/openapi');
const { on, emit, remove } = require('./resources/events');

const loadSpec = ({ model, models, tags, routes = [], handlers = {} }) => {
  if (models === undefined) {
    if (model !== undefined) {
      models = importModel(model);
    } else {
      throw new Error('No model provided');
    }
  }

  let openApiSchemaPaths = {};

  Object.keys(models).forEach((key) => {
    const paths = generateSchemas(models[key], tags).paths;

    createRouteModel({ paths, model: models[key], handlers: handlers[key] });

    openApiSchemaPaths = { ...openApiSchemaPaths, ...paths };
  });

  const paths = routes.map((route) => {
    createRouteHandler({ ...route });
    return route.paths;
  });

  createRouteHandler({ ...health });

  const openapi = builderOpeapi({
    ...openApiSchemaPaths,
    ...health.paths,
    ...paths
  });

  createRouteHandler({ ...openapi });

  fastify.setErrorHandler(function (error, request, reply) {
    reply.send(error);
  });
};

class FastAPI {
  config = {
    port: 3000,
    address: '0.0.0.0'
  };
  routes = [];
  tags = {
    create: ['create'],
    read: ['read'],
    update: ['update'],
    delete: ['delete'],
    list: ['list']
  };
  handlers = {};
  model = null;
  models = {};
  database = {
    database: process.env.DB_NAME | process.env.DATABASE_NAME | null,
    username: process.env.DB_USER | process.env.DATABASE_USER | null,
    password: process.env.DB_PASSWORD | process.env.DATABASE_PASSWORD | null,
    options: {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: (sql) => {
        fastify.log.info(sql);
      }
    },
    sync: null,
    testConnection: true
  };
  cors = {
    origin: '*'
  };

  constructor(props) {
    if (props === undefined) return;
    const {
      routes = undefined,
      tags = undefined,
      handlers = undefined,
      model = undefined,
      database = undefined,
      cors = undefined,
      forceCreateTables = undefined,
      config = undefined
    } = props;

    if (model !== undefined) {
      this.model = model;
    }

    if (routes !== undefined) {
      this.routes = routes;
    }

    if (handlers !== undefined) {
      this.handlers = handlers;
    }

    if (tags !== undefined) {
      this.tags = tags;
    }

    if (database !== undefined) {
      this.database = { ...this.database, ...database };
    }

    if (cors !== undefined) {
      this.cors = cors;
    }

    if (forceCreateTables) {
      this.forceCreateTables = forceCreateTables;
    }

    if (config !== undefined) {
      this.config = config;
    }

    return this;
  }

  load(callback) {
    databaseConnect(this.database);

    const { model, routes, tags, handlers, database } = this;

    this.models = importModel(model);

    if (this.database.sync !== false) {
      const createTablesConfig = {};

      if (database.sync === 'alter') {
        createTablesConfig.alter = true;
      } else if (database.sync === 'force') {
        createTablesConfig.force = true;
      }

      testDatabaseConnection()
        .then(() => {
          createTables(createTablesConfig).then(() => {
            this.builder(routes, tags, handlers);
            if (callback) {
              callback();
            }
          });
        })
        .catch((err) => {
          if (callback) {
            callback(err);
          } else {
            throw Error(err);
          }
        });
    } else {
      this.builder(routes, tags, handlers);
      if (callback) {
        callback();
      }
    }
  }

  builder(routes, tags, handlers) {
    preBuilder();

    loadSpec({
      routes,
      tags,
      handlers,
      models: this.models
    });
  }

  defaultListen(err) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }

  listen(callback) {
    serveListen(this.config, callback || this.defaultListen);
  }

  start(callback) {
    this.load((err) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }

      this.listen(callback);
    });
  }

  setDataBase(database) {
    this.database = { ...this.database, ...database };
    return this;
  }

  setModel(model) {
    this.model = model;
    return this;
  }

  addRoutes(name, specMethods, handler) {
    this.routes.push({ paths: { [name]: specMethods }, handler });
    return this;
  }

  addRoute(path, method, specMethod, handler) {
    this.routes.push({ paths: { [path]: { [method]: specMethod } }, handler });
    return this;
  }

  get(path, spec, handler) {
    this.addRoute(path, 'get', spec, handler);
    return this;
  }

  post(path, spec, handler) {
    this.addRoute(path, 'post', spec, handler);
    return this;
  }

  put(path, spec, handler) {
    this.addRoute(path, 'put', spec, handler);
    return this;
  }

  delete(path, spec, handler) {
    this.addRoute(path, 'delete', spec, handler);
    return this;
  }

  patch(path, spec, handler) {
    this.addRoute(path, 'patch', spec, handler);
    return this;
  }

  setHandler(name, handler) {
    this.handlers[name] = handler;
    return this;
  }

  setTags(name, tags) {
    this.tags[name] = tags;
    return this;
  }

  getModels() {
    return this.models;
  }

  on(modelName, action, callback) {
    on(modelName, action, callback);
    return this;
  }

  emit(modelName, action, err, data) {
    emit(modelName, action, err, data);
    return this;
  }

  removeListener(modelName, action) {
    remove(modelName, action);
    return this;
  }
}

module.exports = {
  fastify,
  preBuilder,
  createRoute: createRouteHandler,
  databaseConnect,
  getSequelize,
  loadSpec,
  listen: serveListen,
  createRouteModel,
  importModel,
  builderOpeapi,
  createTables,
  resolveResponses,
  FastAPI,
  log: fastify.log
};
