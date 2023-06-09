import { preBuilder } from './middle/serve';
import {
  FastifyRequest,
  FastifyReply,
  RouteHandlerMethod,
  FastifyInstance,
  RawServerDefault,
  FastifyBaseLogger,
  FastifyTypeProviderDefault
} from 'fastify';
import { generateOpenapiSchemas } from './resources/openapi';
import {
  Handlers,
  Routes,
  createRouteResource,
  createRoutes
} from './resources/routes';
import { makeResponses } from './resources/openapi/responses';
import { createTables } from './resources/sequelize/createTables';
import {
  databaseConnect,
  testDatabaseConnection,
  global,
  DatabaseConnect
} from './middle/database';
import { Resources, Schema, importResources } from './resources/sequelize';
import health from './routes/health';
import builderOpeapi from './routes/openapi';
import { on, emit, remove, EventCallback } from './resources/events';
import { Paths } from './resources/openapi/openapiTypes';
import { api } from './middle/serve';
import { SyncOptions } from 'sequelize';
import exp from 'constants';
import { IncomingMessage, ServerResponse } from 'http';

interface LoadSpecOptions {
  resources: Resources;
  tags?: Tags;
  routes?: Routes[];
  handlers?: Handlers;
}

interface FastAPIConfig {
  port: number;
  address: string;
}

interface FastAPIOptions {
  routes?: Routes[];
  tags?: Tags;
  handlers?: Handlers;
  schema?: string | Schema;
  resources?: Resources;
  database?: DatabaseOptions;
  cors?: Cors;
  forceCreateTables?: boolean;
  config?: FastAPIConfig;
}

export enum DatabaseSync {
  FORCE = 'force',
  ALTER = 'alter',
  NONE = 'none'
}

export interface DatabaseOptions {
  database: string | null;
  username: string | null;
  password: string | null;
  options?: any;
  sync: DatabaseSync;
  testConnection: boolean;
}

export interface Cors {
  origin: string;
}

export interface Tags {
  create: string[];
  read: string[];
  update: string[];
  delete: string[];
  list: string[];
}

class FastAPI {
  config: FastAPIConfig = {
    port: 3000,
    address: '0.0.0.0'
  };
  routes: Routes[] = [];
  tags: Tags = {
    create: ['create'],
    read: ['read'],
    update: ['update'],
    delete: ['delete'],
    list: ['list']
  };
  handlers: Handlers = {};
  schema?: string | Schema;
  resources: Resources = {};
  database: DatabaseOptions = {
    database: process.env.DB_NAME || process.env.DATABASE_NAME || null,
    username: process.env.DB_USER || process.env.DATABASE_USER || null,
    password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || null,
    options: {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: (sql: string) => {
        api.log.info(sql);
      }
    },
    sync: DatabaseSync.NONE,
    testConnection: true
  };
  cors: Cors = {
    origin: '*'
  };
  forceCreateTables = false;
  api = api;

  constructor(props?: FastAPIOptions) {
    if (props === undefined) return;

    if (props.schema !== undefined) {
      this.schema = props.schema;
    }

    if (props.routes !== undefined) {
      this.routes = props.routes;
    }

    if (props.handlers !== undefined) {
      this.handlers = props.handlers;
    }

    if (props.tags !== undefined) {
      this.tags = props.tags;
    }

    if (props.database !== undefined) {
      this.database = { ...this.database, ...props.database };
    }

    if (props.cors !== undefined) {
      this.cors = props.cors;
    }

    if (props.forceCreateTables) {
      this.forceCreateTables = props.forceCreateTables;
    }

    if (props.config !== undefined) {
      this.config = props.config;
    }

    return this;
  }

  loadSpec({
    resources,
    tags,
    routes = [],
    handlers = {}
  }: LoadSpecOptions): void {
    const resourcesImported = resources as Resources;

    let openApiSchemaPaths: Paths = {};

    Object.keys(resourcesImported).forEach((key) => {
      const paths = generateOpenapiSchemas(resourcesImported[key], tags)
        .paths as Paths;

      createRouteResource({
        paths,
        resource: resourcesImported[key],
        handlers: handlers
      });

      openApiSchemaPaths = { ...openApiSchemaPaths, ...paths } as Paths;
    });

    let paths = {} as Paths;

    routes.forEach((route) => {
      createRoutes({ ...route });
      paths = { ...paths, ...route } as Paths;
    });

    createRoutes(health);

    const healthPaths = health.paths as Paths;

    const openapi = builderOpeapi({
      ...openApiSchemaPaths,
      ...healthPaths,
      ...paths
    });

    createRoutes({ ...openapi });

    this.api.setErrorHandler(function (
      error: any,
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      reply.send(error);
    });
  }

  load(callback?: (err?: any) => void): void {
    databaseConnect({
      ...this.database
    } as DatabaseConnect);

    const { schema, routes, tags, handlers, database } = this;

    if (schema) {
      this.resources = importResources(schema);
    }

    if (this.database.sync !== DatabaseSync.NONE) {
      const createTablesConfig: SyncOptions = {};

      if (database.sync === DatabaseSync.ALTER) {
        createTablesConfig.alter = true;
      } else if (database.sync === DatabaseSync.FORCE) {
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

  builder(routes: Routes[], tags: Tags, handlers: Handlers): void {
    preBuilder();

    this.loadSpec({
      routes,
      tags,
      handlers,
      resources: this.resources
    });
  }

  defaultListen(err?: any): void {
    if (err) {
      this.api.log.error(err);
      process.exit(1);
    }
  }

  listen(callback?: (err?: any) => void): void {
    this.api.listen(this.config, callback || this.defaultListen);
  }

  start(callback?: (err?: any) => void): void {
    this.load((err) => {
      if (err) {
        if (callback) return callback(err);
        return;
      }

      this.listen(callback);
    });
  }

  setDataBase(database: any): FastAPI {
    this.database = { ...this.database, ...database };
    return this;
  }

  addRoutes(routes: Routes): FastAPI {
    this.routes.push(routes);
    return this;
  }

  on(modelName: string, action: string, callback: EventCallback): FastAPI {
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
