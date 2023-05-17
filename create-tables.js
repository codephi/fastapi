if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { global } = require('./src/middle/database');
const { importModel } = require('./src/engine/global.sequelize/generateModel');

importModel();

const createTables = async () => {
  try {
    await global.sequelize.sync({ force: true });
    console.log('All tables created.');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await global.sequelize.close();
  }
};

createTables();
