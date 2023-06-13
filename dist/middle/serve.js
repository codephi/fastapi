"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
exports.default = () => {
    const api = (0, fastify_1.default)({ logger: true });
    api.register(require('@fastify/cors'), {
        origin: '*'
    });
    return api;
};
//# sourceMappingURL=serve.js.map