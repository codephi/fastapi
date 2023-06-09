import { FastifyReply, FastifyRequest } from 'fastify';
import {
  FastAPI,
  DatabaseSync,
  makeResponses,
  SchemaBuilder
} from '../src/index';
import { Sequelize } from 'sequelize';

describe('FastAPI', () => {
  let fastAPI: FastAPI;

  beforeEach(() => {
    fastAPI = new FastAPI();
  });

  describe('constructor', () => {
    it('should initialize FastAPI with default values if no parameters are passed', () => {
      expect(fastAPI).toBeInstanceOf(FastAPI);
      expect(fastAPI.database.database).toBeNull();
      expect(fastAPI.database.username).toBeNull();
      expect(fastAPI.database.password).toBeNull();
      expect(fastAPI.database.sync).toEqual(DatabaseSync.NONE);
      expect(fastAPI.database.testConnection).toBe(true);
    });

    it('should initialize FastAPI with the passed parameters', () => {
      fastAPI.setDatabase({
        database: 'testDB',
        username: 'testUser',
        password: 'testPassword',
        sync: DatabaseSync.NONE,
        testConnection: true
      });

      expect(fastAPI.database.database).toEqual('testDB');
      expect(fastAPI.database.username).toEqual('testUser');
      expect(fastAPI.database.password).toEqual('testPassword');
      expect(fastAPI.database.sync).toEqual(DatabaseSync.NONE);
      expect(fastAPI.database.testConnection).toBe(true);
    });
  });

  describe('loadRoutes', () => {
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

      fastAPI.loadRoutes();

      const response = await fastAPI.api.inject({
        method: 'GET',
        url: '/hello'
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual({ message: 'Hello, world!' });
    });
  });

  describe('loadSchemas', () => {
    it('should add a schema for hello', async () => {
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

      const sequelize = new Sequelize('sqlite::memory:');

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
  });
});
