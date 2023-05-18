const { getSequelize } = require('./getSequelize');

const createTables = async () => {
  const sequelize = getSequelize();
  try {
    await sequelize.sync({ force: true });
    console.log('All tables created.');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await sequelize.close();
  }
};

module.exports.createTables = createTables;
