const { DataTypes } = require('sequelize');
const { global } = require('../../middle/database');

function generateSequelizeModelFromJSON(jsonSchema) {
  const models = {};

  for (const table of jsonSchema.tables) {
    const tableColumns = {};
    const tableName = getTableName(table.name);
    const modelName = getModelName(table.name);
    const metadata = {
      ...table.metadata,
      primaryKey: null,
      columns: {}
    };

    for (const column of table.columns) {
      const columnName = column.name;
      const [columnType, columnParams] = getSequelizeDataType(column);
      const columnConstraints = getSequelizeConstraints(column.constraints);
      const primaryKey = columnConstraints.includes('PRIMARY KEY');
      const allowNull = !columnConstraints.includes('NOT NULL');
      const defaultValue = getDefaultValue(columnConstraints, columnType);

      columnParams.required = !allowNull || columnParams.required;

      if (!columnParams.defaultValue && defaultValue) {
        columnParams.defaultValue = defaultValue;
      }

      tableColumns[columnName] = {
        type: columnType,
        allowNull,
        primaryKey,
        references: parseReferences(columnConstraints),
        autoIncrement: column.autoIncrement || false,
        defaultValue
      };

      if (primaryKey) {
        metadata.primaryKey = columnName;
      }

      metadata.columns[columnName] = columnParams;
    }

    models[modelName] = {
      model: global.sequelize.define(modelName, tableColumns, {
        tableName
      }),
      metadata: {
        ...metadata,
        properties: table.properties
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

function getModelName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1, -1);
}

function getTableName(name) {
  return name.toLowerCase();
}

function getDefaultValue(columnConstraints, columnType) {
  const columnTypeString = columnType.toString();
  const defaultValue = columnConstraints.find((constraint) =>
    constraint.startsWith('DEFAULT')
  );

  if (defaultValue) {
    const value = defaultValue.split('DEFAULT ')[1];
    if (value === 'NULL') {
      return null;
    }
    if (columnTypeString === DataTypes.INTEGER.name) {
      return parseInt(value);
    }
    if (columnTypeString === DataTypes.FLOAT.name) {
      return parseFloat(value);
    }
    if (columnTypeString === DataTypes.BOOLEAN.name) {
      return value === 'true';
    }
    if (
      columnTypeString === DataTypes.STRING.name ||
      columnTypeString === DataTypes.ENUM.name ||
      columnTypeString === DataTypes.CHAR.name ||
      columnTypeString === DataTypes.TEXT.name
    ) {
      return value.slice(1, -1);
    }

    return value;
  }

  return undefined;
}

function getNumberProps(attributes) {
  const params = {};

  if (attributes.length) {
    params.length = attributes.length;
  }

  if (attributes.precision) {
    params.precision = attributes.precision;
  }

  if (attributes.scale) {
    params.scale = attributes.scale;
  }

  if (attributes.unsigned) {
    params.unsigned = attributes.unsigned;
  }

  if (attributes.zerofill) {
    params.zerofill = attributes.zerofill;
  }

  if (attributes.decimals) {
    params.decimals = attributes.decimals;
  }

  return params;
}

function getSequelizeDataType({ type: columnType, ...attributes }) {
  function getDataType() {
    if (columnType.includes('VARCHAR')) {
      const length =
        attributes.maxLength ||
        attributes.length ||
        columnType.replace('VARCHAR', '').replace('(', '').replace(')', '');

      attributes.maxLength = parseInt(length, 10);

      return DataTypes.STRING(length, attributes.binary);
    } else if (columnType === 'STRING') {
      return DataTypes.STRING(attributes.length, attributes.binary);
    } else if (columnType === 'CHAR') {
      return DataTypes.CHAR(attributes.length, attributes.binary);
    } else if (columnType === 'TEXT') {
      return DataTypes.TEXT(attributes.length);
    } else if (columnType === 'DATE') {
      return DataTypes.DATE(attributes.length);
    } else if (columnType === 'TIME') {
      return DataTypes.TIME;
    } else if (columnType === 'NOW') {
      return DataTypes.NOW;
    } else if (columnType === 'BOOLEAN') {
      return DataTypes.BOOLEAN;
    } else if (columnType === 'UUID') {
      return DataTypes.UUID;
    } else if (columnType === 'ENUM') {
      return DataTypes.ENUM({
        values: attributes.values
      });
    } else if (columnType === 'JSON' || columnType === 'JSONTYPE') {
      return DataTypes.JSONTYPE;
    } else if (columnType === 'ARRAY') {
      return DataTypes.ARRAY(attributes.arrayType);
    } else if (columnType === 'BLOB') {
      const params = {};

      if (attributes.length) {
        params.length = attributes.length;
      }

      return DataTypes.BLOB(attributes.length);
    } else if (
      columnType === 'INT' ||
      columnType === 'INTEGER' ||
      columnType === 'SERIAL'
    ) {
      return DataTypes.INTEGER;
    } else if (columnType === 'FLOAT') {
      return DataTypes.FLOAT(attributes.length, attributes.decimals);
    } else if (
      columnType === 'BIGINT' ||
      columnType === 'SMALLINT' ||
      columnType === 'TINYINT' ||
      columnType === 'MEDIUMINT' ||
      columnType === 'DOUBLE' ||
      columnType === 'DECIMAL' ||
      columnType === 'REAL' ||
      columnType === 'NUMERIC'
    ) {
      return DataTypes.NUMBER(getNumberProps(attributes));
    }

    throw new Error(`Unknown column type: ${columnType}`);
  }

  delete attributes.constraints;
  attributes.label = attributes.name;
  delete attributes.name;

  return [getDataType(), attributes];
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
