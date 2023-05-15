const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../../middle/database');

function generateSequelizeModelFromJSON(jsonSchema) {
  const models = {};

  for (const table of jsonSchema.tables) {
    const tableColumns = {};

    for (const column of table.columns) {
      const columnName = column.name;
      const columnType = getSequelizeDataType(column.type);
      const columnConstraints = getSequelizeConstraints(column.constraints);

      tableColumns[columnName] = {
        type: columnType,
        allowNull: !columnConstraints.includes('NOT NULL'),
        primaryKey: columnConstraints.includes('PRIMARY KEY'),
        references: parseReferences(columnConstraints),
      };
    }

    models[table.name] = sequelize.define(table.name, tableColumns);
  }

  // Definir as relações entre os modelos, se houver chaves estrangeiras
  for (const table of jsonSchema.tables) {
    if (
      table.columns.some((column) => column.constraints.includes('REFERENCES'))
    ) {
      const modelName = table.name;
      const model = models[modelName];

      for (const column of table.columns) {
        if (column.constraints.includes('REFERENCES')) {
          const referencedTable = getReferencedTableName(column.constraints);
          const referencedColumn = 'id'; // Assumindo que a coluna referenciada é sempre 'id'

          model.belongsTo(models[referencedTable], { foreignKey: column.name });
        }
      }
    }
  }

  return models;
}

function getSequelizeDataType(columnType) {
  // Mapear os tipos de colunas SQL para os tipos de dados do Sequelize
  if (columnType.includes('VARCHAR')) {
    return DataTypes.STRING;
  } else if (columnType === 'INTEGER') {
    return DataTypes.INTEGER;
  } else if (columnType === 'TEXT') {
    return DataTypes.TEXT;
  } else if (columnType === 'DATE') {
    return DataTypes.DATEONLY;
  }

  // Se nenhum tipo corresponder, retornar STRING como padrão
  return DataTypes.STRING;
}

function getSequelizeConstraints(columnConstraints) {
  // Remover a referência ao modelo pai da restrição de chave estrangeira
  return columnConstraints.filter(
    (constraint) => !constraint.includes('REFERENCES')
  );
}

function parseReferences(columnConstraints) {
  // Analisar a referência da restrição de chave estrangeira, se existir
  const referencesConstraint = columnConstraints.find((constraint) =>
    constraint.includes('REFERENCES')
  );

  if (referencesConstraint) {
    const referencedTable = getReferencedTableName([referencesConstraint]);
    return {
      model: referencedTable,
      key: 'id', // Assumindo que a coluna referenciada é sempre 'id'
    };
  }

  return null;
}

function getReferencedTableName(constraints) {
  // Extrair o nome da tabela referenciada da restrição de chave estrangeira
  const referenceRegex = /REFERENCES\s+(\w+)\s+\(.*\)/;
  const match = constraints[0].match(referenceRegex);

  if (match) {
    return match[1];
  }

  return null;
}

module.exports.generateModel = generateSequelizeModelFromJSON;

const fs = require('fs');

module.exports.importModel = () => {
  const modelJson = fs.readFileSync('./model.json', 'utf8');

  const models = generateSequelizeModelFromJSON(JSON.parse(modelJson));

  return models;
};
