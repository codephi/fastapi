import { getAll, getOne, create, update, remove, RouteHandler } from './routes';
import { api } from '../../middle/serve';
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
  Server,
  Response
} from '../openapi/openapiTypes';
import { RouteOptions } from 'fastify';

export interface Handlers {
  get?: RouteHandler;
  post?: RouteHandler;
  put?: RouteHandler;
  delete?: RouteHandler;
  patch?: RouteHandler;
}

export interface ResourceProps {
  paths: Paths;
  handlers?: Handlers;
  resource?: Resource;
}

interface InnerOperation {
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

export function createRouteResource({
  paths,
  resource,
  handlers
}: ResourceProps) {
  Object.entries(paths).forEach(([path, value]: [string, Path]) => {
    const InnerOperation = getOperations(value);

    Object.keys(InnerOperation).forEach((method) => {
      const operation = InnerOperation[method];
      if (!operation) return;

      const handler =
        handlers && handlers[method]
          ? handlers[method]
          : getRouteHandler(method, resource, operation);

      createRouteInner({ path, method, operation, handler });
    });
  });
}

export interface HandlerProps {
  paths: Paths;
  handler: RouteHandler;
}

export function createRouteHandler({ paths, handler }: HandlerProps) {
  Object.entries(paths).forEach(([path, value]: [string, Path]) => {
    const InnerOperation = getOperations(value);

    Object.keys(InnerOperation).forEach((method) => {
      const operation = InnerOperation[method];
      if (!operation) return;

      createRouteInner({ path, method, operation, handler });
    });
  });
}

interface RouterInner {
  path: string;
  method: string;
  handler: RouteHandler;
  operation: Operation;
}

function createRouteInner({ path, method, operation, handler }: RouterInner) {
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

    route.schema.body = responseToProperties(schema);
  }

  if (route.schema !== undefined && operation.requestBody !== undefined) {
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

  api.route(route);
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

function resolveResponses(responses: Responses) {
  if (!responses) return {};

  const newResponses: { [key: string]: any } = {};

  Object.keys(responses).forEach((statusCode) => {
    const response = responses[statusCode] as Response;

    if (!response.content) return;

    const content = response.content['application/json'];

    if (!content) return;

    const schema = content.schema as Schema;
    const properties = schema.properties as Schema;

    newResponses[statusCode] = {
      description: response.description,
      type: 'object',
      properties: responseToProperties(properties)
    };
  });

  return newResponses;
}

function getRouteHandler(method: string, resource: any, operation: any) {
  if (method === 'get') {
    if (operation['x-admin'].types.includes('list')) {
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

function resolvePath(path: string) {
  const newPath = path.replace(/{/g, ':').replace(/}/g, '');
  return newPath;
}
