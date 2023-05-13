const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
)

const testDatabaseConnection = async (fastify) => {
  try {
    await sequelize.authenticate()
    fastify.log.info('Database connection has been established successfully.')
  } catch (error) {
    fastify.log.error('Unable to connect to the database:', error)
  }
}

module.exports = {
  sequelize,
  testDatabaseConnection
}
