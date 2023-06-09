import { convertOpenAPItoSchemas } from './utils';
import { OpenAPI, Paths } from './openapiTypes';

interface PathObject {
  [path: string]: PathItemObject;
}

interface PathItemObject {
  servers?: ServerObject[];
}

interface ServerObject {
  url: string;
}

export function createFullDoc(paths: Paths): OpenAPI {
  const openapi: OpenAPI = {
    openapi: '3.0.0',
    info: {
      title: process.env.APP_NAME || 'Fastapi',
      description: process.env.APP_DESCRIPTION || 'Fastapi',
      version: process.env.APP_VERSION || '1.0.0'
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:3000'
      }
    ],
    paths: resolvePaths(paths)
  };

  return convertOpenAPItoSchemas(openapi);
}

const resolvePaths = (schemas: PathObject): PathObject => {
  Object.keys(schemas).forEach((path) => {
    schemas[path].servers = [
      {
        url: process.env.APP_URL || 'http://localhost:3000'
      }
    ];
  });

  return schemas;
};
