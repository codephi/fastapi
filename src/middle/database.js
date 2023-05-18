const { Sequelize } = require('sequelize');

const global = {
  sequelize: null
};

const testDatabaseConnection = () => {
  return global.sequelize.authenticate();
};

const databaseConnect = ({ database, username, password, options }) => {
  global.sequelize = new Sequelize(database, username, password, options);
};

const getSequelize = () => {
  return global.sequelize;
};

const comp = {
  getSequelize,
  testDatabaseConnection,
  databaseConnect,
  global
};

module.exports = comp;
