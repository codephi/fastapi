"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeResponses = void 0;
var errorResponse = function (description) {
    return {
        description: description,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        title: { type: 'string' },
                        status: { type: 'integer' },
                        detail: { type: 'string' }
                    }
                }
            }
        }
    };
};
var resolveSchema = function (target) {
    if (target.$ref) {
        return target;
    }
    return {
        type: 'object',
        properties: target
    };
};
var makeResponses = function (resourceName, defaultSuccessStatusCode, successProperties, conflict) {
    var _a;
    if (conflict === void 0) { conflict = false; }
    var responses = (_a = {},
        _a[defaultSuccessStatusCode] = {
            description: "Response for get ".concat(resourceName),
            content: {
                'application/json': {
                    schema: resolveSchema(successProperties)
                }
            }
        },
        _a);
    var errors = {
        '400': 'Bad Request',
        '401': 'Unauthorized',
        '403': 'Forbidden',
        '404': 'Not Found',
        '500': 'Internal Server Error'
    };
    if (conflict) {
        errors['409'] = 'Conflict';
    }
    Object.keys(errors).forEach(function (statusCode) {
        var description = errors[statusCode];
        responses[parseInt(statusCode)] = errorResponse(description);
    });
    return responses;
};
exports.makeResponses = makeResponses;
