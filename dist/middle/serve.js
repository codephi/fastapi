"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
exports.default = () => {
    const api = (0, fastify_1.default)({ logger: true });
    api.register(require('@fastify/cors'), {
        origin: '*'
    });
    return api;
};
