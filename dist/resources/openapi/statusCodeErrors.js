"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conflict = exports.forbidden = exports.unauthorized = exports.badRequest = exports.notFound = exports.internalServerError = void 0;
const internalServerError = () => {
    return {
        type: 'https://example.com/probs/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred on the server.'
    };
};
exports.internalServerError = internalServerError;
const notFound = () => {
    return {
        type: 'https://example.com/probs/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'The requested resource could not be found.'
    };
};
exports.notFound = notFound;
const badRequest = (message) => {
    return {
        type: 'https://example.com/probs/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: message
    };
};
exports.badRequest = badRequest;
const unauthorized = () => {
    return {
        type: 'https://example.com/probs/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'You are not authorized to access this resource.'
    };
};
exports.unauthorized = unauthorized;
const forbidden = () => {
    return {
        type: 'https://example.com/probs/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'Access to this resource is forbidden.'
    };
};
exports.forbidden = forbidden;
const conflict = () => {
    return {
        type: 'https://example.com/probs/conflict',
        title: 'Conflict',
        status: 409,
        detail: 'There was a conflict while processing the request.'
    };
};
exports.conflict = conflict;
