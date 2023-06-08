declare module 'fastapi' {
  import { Model } from 'sequelize';
  import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
  export { Model } from 'sequelize';
  export { FastifyInstance, FastifyRequest, FastifyReply };

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
              $ref?: string;
              type?: string;
              properties?: {
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

  export type Models = {
    [name: string]: Model;
  };

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
    models: Models;
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
      sync?: 'alter' | 'force';
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
      action: EventType,
      callback: (err?: Error, data?: any) => void
    ): FastAPI;
    emit(moduleName: string, action: EventType, err: any, data: any): FastAPI;
    removeListener(moduleName: string, action: EventType): FastAPI;
  }

  export const listen: FastifyInstance['listen'];

  export type EventType = 'create' | 'update' | 'delete' | 'read' | 'list';
}
