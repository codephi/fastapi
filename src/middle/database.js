const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: (sql) => {
      console.log(sql);
    },
  }
);

const testDatabaseConnection = (fastify) => {
  sequelize.authenticate();
};

module.exports = {
  sequelize,
  testDatabaseConnection,
};
