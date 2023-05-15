const { DataTypes } = require('sequelize');
const { sequelize } = require('../../middle/database');

function getModelName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1, -1);
}

function getTableName(name) {
  return name.toLowerCase();
}

function generateSequelizeModelFromJSON(jsonSchema) {
  const models = {};

  for (const table of jsonSchema.tables) {
    const tableColumns = {};
    const tableName = getTableName(table.name);
    const modelName = getModelName(table.name);

    for (const column of table.columns) {
      const columnName = column.name;
      const columnType = getSequelizeDataType(column.type);
      const columnConstraints = getSequelizeConstraints(column.constraints);

      tableColumns[columnName] = {
        type: columnType,
        allowNull: !columnConstraints.includes('NOT NULL'),
        primaryKey: columnConstraints.includes('PRIMARY KEY'),
        references: parseReferences(columnConstraints),
        autoIncrement: column.autoIncrement || false,
      };
    }

    models[modelName] = sequelize.define(modelName, tableColumns, {
      tableName,
    });
  }

  // Configurar as associações entre os modelos
  for (const table of jsonSchema.tables) {
    const modelName = getModelName(table.name);
    const model = models[modelName];

    for (const column of table.columns) {
      for (const constraints of column.constraints) {
        if (constraints.indexOf('REFERENCES') > -1) {
          const referencedTable = getModelName(
            getReferencedTableName(column.constraints)
          );
          const referencedModel = models[referencedTable];

          model.belongsTo(referencedModel);
          referencedModel.hasMany(model);
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
  } else if (columnType === 'BOOLEAN') {
    return DataTypes.BOOLEAN;
  } else if (columnType === 'FLOAT') {
    return DataTypes.FLOAT;
  } else if (columnType === 'DOUBLE') {
    return DataTypes.DOUBLE;
  } else if (columnType === 'DECIMAL') {
    return DataTypes.DECIMAL;
  } else if (columnType === 'UUID') {
    return DataTypes.UUID;
  } else if (columnType === 'ENUM') {
    return DataTypes.ENUM;
  } else if (columnType === 'JSON') {
    return DataTypes.JSON;
  } else if (columnType === 'JSONB') {
    return DataTypes.JSONB;
  } else if (columnType === 'BLOB') {
    return DataTypes.BLOB;
  } else if (columnType === 'ARRAY') {
    return DataTypes.ARRAY;
  } else if (columnType === 'SERIAL') {
    return DataTypes.INTEGER;
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
