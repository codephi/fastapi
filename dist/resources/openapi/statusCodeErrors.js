export var internalServerError = function() {
    return {
        type: "https://example.com/probs/internal-server-error",
        title: "Internal Server Error",
        status: 500,
        detail: "An unexpected error occurred on the server."
    };
};
export var notFound = function() {
    return {
        type: "https://example.com/probs/not-found",
        title: "Not Found",
        status: 404,
        detail: "The requested resource could not be found."
    };
};
export var badRequest = function(message) {
    return {
        type: "https://example.com/probs/bad-request",
        title: "Bad Request",
        status: 400,
        detail: message
    };
};
export var unauthorized = function() {
    return {
        type: "https://example.com/probs/unauthorized",
        title: "Unauthorized",
        status: 401,
        detail: "You are not authorized to access this resource."
    };
};
export var forbidden = function() {
    return {
        type: "https://example.com/probs/forbidden",
        title: "Forbidden",
        status: 403,
        detail: "Access to this resource is forbidden."
    };
};
export var conflict = function() {
    return {
        type: "https://example.com/probs/conflict",
        title: "Conflict",
        status: 409,
        detail: "There was a conflict while processing the request."
    };
};
