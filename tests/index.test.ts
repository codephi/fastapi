import { FastifyReply, FastifyRequest } from 'fastify';
import { FastAPI, DatabaseSync, makeResponses } from '../src/index';

describe('FastAPI', () => {
  let fastAPI: FastAPI;

  beforeEach(() => {
    fastAPI = new FastAPI();
  });

  // describe('constructor', () => {
  //   it('should initialize FastAPI with default values if no parameters are passed', () => {
  //     expect(fastAPI).toBeInstanceOf(FastAPI);
  //     expect(fastAPI.database.database).toBeNull();
  //     expect(fastAPI.database.username).toBeNull();
  //     expect(fastAPI.database.password).toBeNull();
  //     expect(fastAPI.database.sync).toEqual(DatabaseSync.NONE);
  //     expect(fastAPI.database.testConnection).toBe(true);
  //   });

  //   it('should initialize FastAPI with the passed parameters', () => {
  //     fastAPI.setDatabse({
  //       database: 'testDB',
  //       username: 'testUser',
  //       password: 'testPassword',
  //       sync: DatabaseSync.NONE,
  //       testConnection: true
  //     });

  //     expect(fastAPI.database.database).toEqual('testDB');
  //     expect(fastAPI.database.username).toEqual('testUser');
  //     expect(fastAPI.database.password).toEqual('testPassword');
  //     expect(fastAPI.database.sync).toEqual(DatabaseSync.NONE);
  //     expect(fastAPI.database.testConnection).toBe(true);
  //   });
  // });

  describe('addRoutes', () => {
    it('should add a route for /hello', async () => {
      fastAPI.get('/hello', {
        responses: makeResponses('hello', 201, {
          message: {
            type: 'string'
          }
        }),
        handler: (_request: FastifyRequest, reply: FastifyReply) => {
          reply.status(201).send({
            message: 'Hello, world!'
          });
        }
      });

      fastAPI.builder();

      const response = await fastAPI.api.inject({
        method: 'GET',
        url: '/hello'
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual({ message: 'Hello, world!' });
    });
  });
});
