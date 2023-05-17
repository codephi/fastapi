if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { FastAPI } = require('./fastapi');

const fastapi = new FastAPI();

fastapi
  .setDataBase({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  })
  .setModel('model.json')
  .setTags('create', ['create'])
  .setTags('read', ['read'])
  .setTags('update', ['update'])
  .setTags('delete', ['delete'])
  .setTags('list', ['list']);

fastapi.get(
  '/hello',
  {
    tags: ['hello'],
    summary: 'Hello world',
    description: 'Hello world',
    responses: {
      200: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  },
  async () => {
    return { message: 'Hello world' };
  }
);

fastapi.start();
