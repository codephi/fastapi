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
    var _a, _b;
    var schemasCache = {};
    // Create the components object if it doesn't exist
    if (!openAPI.components) {
        openAPI.components = {};
    }
    // Create the schemas object inside components if it doesn't exist
    if (!openAPI.components.schemas) {
        openAPI.components.schemas = {};
    }
    // Iterate over the paths defined in OpenAPI
    for (var path in openAPI.paths) {
        var pathItem = openAPI.paths[path];
        var _loop_1 = function (method) {
            if (method !== 'parameters') {
                var operation = extractByMethod(method, pathItem);
                if (!operation)
                    return "continue";
                var responses = operation.responses;
                for (var statusCode in responses) {
                    var response = responses[statusCode];
                    var content = response.content;
                    for (var contentType in content) {
                        var mediaType = content[contentType];
                        var schema = mediaType.schema;
                        if (schema) {
                            if ('$ref' in schema) {
                                continue;
                            }
                            var schemaKey = JSON.stringify(schema);
                            // Check if the schema has already been registered
                            if (schemasCache[schemaKey]) {
                                // Reuse the existing schema
                                mediaType.schema = {
                                    $ref: "#/components/schemas/".concat(schemasCache[schemaKey])
                                };
                            }
                            else {
                                var schemaName = getReferenceSchemaNameInner(path, method, statusCode);
                                // Add the schema to the schemas object
                                schemasCache[schemaKey] = schemaName;
                                openAPI.components.schemas[schemaName] = schema;
                                // Update the reference to the schema
                                mediaType.schema = {
                                    $ref: "#/components/schemas/".concat(schemaName)
                                };
                            }
                        }
                    }
                }
                // Check for undeclared path parameters
                var parameters = (_a = operation.parameters) !== null && _a !== void 0 ? _a : [];
                var declaredPathParams_1 = (_b = path.match(/{\w+}/g)) !== null && _b !== void 0 ? _b : [];
                parameters.forEach(function (parameter) {
                    if (parameter.in === 'path' &&
                        !declaredPathParams_1.includes("{".concat(parameter.name, "}"))) {
                        console.warn("Declared path parameter \"".concat(parameter.name, "\" needs to be defined as a path parameter at either the path or operation level"));
                    }
                });
            }
        };
        for (var method in pathItem) {
            _loop_1(method);
        }
    }
    return openAPI;
}
exports.convertOpenAPItoSchemas = convertOpenAPItoSchemas;
function getReferenceSchemaName(path, method, statusCode) {
    return "#/components/schemas/".concat(getReferenceSchemaNameInner(path, method, statusCode));
}
exports.getReferenceSchemaName = getReferenceSchemaName;
function getReferenceSchemaNameInner(path, method, statusCode) {
    return "".concat(method.toUpperCase(), "_").concat(path.replace(/[\/\:\{\}]/g, '_'), "_").concat(statusCode)
        .replace(/__/g, '_')
        .replace(/_$/, '');
}
function convertToPlural(resourceName) {
    return resourceName.endsWith('s') ? resourceName : "".concat(resourceName, "s");
}
exports.convertToPlural = convertToPlural;
function convertToSingle(resourceName) {
    return resourceName.endsWith('s') ? resourceName.slice(0, -1) : resourceName;
}
exports.convertToSingle = convertToSingle;
