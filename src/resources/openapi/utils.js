"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    extractByMethod: function() {
        return extractByMethod;
    },
    convertOpenAPItoSchemas: function() {
        return convertOpenAPItoSchemas;
    },
    getReferenceSchemaName: function() {
        return getReferenceSchemaName;
    },
    convertToPlural: function() {
        return convertToPlural;
    },
    convertToSingle: function() {
        return convertToSingle;
    }
});
function extractByMethod(method, target) {
    if (method === "get") {
        return target.get;
    } else if (method === "post") {
        return target.post;
    } else if (method === "put") {
        return target.put;
    } else if (method === "delete") {
        return target.delete;
    } else if (method === "patch") {
        return target.patch;
    }
}
function convertOpenAPItoSchemas(openAPI) {
    var _loop = function(path) {
        var _loop = function(method) {
            if (method !== "parameters") {
                var operation = extractByMethod(method, pathItem);
                if (!operation) return "continue";
                var responses = operation.responses;
                for(var statusCode in responses){
                    var response = responses[statusCode];
                    var content = response.content;
                    for(var contentType in content){
                        var mediaType = content[contentType];
                        var schema = mediaType.schema;
                        if (schema) {
                            if ("$ref" in schema) {
                                continue;
                            }
                            var schemaKey = JSON.stringify(schema);
                            // Check if the schema has already been registered
                            if (schemasCache[schemaKey]) {
                                // Reuse the existing schema
                                mediaType.schema = {
                                    $ref: "#/components/schemas/".concat(schemasCache[schemaKey])
                                };
                            } else {
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
                var _operation_parameters;
                // Check for undeclared path parameters
                var parameters = (_operation_parameters = operation.parameters) !== null && _operation_parameters !== void 0 ? _operation_parameters : [];
                var _path_match;
                var declaredPathParams = (_path_match = path.match(/{\w+}/g)) !== null && _path_match !== void 0 ? _path_match : [];
                parameters.forEach(function(parameter) {
                    if (parameter.in === "path" && !declaredPathParams.includes("{".concat(parameter.name, "}"))) {
                        console.warn('Declared path parameter "'.concat(parameter.name, '" needs to be defined as a path parameter at either the path or operation level'));
                    }
                });
            }
        };
        var pathItem = openAPI.paths[path];
        for(var method in pathItem)_loop(method);
    };
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
    for(var path in openAPI.paths)_loop(path);
    return openAPI;
}
function getReferenceSchemaName(path, method, statusCode) {
    return "#/components/schemas/".concat(getReferenceSchemaNameInner(path, method, statusCode));
}
function getReferenceSchemaNameInner(path, method, statusCode) {
    return "".concat(method.toUpperCase(), "_").concat(path.replace(/[\/\:\{\}]/g, "_"), "_").concat(statusCode).replace(/__/g, "_").replace(/_$/, "");
}
function convertToPlural(resourceName) {
    return resourceName.endsWith("s") ? resourceName : "".concat(resourceName, "s");
}
function convertToSingle(resourceName) {
    return resourceName.endsWith("s") ? resourceName.slice(0, -1) : resourceName;
}
