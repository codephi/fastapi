const { getSequelize } = require('../../middle/database');
const { fastify } = require('../../middle/serve');

const createTables = async (config = {}, closeConnection = false) => {
  const sequelize = getSequelize();
  try {
    await sequelize.sync(config);
    fastify.log.info('All tables created.');

    if (closeConnection) {
      await sequelize.close();
    }
  } catch (error) {
    fastify.log.error('Error creating tables:', error);
    await sequelize.close();
  }
};

module.exports.createTables = createTables;
