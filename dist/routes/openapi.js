"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToJSONSchema7 = void 0;
const doc_1 = require("../resources/openapi/doc");
const routes_1 = require("../resources/routes");
function builderOpeapi(paths) {
    const doc = (0, doc_1.createFullDoc)(paths);
    const openapiSchema = objectToJSONSchema7(doc);
    const route = new routes_1.RoutesBuilder('openapi');
    const openapi = route
        .path('/openapi.json')
        .get({
        tags: ['Documentation'],
        summary: 'Get OpenAPI JSON',
        description: 'Get OpenAPI JSON',
        responses: route.responses(200, openapiSchema.properties),
        handler: (_request, reply) => {
            reply.send(doc);
        }
    })
        .build();
    return openapi;
}
exports.default = builderOpeapi;
function objectToJSONSchema7(json) {
    if (json === null || Array.isArray(json) || typeof json !== 'object') {
        if (typeof json === 'number') {
            return { type: 'number' };
        }
        else if (typeof json === 'bigint') {
            return { type: 'string' };
        }
        else if (typeof json === 'boolean') {
            return { type: 'boolean' };
        }
        else if (typeof json === 'string') {
            return { type: 'string' };
        }
        else if (typeof json === 'object' && json === null) {
            return { type: 'null' };
        }
        else if (typeof json === 'object' && Array.isArray(json)) {
            return resolveArray(json.map((item) => objectToJSONSchema7(item)));
        }
        else if (typeof json === 'object' && json !== null) {
            return objectToJSONSchema7(json);
        }
    }
    const schema = {
        type: 'object',
        properties: {}
    };
    for (const key in json) {
        const value = json[key];
        const valueType = typeof value;
        if (schema.properties === undefined)
            continue;
        if (valueType === 'number') {
            schema.properties[key] = { type: 'number' };
        }
        else if (valueType === 'bigint') {
            schema.properties[key] = { type: 'string' };
        }
        else if (valueType === 'boolean') {
            schema.properties[key] = { type: 'boolean' };
        }
        else if (valueType === 'string') {
            schema.properties[key] = { type: 'string' };
        }
        else if (valueType === 'object' && value === null) {
            schema.properties[key] = { type: 'null' };
        }
        else if (valueType === 'object' && Array.isArray(value)) {
            const items = resolveArray(value.map((item) => objectToJSONSchema7(item)));
            schema.properties[key] = {
                type: 'array',
                items
            };
        }
        else if (valueType === 'object' && value !== null) {
            schema.properties[key] = objectToJSONSchema7(value);
        }
    }
    return schema;
}
exports.objectToJSONSchema7 = objectToJSONSchema7;
//Verificar se os itens do array são do mesmo tipo, se forem, retorna um dos items, se não, retorna o array
function resolveArray(item) {
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
