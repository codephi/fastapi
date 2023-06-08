import { preBuilder } from './middle/serve';
import { FastifyRequest, FastifyReply, RouteHandlerMethod } from 'fastify';
import { generateOpenapiSchemas } from './resources/openapi';
import { createRouteResource, createRouteHandler } from './resources/routes';
import { resolveResponses } from './resources/openapi/responses';
import { createTables } from './resources/sequelize/createTables';
import {
  databaseConnect,
  testDatabaseConnection,
  getSequelize
} from './middle/database';
import { Resources, importResources } from './resources/sequelize';
import health from './routes/health';
import builderOpeapi from './routes/openapi';
import { on, emit, remove } from './resources/events';
import { Paths } from './resources/openapi/openapiTypes';

interface LoadSpecOptions {
  schemaPath?: string;
  resources?: Resources;
  tags?: string[];
  routes?: any[];
  handlers?: any;
}

const loadSpec = ({
  schemaPath,
  resources,
  tags,
  routes = [],
  handlers = {}
}: LoadSpecOptions): void => {
  if (resources === undefined) {
    if (schemaPath !== undefined) {
      resources = importResources(schemaPath);
    } else {
      throw new Error('No schema provided');
    }
  }

  const resourcesImported = resources as Resources;

  let openApiSchemaPaths: any = {};

  Object.keys(resourcesImported).forEach((key) => {
    const paths = generateOpenapiSchemas(resourcesImported[key], tags)
      .paths as Paths;

    createRouteResource({
      paths,
      resource: resourcesImported[key],
      handlers: handlers[key]
    });

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

  fastify.setErrorHandler(function (
    error: any,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    reply.send(error);
  });
};

interface FastAPIConfig {
  port: number;
  address: string;
}

interface FastAPIOptions {
  routes?: any[];
  tags?: any;
  handlers?: any;
  model?: any;
  database?: any;
  cors?: any;
  forceCreateTables?: any;
  config?: FastAPIConfig;
}

class FastAPI {
  config: FastAPIConfig = {
    port: 3000,
    address: '0.0.0.0'
  };
  routes: any[] = [];
  tags = {
    create: ['create'],
    read: ['read'],
    update: ['update'],
    delete: ['delete'],
    list: ['list']
  };
  handlers: any = {};
  model: any = null;
  models: any = {};
  database = {
    database: process.env.DB_NAME || process.env.DATABASE_NAME || null,
    username: process.env.DB_USER || process.env.DATABASE_USER || null,
    password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || null,
    options: {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: (sql: string) => {
        fastify.log.info(sql);
      }
    },
    sync: null,
    testConnection: true
  };
  cors = {
    origin: '*'
  };

  constructor(props?: FastAPIOptions) {
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

  load(callback?: (err?: any) => void): void {
    databaseConnect(this.database);

    const { model, routes, tags, handlers, database } = this;

    this.models = importModel(model);

    if (this.database.sync !== false) {
      const createTablesConfig: any = {};

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

  builder(routes: any[], tags: any, handlers: any): void {
    preBuilder();

    loadSpec({
      routes,
      tags,
      handlers,
      models: this.models
    });
  }

  defaultListen(err?: any): void {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }

  listen(callback?: (err?: any) => void): void {
    serveListen(this.config, callback || this.defaultListen);
  }

  start(callback?: (err?: any) => void): void {
    this.load((err) => {
      if (err) {
        return callback(err);
      }

      this.listen(callback);
    });
  }

  setDataBase(database: any): FastAPI {
    this.database = { ...this.database, ...database };
    return this;
  }

  setModel(model: any): FastAPI {
    this.model = model;
    return this;
  }

  addRoutes(
    name: string,
    specMethods: any,
    handler: RouteHandlerMethod
  ): FastAPI {
    this.routes.push({ paths: { [name]: specMethods }, handler });
    return this;
  }

  addRoute(
    path: string,
    method: string,
    specMethod: any,
    handler: RouteHandlerMethod
  ): FastAPI {
    this.routes.push({ paths: { [path]: { [method]: specMethod } }, handler });
    return this;
  }

  get(path: string, spec: any, handler: RouteHandlerMethod): FastAPI {
    this.addRoute(path, 'get', spec, handler);
    return this;
  }

  post(path: string, spec: any, handler: RouteHandlerMethod): FastAPI {
    this.addRoute(path, 'post', spec, handler);
    return this;
  }

  put(path: string, spec: any, handler: RouteHandlerMethod): FastAPI {
    this.addRoute(path, 'put', spec, handler);
    return this;
  }

  delete(path: string, spec: any, handler: RouteHandlerMethod): FastAPI {
    this.addRoute(path, 'delete', spec, handler);
    return this;
  }

  patch(path: string, spec: any, handler: RouteHandlerMethod): FastAPI {
    this.addRoute(path, 'patch', spec, handler);
    return this;
  }

  setHandler(name: string, handler: RouteHandlerMethod): FastAPI {
    this.handlers[name] = handler;
    return this;
  }

  setTags(name: string, tags: any): FastAPI {
    this.tags[name] = tags;
    return this;
  }

  getModels(): any {
    return this.models;
  }

  on(modelName: string, action: string, callback: Function): FastAPI {
    on(modelName, action, callback);
    return this;
  }

  emit(modelName: string, action: string, err: any, data: any): FastAPI {
    emit(modelName, action, err, data);
    return this;
  }

  removeListener(modelName: string, action: string): FastAPI {
    remove(modelName, action);
    return this;
  }
}

class TableBuilder {
  name: string;
  metadata: any = {};
  columns: any[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addMetadata(metadata: any): TableBuilder {
    this.metadata = metadata;
    return this;
  }

  addColumn(column: any): TableBuilder {
    this.columns.push(column);
    return this;
  }

  build(): any {
    return {
      name: this.name,
      metadata: this.metadata,
      columns: this.columns
    };
  }
}

class ModelBuilder {
  model: any = { tables: [] };

  addTable(table: TableBuilder): ModelBuilder {
    this.model.tables.push(table.build());
    return this;
  }

  build(): any {
    return this.model;
  }
}
