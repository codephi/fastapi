import fastify, { FastifyInstance } from 'fastify';

export const api: FastifyInstance = fastify({ logger: true });

export const preBuilder = (): void => {
  api.register(require('@fastify/cors'), {
    origin: '*'
  });
};
