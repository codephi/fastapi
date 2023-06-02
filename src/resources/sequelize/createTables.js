const { getSequelize } = require('../../middle/database');

const createTables = async (config = {}, closeConnection = false) => {
  const sequelize = getSequelize();
  try {
    await sequelize.sync(config);
    console.log('All tables created.');

    if (closeConnection) {
      await sequelize.close();
    }
  } catch (error) {
    console.error('Error creating tables:', error);
    await sequelize.close();
  }
};

module.exports.createTables = createTables;
