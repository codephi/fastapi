const { Sequelize } = require('sequelize');

const global = {
  sequelize: null,
};

const testDatabaseConnection = () => {
  global.sequelize.authenticate();
};

const databaseConnect = ({ database, username, password, options }) => {
  if (!options) {
    options = {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: (sql) => {
        console.log(sql);
      },
    };
  }

  global.sequelize = new Sequelize(database, username, password, options);
};

const getSequelize = () => {
  return global.sequelize;
};

const comp = {
  getSequelize,
  testDatabaseConnection,
  databaseConnect,
  global,
};

module.exports = comp;
