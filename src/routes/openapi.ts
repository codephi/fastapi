import { FastifyReply } from 'fastify';
import { createFullDoc } from '../resources/openapi/doc';
import { Paths, Properties, Schema } from '../resources/openapi/openapiTypes';
import { Routes, RoutesBuilder } from '../resources/routes';
import { JSONSchema7 } from 'json-schema';

export default function builderOpeapi(paths: Paths): Routes {
  const doc = createFullDoc(paths);
  const openapiSchema = objectToJSONSchema7(doc);

  const route = new RoutesBuilder('openapi');
  const openapi = route
    .path('/openapi.json')
    .get({
      tags: ['Documentation'],
      summary: 'Get OpenAPI JSON',
      description: 'Get OpenAPI JSON',
      responses: route.responses(200, openapiSchema.properties as Properties),
      handler: (_request, reply: FastifyReply): void => {
        reply.send(doc);
      }
    })
    .build();

  return openapi;
}

export function objectToJSONSchema7(json: any): JSONSchema7 {
  if (json === null || Array.isArray(json) || typeof json !== 'object') {
    if (typeof json === 'number') {
      return { type: 'number' };
    } else if (typeof json === 'bigint') {
      return { type: 'string' };
    } else if (typeof json === 'boolean') {
      return { type: 'boolean' };
    } else if (typeof json === 'string') {
      return { type: 'string' };
    } else if (typeof json === 'object' && json === null) {
      return { type: 'null' };
    } else if (typeof json === 'object' && Array.isArray(json)) {
      return resolveArray(json.map((item) => objectToJSONSchema7(item)));
    } else if (typeof json === 'object' && json !== null) {
      return objectToJSONSchema7(json);
    }
  }

  const schema: JSONSchema7 = {
    type: 'object',
    properties: {}
  };

  for (const key in json) {
    const value = json[key];
    const valueType = typeof value;

    if (schema.properties === undefined) continue;

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
      const items = resolveArray(
        value.map((item) => objectToJSONSchema7(item))
      );
      schema.properties[key] = {
        type: 'array',
        items
      };
    } else if (valueType === 'object' && value !== null) {
      schema.properties[key] = objectToJSONSchema7(value);
    }
  }

  return schema;
}

//Verificar se os itens do array são do mesmo tipo, se forem, retorna um dos items, se não, retorna o array
function resolveArray(item: any[]): any | any[] {
  if (item.length === 1) {
    return item[0];
  }

  const firstItem = item[0];
  const sameType = item.every((i) => i.type === firstItem.type);

  if (sameType) {
    return firstItem;
  }

  return item;
}
