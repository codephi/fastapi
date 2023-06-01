declare module 'fastapi' {
  import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

  export interface FastAPIOptions {
    model?: string | ModelProps;
    config?: any;
    forceCreateTables?: boolean;
    database?: {
      database?: string;
      username?: string;
      password?: string;
      sync?: 'alter' | 'force';
    };
  }

  export interface RouteOptions {
    tags?: string[];
    summary?: string;
    description?: string;
    responses?: {
      [statusCode: number]: {
        description: string;
        content: {
          [contentType: string]: {
            schema: {
              type: string;
              properties: {
                [propertyName: string]: {
                  type: string;
                };
              };
            };
          };
        };
      };
    };
  }

  export type RequestHandler = (
    request: FastifyRequest,
    reply: FastifyReply
  ) => Promise<any>;

  export class FastAPI {
    constructor(options?: FastAPIOptions);
    routes: {
      paths: {
        [path: string]: {
          [method: string]: RouteOptions;
        };
      };
      handler: RequestHandler;
    }[];
    tags: {
      [name: string]: string[];
    };
    handlers: {
      [name: string]: RequestHandler;
    };
    model: string | ModelProps | null;
    models: {
      [name: string]: any;
    };
    database: {
      database: string | null;
      username: string | null;
      password: string | null;
      sync: 'alter' | 'force' | null;
    };
    cors: {
      origin: string;
    };

    load(callback?: (err?: Error) => void): void;
    builder(
      routes: {
        paths: {
          [path: string]: {
            [method: string]: RouteOptions;
          };
        };
        handler: RequestHandler;
      }[],
      tags: {
        [name: string]: string[];
      },
      handlers: {
        [name: string]: RequestHandler;
      }
    ): void;
    private defaultListen(err: Error, address?: string): void;
    listen(callback?: (err?: Error, address?: string) => void): void;
    start(callback?: (err?: Error, address?: string) => void): void;
    setDataBase(database: {
      database?: string;
      username?: string;
      password?: string;
    }): FastAPI;
    setModel(model: string): FastAPI;
    addRoutes(
      name: string,
      specMethods: RouteOptions,
      handler: RequestHandler
    ): FastAPI;
    addRoute(
      path: string,
      method: string,
      specMethod: RouteOptions,
      handler: RequestHandler
    ): FastAPI;
    get(path: string, spec: RouteOptions, handler: RequestHandler): FastAPI;
    post(path: string, spec: RouteOptions, handler: RequestHandler): FastAPI;
    put(path: string, spec: RouteOptions, handler: RequestHandler): FastAPI;
    delete(path: string, spec: RouteOptions, handler: RequestHandler): FastAPI;
    patch(path: string, spec: RouteOptions, handler: RequestHandler): FastAPI;
    setHandler(name: string, handler: RequestHandler): FastAPI;
    setTags(name: string, tags: string[]): FastAPI;
    getModels(): { [name: string]: any };
    on(
      moduleName: string,
      action: string,
      callback: (err?: Error, data?: any) => void
    ): FastAPI;
    emit(moduleName: string, action: string, err: any, data: any): FastAPI;
    removeListener(moduleName: string, action: string): FastAPI;
  }

  export const listen: FastifyInstance['listen'];

  export interface ModelProps {
    tables: TableProps[];
  }

  export interface TableProps {
    name: string;
    metadata: MetadataProps;
    columns: ColumnProps[];
  }

  export interface MetadataProps {
    search: string[];
    label: string;
  }

  export interface ColumnProps {
    name: string;
    type: string;
    constraints: string[];
    autoIncrement?: boolean;
    values?: string[];
    min?: number;
    max?: number;
    imutable?: boolean;
    required?: boolean;
    unique?: boolean;
    defaultValue?: any;
    reference?: string;
    primaryKey?: boolean;
    allowNull?: boolean;
  }

  export class TableBuilder {
    name: string;
    metadata: MetadataProps;
    columns: ColumnProps[];
    constructor(name: string);
    addMetadata(metadata: MetadataProps): TableBuilder;
    addColumn(column: ColumnProps): TableBuilder;
    build(): TableProps;
  }

  export class ModelBuilder {
    tables: TableBuilder[];
    constructor();
    addTable(table: TableBuilder): ModelBuilder;
    build(): ModelProps;
  }
}