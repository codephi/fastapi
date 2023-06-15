import { getAll, getOne, create, update, remove, RouteHandler } from './routes';
import { Resource } from '../sequelize';
import {
  Operation,
  Parameter,
  Path,
  Paths,
  Reference,
  RequestBody,
  Responses,
  Schema,
  Response,
  Properties
} from '../openapi/openapiTypes';
import { FastifyInstance, RouteOptions } from 'fastify';
import { makeResponses } from '../openapi/responses';
import { extractByMethod } from '../openapi/utils';

export enum MethodType {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch'
}

export interface HandlerMethods {
  getAll?: RouteHandler;
  getOne?: RouteHandler;
  create?: RouteHandler;
  update?: RouteHandler;
  remove?: RouteHandler;
}

export interface Handlers {
  [path: string]: HandlerMethods;
}

export interface ResourceProps {
  paths: Paths;
  handlers?: Handlers;
  resource: Resource;
}

export interface InnerOperation {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
}

function getOperations(value: Path): InnerOperation {
  return {
    get: value.get,
    post: value.post,
    put: value.put,
    delete: value.delete,
    patch: value.patch
  };
}

export interface Routes {
  [path: string]: Methods;
}

export interface Methods {
  get?: Route;
  post?: Route;
  put?: Route;
  delete?: Route;
  patch?: Route;
}

export interface Route extends Operation {
  handler: RouteHandler;
}

export function routesToPaths(routes: Routes): Paths {
  const paths: Paths = {};

  Object.keys(routes).forEach((path) => {
    paths[path] = {};
    const route = routes[path];

    if (route.get) {
      const { handler, ...get } = route.get;
      paths[path].get = get;
    }

    if (route.post) {
      const { handler, ...post } = route.post;
      paths[path].post = post;
    }

    if (route.put) {
      const { handler, ...put } = route.put;
      paths[path].put = put;
    }

    if (route.delete) {
      const { handler, ...del } = route.delete;
      paths[path].delete = del;
    }

    if (route.patch) {
      const { handler, ...patch } = route.patch;
      paths[path].patch = patch;
    }
  });

  return paths;
}

export class PathBuilder {
  private methods: Methods = {};
  private pathName: string;
  private parent: RoutesBuilder;
  private builded = false;

  constructor(parent: RoutesBuilder, pathName: string) {
    this.pathName = pathName;
    this.parent = parent;
  }

  get(route: Route) {
    this.methods.get = route;
    return this;
  }

  post(route: Route) {
    this.methods.post = route;
    return this;
  }

  put(route: Route) {
    this.methods.put = route;
    return this;
  }

  delete(route: Route) {
    this.methods.delete = route;
    return this;
  }

  patch(route: Route) {
    this.methods.patch = route;
    return this;
  }

  buildPath() {
    if (this.builded) {
      return;
    }

    this.builded = true;

    if (this.methods.get) {
      this.parent.addRoute(this.pathName, MethodType.GET, this.methods.get);
    }

    if (this.methods.post) {
      this.parent.addRoute(this.pathName, MethodType.POST, this.methods.post);
    }

    if (this.methods.put) {
      this.parent.addRoute(this.pathName, MethodType.PUT, this.methods.put);
    }

    if (this.methods.delete) {
      this.parent.addRoute(
        this.pathName,
        MethodType.DELETE,
        this.methods.delete
      );
    }

    if (this.methods.patch) {
      this.parent.addRoute(this.pathName, MethodType.PATCH, this.methods.patch);
    }
  }

  path(path: string): PathBuilder {
    this.buildPath();
    return new PathBuilder(this.parent, path);
  }

  responses(
    defaultSuccessStatusCode: number,
    successProperties: Properties,
    conflict = false
  ): Responses {
    return this.parent.responses(
      defaultSuccessStatusCode,
      successProperties,
      conflict
    );
  }

  build(): Routes {
    this.buildPath();
    return this.parent.build();
  }
}

export class RoutesBuilder {
  private routes: Routes = {};
  private resourceName: string;

  constructor(resourceName?: string) {
    this.resourceName = resourceName ?? 'default';
  }

  addRoute(path: string, method: MethodType, route: Route) {
    if (!this.routes[path]) {
      this.routes[path] = {};
    }

    this.routes[path][method] = route;
  }

  path(path: string): PathBuilder {
    const pathBuilder = new PathBuilder(this, path);
    return pathBuilder;
  }

  responses(
    defaultSuccessStatusCode: number,
    successProperties: Properties | Reference,
    conflict = false
  ): Responses {
    return makeResponses(
      this.resourceName,
      defaultSuccessStatusCode,
      successProperties,
      conflict
    );
  }

  build(): Routes {
    return this.routes;
  }
}

interface RouterInner {
  path: string;
  method: string;
  handler: RouteHandler;
  operation: Operation;
}

export class CreateRoutes {
  api: FastifyInstance;

  constructor(api: FastifyInstance) {
    this.api = api;
  }

  createRoutes(routes: Routes) {
    Object.entries(routes).forEach(([path, methods]: [string, Methods]) => {
      Object.entries(methods).forEach(([method, route]: [string, Route]) => {
        const { handler, ...operation } = route;
        this.createRouteInner({ path, method, operation, handler });
      });
    });
  }

  createRouteResource({ paths, resource, handlers }: ResourceProps) {
    Object.entries(paths).forEach(([path, value]: [string, Path]) => {
      const innerOperation = getOperations(value);

      Object.keys(innerOperation).forEach((method) => {
        const operation = extractByMethod(method, innerOperation) as Operation;

        if (!operation) {
          return;
        }

        const handler = this.getHandler(
          handlers,
          path,
          method,
          resource,
          operation
        );

        if (handler === undefined) {
          return;
        }

        this.createRouteInner({ path, method, operation, handler });
      });
    });
  }

  getHandler(
    handlers: Handlers | undefined,
    path: string,
    method: string,
    resource: Resource,
    operation: Operation
  ): RouteHandler {
    if (handlers !== undefined && handlers[path] !== undefined) {
      const handler = handlers[path];

      if (method === 'get') {
        if (
          operation['x-admin'] &&
          operation['x-admin'].types.includes('list')
        ) {
          return handler.getAll ?? getAll(resource);
        } else {
          return handler.getOne ?? getOne(resource);
        }
      } else if (method === 'post') {
        return handler.create ?? create(resource);
      } else if (method === 'put') {
        return handler.update ?? update(resource);
      } else if (method === 'delete') {
        return handler.remove ?? remove(resource);
      }
    } else {
      if (method === 'get') {
        if (
          operation['x-admin'] &&
          operation['x-admin'].types.includes('list')
        ) {
          return getAll(resource);
        } else {
          return getOne(resource);
        }
      } else if (method === 'post') {
        return create(resource);
      } else if (method === 'put') {
        return update(resource);
      } else if (method === 'delete') {
        return remove(resource);
      }
    }

    throw new Error(`Handler not found for ${method} ${path}`);
  }

  createRouteInner({ path, method, operation, handler }: RouterInner) {
    const route = {
      method: method.toUpperCase(),
      url: resolvePath(path),
      schema: {
        response: resolveResponses(operation.responses)
      },
      handler
    } as RouteOptions;

    if (route.schema !== undefined && operation.requestBody !== undefined) {
      const responseBody = operation.requestBody as RequestBody;
      const schema = responseBody.content['application/json'].schema as Schema;

      route.schema.body = responseToProperties(
        filterPropertiesRecursive(schema)
      );
    }

    if (
      route.schema !== undefined &&
      operation.requestBody !== undefined &&
      operation.parameters !== undefined
    ) {
      const query = operation.parameters?.filter((p: Parameter | Reference) => {
        try {
          const parameter = p as Parameter;
          return parameter.in === 'query';
        } catch (_) {
          return false;
        }
      }) as Parameter[];

      if (query.length > 0) {
        const querySchema = {
          type: 'object',
          properties: queryToProperties(query)
        };
        route.schema.querystring = querySchema;
      }
    }

    this.api.route(route);
  }
}

function queryToProperties(properties: Parameter[]) {
  const newProperties: { [key: string]: Schema } = {};
  properties.forEach(({ name, ...value }) => {
    newProperties[name] = value.schema as Schema;
  });
  return newProperties;
}

function responseToProperties(properties: Schema) {
  const newProperties: { [key: string]: Schema } = {};

  Object.entries(properties).forEach(([key, value]) => {
    newProperties[key] = propertiesToItems(value);
  });

  return newProperties;
}

function propertiesToItems(value: any) {
  if (value.type !== 'object' && value.properties !== undefined) {
    value.items = value.properties;
    delete value.properties;
  }

  return value;
}

function filterPropertiesRecursive(
  properties: Record<string, any>
): Properties {
  const newProperties: Properties = {};

  Object.entries(properties).forEach(([key, value]) => {
    if (key.startsWith('x-')) return;

    // value is Schema
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        newProperties[key] = filterPropertiesRecursive(value);
        return;
      }
    }

    newProperties[key] = value;
  });

  return newProperties;
}

export function resolveResponses(responses: Responses) {
  if (!responses) return {};

  const newResponses: { [key: string]: any } = {};

  Object.keys(responses).forEach((statusCode) => {
    const response = responses[parseInt(statusCode)] as Response;

    if (!response.content) return;

    const content = response.content['application/json'];

    if (!content) return;

    const schema = content.schema as Schema;
    const properties = schema.properties as Schema;

    newResponses[statusCode] = {
      description: response.description,
      type: 'object',
      properties: properties ? responseToProperties(properties) : undefined
    };
  });

  return newResponses;
}

function resolvePath(path: string) {
  const newPath = path.replace(/{/g, ':').replace(/}/g, '');
  return newPath;
}
