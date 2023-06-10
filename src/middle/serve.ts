import fastify, { FastifyInstance } from 'fastify';

export default () => {
  const api: FastifyInstance = fastify({ logger: true });

  api.register(require('@fastify/cors'), {
    origin: '*'
  });

  return api;
};
