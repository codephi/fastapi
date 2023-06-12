import api from './middle/serve';
import {
  FastifyRequest,
  FastifyReply,
  FastifyListenOptions,
  FastifyInstance
} from 'fastify';
import { Tags, generateOpenapiSchemas } from './resources/openapi';
import {
  Handlers,
  Methods,
  PathBuilder,
  Route,
  Routes,
  RoutesBuilder,
  CreateRoutes,
  routesToPaths
} from './resources/routes';
import { createTables } from './resources/sequelize/createTables';
import {
  databaseConnect,
  testDatabaseConnection,
  DatabaseConnect,
  setGlobalSequelize
} from './middle/database';
import {
  Resource,
  Resources,
  Schema,
  SequelizeModel,
  importResources
} from './resources/sequelize';
import healthRoute from './routes/health';
import builderOpeapi from './routes/openapi';
import { on, emit, remove, EventCallback } from './resources/events';
import { OpenAPI, Paths } from './resources/openapi/openapiTypes';
import { Sequelize, SyncOptions } from 'sequelize';
import { promisify } from 'util';
import log from './resources/log';

export interface LoadSpecOptions {
  resources: Resources;
  tags?: Tags;
  routes?: Routes[];
  handlers?: Handlers;
}

export interface FastAPIOptions {
  routes?: Routes[];
  tags?: Tags;
  handlers?: Handlers;
  schema?: string | Schema;
  resources?: Resources;
  database?: DatabaseOptions;
  cors?: Cors;
  forceCreateTables?: boolean;
  listen?: FastifyListenOptions;
}

export interface DatabaseOptions {
  database?: string | null;
  username?: string | null;
  password?: string | null;
  sync?: SyncOptions;
  testConnection?: boolean;
  host?: string;
  port?: number;
  dialect?: string;
  logging?: (sql: string) => void;
}

export interface Cors {
  origin: string;
}

export interface Models {
  [key: string]: typeof SequelizeModel;
}

export class FastAPI {
  listenConfig: FastifyListenOptions = {
    port: 3000,
    host: '0.0.0.0'
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
  private schema?: string | Schema;
  resources: Resources = {};
  models: Models = {};
  database: DatabaseOptions = {
    database: process.env.DB_NAME || process.env.DATABASE_NAME || null,
    username: process.env.DB_USER || process.env.DATABASE_USER || null,
    password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || null,
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: undefined,
    sync: {
      force: false
    },
    testConnection: true
  };
  cors: Cors = {
    origin: '*'
  };
  forceCreateTables = false;
  api: FastifyInstance;
  private databaseLoaded = false;
  private listen: (options: FastifyListenOptions) => Promise<void>;

  constructor(props?: FastAPIOptions) {
    if (props) {
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

      if (props.listen !== undefined) {
        this.listenConfig = props.listen;
      }
    }

    this.api = api();
    this.listen = promisify(this.api.listen.bind(this.api));

    return this;
  }

  private databaseInstance() {
    if (this.databaseLoaded) return;

    const { database, password, username, ...options } = this.database;

    databaseConnect({
      database,
      password,
      username,
      options
    } as DatabaseConnect);

    this.databaseLoaded = true;
  }

  setDatabaseInstance(database: Sequelize): void {
    setGlobalSequelize(database);
    this.databaseLoaded = true;
  }

  setSchema(schema: string | Schema): void {
    this.schema = schema;
  }

  loadSchema(schema?: string | Schema): void {
    this.databaseInstance();

    if (schema === undefined) {
      schema = this.schema;
    }

    if (schema) {
      this.resources = importResources(schema);

      for (const key in this.resources) {
        const resource = this.resources[key];
        this.models[modelName(resource.name)] = resource.model;
      }
    } else {
      throw new Error('Schema not found');
    }
  }

  loadRoutes(): void {
    let shemasPaths: Paths = {};

    const resources = this.resources;
    const tags = this.tags;
    const handlers = this.handlers;

    const createRoutes = new CreateRoutes(this.api);

    Object.keys(resources).forEach((key) => {
      const paths = generateOpenapiSchemas(resources[key], tags).paths as Paths;

      createRoutes.createRouteResource({
        paths,
        resource: resources[key],
        handlers
      });

      shemasPaths = { ...shemasPaths, ...paths } as Paths;
    });

    let paths = {} as Paths;

    this.routes.forEach((route) => {
      createRoutes.createRoutes({ ...route });
      paths = { ...paths, ...routesToPaths(route) };
    });

    const health = healthRoute();

    createRoutes.createRoutes(health);

    const healthPaths = routesToPaths(health);

    const openapi = builderOpeapi({
      ...shemasPaths,
      ...healthPaths,
      ...paths
    });

    createRoutes.createRoutes(openapi);

    createRoutes.api.setErrorHandler(function (
      error: any,
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      reply.send(error);
    });
  }

  load() {
    this.loadSchema();
    this.loadRoutes();
  }

  setDatabase(database: DatabaseOptions): FastAPI {
    this.database = { ...this.database, ...database };
    return this;
  }

  async connect(): Promise<void> {
    const { database } = this;

    if (this.database.sync !== undefined) {
      const createTablesConfig: SyncOptions = {};

      if (database.sync.alter === true) {
        createTablesConfig.alter = true;
      } else if (database.sync.force === true) {
        createTablesConfig.force = true;
      }

      await testDatabaseConnection();
      await createTables(createTablesConfig);
    }
  }

  async start(): Promise<void> {
    await this.connect();
    await this.listen(this.listenConfig);
  }

  //Resources
  getResource(resourceName: string): Resource {
    return this.resources[resourceName];
  }

  // Routes
  addRoutes(routes: Routes | RoutesBuilder | PathBuilder): FastAPI {
    if (routes instanceof RoutesBuilder || routes instanceof PathBuilder) {
      routes = routes.build();
    }

    this.routes.push(routes);
    return this;
  }

  path(path: string, options: Methods): FastAPI {
    this.addRoutes({
      [path]: options
    });

    return this;
  }

  get(path: string, options: Route): FastAPI {
    return this.path(path, {
      get: options
    });
  }

  post(path: string, options: Route): FastAPI {
    return this.path(path, {
      post: options
    });
  }

  put(path: string, options: Route): FastAPI {
    return this.path(path, {
      put: options
    });
  }

  delete(path: string, options: Route): FastAPI {
    return this.path(path, {
      delete: options
    });
  }

  patch(path: string, options: Route): FastAPI {
    return this.path(path, {
      patch: options
    });
  }

  // Events
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

export { PathBuilder, RoutesBuilder } from './resources/routes';
export { makeResponses } from './resources/openapi/responses';
export { SchemaBuilder, AutoColumn } from './resources/sequelize/builder';
export { SequelizeModel as Model, Tags, log };
export { FastifyReply as Reply, FastifyRequest as Request };

export function modelName(text: string): string {
  const name = text.charAt(0).toUpperCase();

  // se terminar com s, remove a ultima letra
  if (text[text.length - 1] === 's') {
    return name + text.slice(1, -1);
  }

  return name + text.slice(1);
}
