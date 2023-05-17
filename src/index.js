if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const fastapi = require('./fastapi');

const tags = {
  create: ['create'],
  read: ['read'],
  update: ['update'],
  delete: ['Delete'],
  list: ['list'],
};

fastapi.databaseConnect({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

fastapi.setup({ model: 'model.json', tags });
