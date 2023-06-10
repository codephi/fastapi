import { FastifyReply, FastifyRequest } from 'fastify';
import { FastAPI, makeResponses, SchemaBuilder } from '../src/index';
import { Sequelize } from 'sequelize';

describe('FastAPI', () => {
  describe('Constructor', () => {
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
  });

  describe('Schemas and Database', () => {
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
  });

  describe('Routes', () => {
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
  });

  describe('Server', () => {
    it('should start the server', async () => {
      const fastAPI = new FastAPI();
      fastAPI.api.log.level = 'silent';

      fastAPI.loadRoutes();

      const response = await fastAPI.api.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });

  describe('Schema and Server', () => {
    it('should start the server', async () => {
      const schema = new SchemaBuilder();
      const helloSchema = schema
        .table('hellos')
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

      const fastAPI = new FastAPI({
        schema: helloSchema
      });
      fastAPI.api.log.level = 'silent';

      fastAPI.setDatabaseInstance(sequelize);

      fastAPI.load();

      await fastAPI.start();

      const response = await fastAPI.api.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });
});
