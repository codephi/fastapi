"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeResponses = void 0;
const errorResponse = (description) => {
    return {
        description,
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
const resolveSchema = (target) => {
    if (target.$ref) {
        return target;
    }
    return {
        type: 'object',
        properties: target
    };
};
const makeResponses = (resourceName, defaultSuccessStatusCode, successProperties, conflict = false) => {
    const responses = {
        [defaultSuccessStatusCode]: {
            description: `Response for get ${resourceName}`,
            content: {
                'application/json': {
                    schema: resolveSchema(successProperties)
                }
            }
        }
    };
    const errors = {
        '400': 'Bad Request',
        '401': 'Unauthorized',
        '403': 'Forbidden',
        '404': 'Not Found',
        '500': 'Internal Server Error'
    };
    if (conflict) {
        errors['409'] = 'Conflict';
    }
    Object.keys(errors).forEach((statusCode) => {
        const description = errors[statusCode];
        responses[parseInt(statusCode)] = errorResponse(description);
    });
    return responses;
};
exports.makeResponses = makeResponses;
