const { getSequelize } = require('../../middle/database');

const createTables = async (config = {}) => {
  const sequelize = getSequelize();
  try {
    await sequelize.sync(config);
    console.log('All tables created.');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await sequelize.close();
  }
};

module.exports.createTables = createTables;
