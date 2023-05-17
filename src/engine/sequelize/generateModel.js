const { DataTypes } = require('sequelize');
const { global } = require('../../middle/database');

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
    const maxLength = {};

    for (const column of table.columns) {
      const columnName = column.name;
      const [columnType, columnParams] = getSequelizeDataType(column.type);
      const columnConstraints = getSequelizeConstraints(column.constraints);

      tableColumns[columnName] = {
        type: columnType,
        allowNull: !columnConstraints.includes('NOT NULL'),
        primaryKey: columnConstraints.includes('PRIMARY KEY'),
        references: parseReferences(columnConstraints),
        autoIncrement: column.autoIncrement || false
      };

      if ('maxLength' in columnParams) {
        maxLength[columnName] = columnParams.maxLength;
      }
    }

    models[modelName] = {
      model: global.sequelize.define(modelName, tableColumns, {
        tableName
      }),
      metadata: {
        ...table.metadata,
        maxLength
      }
    };
  }

  // Configurar as associações entre os modelos
  for (const table of jsonSchema.tables) {
    const modelName = getModelName(table.name);
    const model = models[modelName].model;

    for (const column of table.columns) {
      for (const constraints of column.constraints) {
        if (constraints.indexOf('REFERENCES') > -1) {
          const referencedTable = getModelName(
            getReferencedTableName(column.constraints)
          );
          const referencedModel = models[referencedTable].model;

          model.belongsTo(referencedModel, { foreignKey: column.name });
          referencedModel.hasMany(model, { foreignKey: column.name });

          if (models[modelName].metadata.relationships === undefined) {
            models[modelName].metadata.relationships = [
              {
                model: referencedModel,
                as: column.name
              }
            ];
          } else {
            models[modelName].metadata.relationships.push({
              model: referencedModel,
              as: column.name
            });
          }
        }
      }
    }
  }

  return models;
}

function getSequelizeDataType(columnType) {
  const params = {};
  // Mapear os tipos de colunas SQL para os tipos de dados do Sequelize
  if (columnType.includes('VARCHAR')) {
    const length = columnType
      .replace('VARCHAR', '')
      .replace('(', '')
      .replace(')', '');

    params.maxLength = parseInt(length);
    return [DataTypes.STRING, params];
  } else if (columnType === 'INTEGER') {
    return [DataTypes.INTEGER, params];
  } else if (columnType === 'TEXT') {
    return [DataTypes.TEXT, params];
  } else if (columnType === 'DATE') {
    return [DataTypes.DATEONLY, params];
  } else if (columnType === 'BOOLEAN') {
    return [DataTypes.BOOLEAN, params];
  } else if (columnType === 'FLOAT') {
    return [DataTypes.FLOAT, params];
  } else if (columnType === 'DOUBLE') {
    return [DataTypes.DOUBLE, params];
  } else if (columnType === 'DECIMAL') {
    return [DataTypes.DECIMAL, params];
  } else if (columnType === 'UUID') {
    return [DataTypes.UUID, params];
  } else if (columnType === 'ENUM') {
    return [DataTypes.ENUM, params];
  } else if (columnType === 'JSON') {
    return [DataTypes.JSON, params];
  } else if (columnType === 'JSONB') {
    return [DataTypes.JSONB, params];
  } else if (columnType === 'BLOB') {
    return [DataTypes.BLOB, params];
  } else if (columnType === 'ARRAY') {
    return [DataTypes.ARRAY, params];
  } else if (columnType === 'SERIAL') {
    return [DataTypes.INTEGER, params];
  }

  // Se nenhum tipo corresponder, retornar STRING como padrão
  return [DataTypes.STRING, params];
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
      key: 'id' // Assumindo que a coluna referenciada é sempre 'id'
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

module.exports.importModel = (target) => {
  const modelJson =
    typeof target === 'string'
      ? JSON.parse(fs.readFileSync(target, 'utf8'))
      : target;

  const models = generateSequelizeModelFromJSON(modelJson);

  return models;
};
