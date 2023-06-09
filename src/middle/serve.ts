import fastify, { FastifyInstance } from 'fastify';

const api: FastifyInstance = fastify({ logger: true });

api.register(require('@fastify/cors'), {
  origin: '*'
});

export default api;
