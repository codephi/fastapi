import { FastifyReply, FastifyRequest } from 'fastify';
import {
  FastAPI,
  makeResponses,
  RoutesBuilder,
  SchemaBuilder
} from '../src/index';
import { Sequelize } from 'sequelize';

describe('FastAPI', () => {
  describe('Lib and Loaders', () => {
    it('should initialize FastAPI with default values if no parameters are passed', () => {
      const fastAPI = new FastAPI();
      fastAPI.api.log.level = 'silent';

      expect(fastAPI).toBeInstanceOf(FastAPI);
      expect(fastAPI.database.database).toBeNull();
      expect(fastAPI.database.username).toBeNull();
      expect(fastAPI.database.password).toBeNull();
      expect(fastAPI.database.testConnection).toBe(true);
    });

    it('should initialize FastAPI with the passed parameters', () => {
      const fastAPI = new FastAPI();
      fastAPI.api.log.level = 'silent';

      fastAPI.setDatabase({
        database: 'testDB',
        username: 'testUser',
        password: 'testPassword',
        testConnection: true
      });

      expect(fastAPI.database.database).toEqual('testDB');
      expect(fastAPI.database.username).toEqual('testUser');
      expect(fastAPI.database.password).toEqual('testPassword');
      expect(fastAPI.database.testConnection).toBe(true);
    });
    it('should add a schema for hello', async () => {
      const fastAPI = new FastAPI();
      fastAPI.api.log.level = 'silent';

      const schema = new SchemaBuilder();
      const helloSchema = schema
        .table('hello')
        .column({
          name: 'id',
          type: 'integer',
          primaryKey: true,
          autoIncrement: true
        })
        .column({
          name: 'message',
          type: 'string',
          allowNull: false
        })
        .column({
          name: 'createdAt',
          type: 'date'
        })
        .column({
          name: 'updatedAt',
          type: 'date'
        })
        .build();

      const mockHello = {
        message: 'Hello, world!'
      };

      const sequelize = new Sequelize('sqlite::memory:', {
        logging: false
      });

      fastAPI.setDatabaseInstance(sequelize);

      fastAPI.loadSchema(helloSchema);

      const { Hello } = fastAPI.models;

      await Hello.sync({ force: true });

      await Hello.create(mockHello);

      const result = await Hello.findOne({
        where: { message: mockHello.message }
      });

      expect(result).toBeTruthy();
      expect(result?.dataValues.message).toBe(mockHello.message);
    });

    it('should add a route for /hello', async () => {
      const fastAPI = new FastAPI();
      fastAPI.api.log.level = 'silent';

      fastAPI.get('/', {
        responses: makeResponses('init', 222, {
          message: {
            type: 'string'
          }
        }),
        handler: (_request: FastifyRequest, reply: FastifyReply) => {
          reply.status(222).send({
            message: 'Hello, world!'
          });
        }
      });

      fastAPI.loadRoutes();

      const response = await fastAPI.api.inject({
        method: 'GET',
        url: '/'
      });

      expect(response.statusCode).toBe(222);
      expect(response.json()).toEqual({ message: 'Hello, world!' });
    });

    it('should add a route for /hello 2', async () => {
      const fastAPI = new FastAPI();
      fastAPI.api.log.level = 'silent';
      const routes = new RoutesBuilder();
      const builded = routes
        .path('/')
        .get({
          responses: makeResponses('init', 222, {
            message: {
              type: 'string'
            }
          }),
          handler: (_request: FastifyRequest, reply: FastifyReply) => {
            reply.status(222).send({
              message: 'Hello, world!'
            });
          }
        })
        .build();

      fastAPI.addRoutes(builded);

      fastAPI.loadRoutes();

      const response = await fastAPI.api.inject({
        method: 'GET',
        url: '/'
      });

      expect(response.statusCode).toBe(222);
      expect(response.json()).toEqual({ message: 'Hello, world!' });

      await fastAPI.api.close();
    });
  });

  describe('Schema and Server', () => {
    const fastAPI = new FastAPI();

    beforeAll(async () => {
      const schema = new SchemaBuilder();

      const helloSchema = schema
        .table('messages')
        .column({
          name: 'id',
          type: 'integer',
          primaryKey: true,
          autoIncrement: true
        })
        .column({
          name: 'message',
          type: 'string',
          allowNull: false
        })
        .column({
          name: 'createdAt',
          type: 'date'
        })
        .column({
          name: 'updatedAt',
          type: 'date'
        })
        .build();

      const sequelize = new Sequelize('sqlite::memory:', {
        logging: false
      });

      fastAPI.setSchema(helloSchema);

      fastAPI.api.log.level = 'silent';

      fastAPI.setDatabaseInstance(sequelize);
    });

    afterAll(async () => {
      await fastAPI.api.close();
    });

    it('should start the server', async () => {
      fastAPI.load();
      await fastAPI.start();
    });

    it('should post', async () => {
      const responsePost = await fastAPI.api.inject({
        method: 'POST',
        url: '/api/messages',
        payload: {
          message: 'Hello, world!'
        }
      });

      const responsePost2 = await fastAPI.api.inject({
        method: 'POST',
        url: '/api/messages',
        payload: {
          message: 'Hello, world 2!'
        }
      });

      expect(responsePost.statusCode).toBe(201);
      expect(responsePost2.statusCode).toBe(201);
    });

    it('should get', async () => {
      const responseGet = await fastAPI.api.inject({
        method: 'GET',
        url: '/api/messages'
      });

      expect(responseGet.statusCode).toBe(200);

      const { data, meta } = responseGet.json();
      const responseGetJson = data.map(
        (
          item: Record<string, string | number>
        ): Record<string, string | number> => {
          delete item.createdAt;
          delete item.updatedAt;
          return item;
        }
      );

      expect({ data, meta }).toEqual({
        data: [
          {
            id: 2,
            message: 'Hello, world 2!'
          },
          {
            id: 1,
            message: 'Hello, world!'
          }
        ],
        meta: { page: 1, pageSize: 10, totalPages: 1, totalItems: 2 }
      });
    });

    it('should get by id', async () => {
      const responseGet = await fastAPI.api.inject({
        method: 'GET',
        url: '/api/messages/1'
      });

      expect(responseGet.statusCode).toBe(200);

      const data = responseGet.json();
      delete data.createdAt;
      delete data.updatedAt;

      expect(data).toEqual({
        id: 1,
        message: 'Hello, world!'
      });
    });

    it('should put', async () => {
      const responsePut = await fastAPI.api.inject({
        method: 'PUT',
        url: '/api/messages/1',
        payload: {
          message: 'Hello, world 3!'
        }
      });

      expect(responsePut.statusCode).toBe(200);

      const data = responsePut.json();
      delete data.createdAt;
      delete data.updatedAt;

      expect(data).toEqual({
        id: 1,
        message: 'Hello, world 3!'
      });
    });

    it('should delete', async () => {
      const responseDelete = await fastAPI.api.inject({
        method: 'DELETE',
        url: '/api/messages/1'
      });

      expect(responseDelete.statusCode).toBe(204);
    });

    it('should get by id not found', async () => {
      const responseGet = await fastAPI.api.inject({
        method: 'GET',
        url: '/api/messages/1'
      });

      expect(responseGet.statusCode).toBe(404);
    });
  });
});
