const { DataTypes } = require('sequelize')
const { sequelize } = require('../middle/database')

const Example = sequelize.define('Example', {
  stringField: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Default Value',
    validate: {
      len: [1, 255]
    }
  },
  charField: {
    type: DataTypes.CHAR(10),
    allowNull: true
  },
  textField: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  integerField: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  bigintField: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  floatField: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  realField: {
    type: DataTypes.REAL,
    allowNull: false
  },
  doubleField: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  decimalField: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  booleanField: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  enumField: {
    type: DataTypes.ENUM('Option 1', 'Option 2', 'Option 3'),
    allowNull: true
  },
  dateField: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dateonlyField: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  timeField: {
    type: DataTypes.TIME,
    allowNull: false
  },
  uuidField: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  arrayField: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
    defaultValue: []
  },
  jsonField: {
    type: DataTypes.JSON,
    allowNull: true
  }
})

module.exports.Example = Example
