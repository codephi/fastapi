function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
var errorResponse = function(description) {
    return {
        description: description,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string"
                        },
                        title: {
                            type: "string"
                        },
                        status: {
                            type: "integer"
                        },
                        detail: {
                            type: "string"
                        }
                    }
                }
            }
        }
    };
};
var resolveSchema = function(target) {
    if (target.$ref) {
        return target;
    }
    return {
        type: "object",
        properties: target
    };
};
var makeResponses = function(resourceName, defaultSuccessStatusCode, successProperties) {
    var conflict = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
    var responses = _define_property({}, defaultSuccessStatusCode, {
        description: "Response for get ".concat(resourceName),
        content: {
            "application/json": {
                schema: resolveSchema(successProperties)
            }
        }
    });
    var errors = {
        "400": "Bad Request",
        "401": "Unauthorized",
        "403": "Forbidden",
        "404": "Not Found",
        "500": "Internal Server Error"
    };
    if (conflict) {
        errors["409"] = "Conflict";
    }
    Object.keys(errors).forEach(function(statusCode) {
        var description = errors[statusCode];
        responses[parseInt(statusCode)] = errorResponse(description);
    });
    return responses;
};
export { makeResponses };
