"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSingle = exports.convertToPlural = exports.getReferenceSchemaName = exports.convertOpenAPItoSchemas = exports.extractByMethod = void 0;
function extractByMethod(method, target) {
    if (method === 'get') {
        return target.get;
    }
    else if (method === 'post') {
        return target.post;
    }
    else if (method === 'put') {
        return target.put;
    }
    else if (method === 'delete') {
        return target.delete;
    }
    else if (method === 'patch') {
        return target.patch;
    }
}
exports.extractByMethod = extractByMethod;
function convertOpenAPItoSchemas(openAPI) {
    const schemasCache = {};
    // Create the components object if it doesn't exist
    if (!openAPI.components) {
        openAPI.components = {};
    }
    // Create the schemas object inside components if it doesn't exist
    if (!openAPI.components.schemas) {
        openAPI.components.schemas = {};
    }
    // Iterate over the paths defined in OpenAPI
    for (const path in openAPI.paths) {
        const pathItem = openAPI.paths[path];
        for (const method in pathItem) {
            if (method !== 'parameters') {
                const operation = extractByMethod(method, pathItem);
                if (!operation)
                    continue;
                const { responses } = operation;
                for (const statusCode in responses) {
                    const response = responses[statusCode];
                    const { content } = response;
                    for (const contentType in content) {
                        const mediaType = content[contentType];
                        const schema = mediaType.schema;
                        if (schema) {
                            if ('$ref' in schema) {
                                continue;
                            }
                            const schemaKey = JSON.stringify(schema);
                            // Check if the schema has already been registered
                            if (schemasCache[schemaKey]) {
                                // Reuse the existing schema
                                mediaType.schema = {
                                    $ref: `#/components/schemas/${schemasCache[schemaKey]}`
                                };
                            }
                            else {
                                const schemaName = getReferenceSchemaNameInner(path, method, statusCode);
                                // Add the schema to the schemas object
                                schemasCache[schemaKey] = schemaName;
                                openAPI.components.schemas[schemaName] = schema;
                                // Update the reference to the schema
                                mediaType.schema = {
                                    $ref: `#/components/schemas/${schemaName}`
                                };
                            }
                        }
                    }
                }
                // Check for undeclared path parameters
                const parameters = operation.parameters ?? [];
                const declaredPathParams = path.match(/{\w+}/g) ?? [];
                parameters.forEach((parameter) => {
                    if (parameter.in === 'path' &&
                        !declaredPathParams.includes(`{${parameter.name}}`)) {
                        console.warn(`Declared path parameter "${parameter.name}" needs to be defined as a path parameter at either the path or operation level`);
                    }
                });
            }
        }
    }
    return openAPI;
}
exports.convertOpenAPItoSchemas = convertOpenAPItoSchemas;
function getReferenceSchemaName(path, method, statusCode) {
    return `#/components/schemas/${getReferenceSchemaNameInner(path, method, statusCode)}`;
}
exports.getReferenceSchemaName = getReferenceSchemaName;
function getReferenceSchemaNameInner(path, method, statusCode) {
    return `${method.toUpperCase()}_${path.replace(/[\/\:\{\}]/g, '_')}_${statusCode}`
        .replace(/__/g, '_')
        .replace(/_$/, '');
}
function convertToPlural(resourceName) {
    return resourceName.endsWith('s') ? resourceName : `${resourceName}s`;
}
exports.convertToPlural = convertToPlural;
function convertToSingle(resourceName) {
    return resourceName.endsWith('s') ? resourceName.slice(0, -1) : resourceName;
}
exports.convertToSingle = convertToSingle;
