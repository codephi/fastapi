if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const sequelize = require('./database');
const { importModel } = require('./engine/sequelize/generateModel');

const _models = importModel();

const createTables = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('All tables created.');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await sequelize.close();
  }
};

createTables();
