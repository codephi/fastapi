import { FastifyReply } from 'fastify';
import { createFullDoc } from '../resources/openapi/doc';
import { Paths, Schema } from '../resources/openapi/openapiTypes';
import { Routes, RoutesBuilder } from '../resources/routes';

export default function builderOpeapi(paths: Paths): Routes {
  const doc = createFullDoc(paths);
  const openapiSchema = convertJSONToOpenAPI(doc);

  const route = new RoutesBuilder('openapi');
  const openapi = route
    .path('/openapi.json')
    .get({
      tags: ['Documentation'],
      summary: 'Get OpenAPI JSON',
      description: 'Get OpenAPI JSON',
      responses: route.responses(200, openapiSchema.properties),
      handler: async (_request, reply: FastifyReply): Promise<void> => {
        console.log(openapiSchema);
        console.log(doc);
        reply.send(doc);
      }
    })
    .build();

  return openapi;
}

export function convertJSONToOpenAPI(json: any): Schema {
  const schema: Schema = {
    type: 'object',
    properties: {},
    required: []
  };

  for (const key in json) {
    const value = json[key];
    const valueType = typeof value;

    if (valueType === 'number') {
      schema.properties[key] = { type: 'number' };
    } else if (valueType === 'bigint') {
      schema.properties[key] = { type: 'string' };
    } else if (valueType === 'boolean') {
      schema.properties[key] = { type: 'boolean' };
    } else if (valueType === 'string') {
      schema.properties[key] = { type: 'string' };
    } else if (valueType === 'object' && value === null) {
      schema.properties[key] = { type: 'null' };
    } else if (valueType === 'object' && Array.isArray(value)) {
      schema.properties[key] = {
        type: 'array',
        items: { type: 'string' }
      };
    } else if (valueType === 'object' && value !== null) {
      schema.properties[key] = convertJSONToOpenAPI(value);
    }

    if (value !== null) {
      schema.required.push(key);
    }
  }

  return schema;
}
