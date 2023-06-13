"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = require("fastify");
exports.default = (function () {
    var api = (0, fastify_1.default)({ logger: true });
    api.register(require('@fastify/cors'), {
        origin: '*'
    });
    return api;
});
