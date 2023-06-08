import { DataTypes, Model } from 'sequelize';
import { global } from '../../middle/database';
import fs from 'fs';

export type DataTypesResult =
  | DataTypes.StringDataType
  | DataTypes.NumberDataType
  | DataTypes.DateDataType
  | DataTypes.DataType;

export interface Schema {
  tables: Table[];
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Column {
  name: string;
  type: string;
  constraints: string[];
  autoIncrement?: boolean;
  values?: string[];
  min?: number;
  max?: number;
  imutable?: boolean;
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  reference?: string;
  primaryKey?: boolean;
  allowNull?: boolean;
  search?: string[];
  label?: string;
  maxLength?: number;
  binary?: boolean;
  length?: number;
  decimals?: number;
}

export interface Relationship {
  model: typeof SequelizeModel;
  as: string;
}

export class SequelizeModel extends Model {}

export interface Resource {
  model: typeof SequelizeModel;
  primaryKey: string | null;
  columns: Record<string, any>;
  relationships?: Relationship[];
}

export interface Resources {
  [resurceName: string]: Resource;
}

function generateResourcesFromJSON(jsonSchema: { tables: Table[] }): Resources {
  const resources: Resources = {};

  for (const table of jsonSchema.tables) {
    const tableColumns: Record<string, any> = {};
    const tableName = getTableName(table.name);
    const resurceName = getResourceName(table.name);
    const resource = {
      primaryKey: null,
      columns: {}
    } as Resource;

    for (const column of table.columns) {
      const columnName = column.name;
      const [columnType, columnParams] = getSequelizeDataType(column);
      const columnConstraints = column.constraints
        ? getSequelizeConstraints(column.constraints)
        : [];

      const primaryKey =
        columnParams.primaryKey || columnConstraints.includes('PRIMARY KEY');
      const allowNull =
        columnParams.allowNull !== undefined
          ? columnParams.allowNull
          : column.constraints
          ? !columnConstraints.includes('NOT NULL')
          : false;
      const defaultValue =
        columnParams.defaultValue ||
        getDefaultValue(columnConstraints, columnType);
      const unique =
        columnParams.unique || columnConstraints.includes('UNIQUE');

      columnParams.required = !allowNull || columnParams.required;

      tableColumns[columnName] = {
        type: columnType,
        allowNull,
        primaryKey,
        references: parseReferences(columnConstraints),
        autoIncrement: column.autoIncrement || false,
        defaultValue,
        unique
      };

      if (primaryKey) {
        resource.primaryKey = columnName;
      }

      resource.columns[columnName] = columnParams;
    }

    resource.model = SequelizeModel.init(tableColumns, {
      sequelize: global.getSequelize(),
      tableName
    });

    resources[resurceName] = resource;
  }

  // Configurar as associações entre os modelos
  for (const table of jsonSchema.tables) {
    const resurceName = getResourceName(table.name);
    const model = resources[resurceName].model;

    for (const column of table.columns) {
      let tableName: string | null = null;

      if (column.reference) {
        tableName = getTableName(column.reference);
      } else if (column.constraints) {
        for (const constraints of column.constraints) {
          if (constraints.indexOf('REFERENCES') > -1) {
            tableName = getTableName(constraints.split(' ')[1]);
            break;
          }
        }
      }

      if (tableName === null) {
        continue;
      }

      const referencedTable = getResourceName(tableName);
      const referencedModel = resources[referencedTable].model;

      model.belongsTo(referencedModel, { foreignKey: column.name });
      referencedModel.hasMany(model, { foreignKey: column.name });

      if (resources[resurceName].relationships === undefined) {
        resources[resurceName].relationships = [
          {
            model: referencedModel,
            as: column.name
          }
        ];
      } else {
        resources[resurceName].relationships?.push({
          model: referencedModel,
          as: column.name
        });
      }
    }
  }

  return resources;
}

function getResourceName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1, -1);
}

function getTableName(name: string): string {
  return name.toLowerCase();
}

function getDefaultValue(
  columnConstraints: string[],
  columnType: DataTypesResult
): any {
  const columnTypeString = columnType.valueOf().toString();
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

function getNumberProps(attributes: Record<string, any>): Record<string, any> {
  const params: Record<string, any> = {};

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

function getSequelizeDataType(
  column: Column
): [DataTypesResult, Record<string, any>] {
  const { type: columnType, ...attributes } = column;

  function getDataType(): DataTypesResult {
    if (
      (columnType.includes('TEXT') || columnType.includes('VARCHAR')) &&
      attributes.maxLength
    ) {
      return DataTypes.STRING(attributes.maxLength, attributes.binary);
    } else if (columnType === 'STRING') {
      return DataTypes.STRING(attributes.maxLength, attributes.binary);
    } else if (columnType === 'CHAR') {
      return DataTypes.CHAR(attributes.maxLength, attributes.binary);
    } else if (columnType === 'TEXT') {
      return DataTypes.TEXT;
    } else if (columnType === 'DATE') {
      return DataTypes.DATE(attributes.maxLength);
    } else if (columnType === 'TIME') {
      return DataTypes.TIME;
    } else if (columnType === 'NOW') {
      return DataTypes.NOW;
    } else if (columnType === 'BOOLEAN') {
      return DataTypes.BOOLEAN;
    } else if (columnType === 'UUID') {
      return DataTypes.UUID;
    } else if (columnType === 'ENUM') {
      return DataTypes.ENUM.apply(null, attributes.values);
    } else if (columnType === 'JSON' || columnType === 'JSONTYPE') {
      return DataTypes.JSON;
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

  return [getDataType(), {}];
}

function getSequelizeConstraints(columnConstraints: string[]): string[] {
  // Remover a referência ao modelo pai da restrição de chave estrangeira
  return columnConstraints.filter(
    (constraint) => !constraint.includes('REFERENCES')
  );
}

function parseReferences(
  columnConstraints: string[]
): { model: string; key: string } | null {
  // Analisar a referência da restrição de chave estrangeira, se existir
  const referencesConstraint = columnConstraints.find((constraint) =>
    constraint.includes('REFERENCES')
  );

  if (referencesConstraint) {
    const referencedTable = getReferencedTableName([referencesConstraint]);
    return {
      model: referencedTable!,
      key: 'id' // Assumindo que a coluna referenciada é sempre 'id'
    };
  }

  return null;
}

function getReferencedTableName(constraints: string[]): string | null {
  // Extrair o nome da tabela referenciada da restrição de chave estrangeira
  const referenceRegex = /REFERENCES\s+(\w+)\s+\(.*\)/;
  const match = constraints[0].match(referenceRegex);

  if (match) {
    return match[1];
  }

  return null;
}

export function importSchema(target: string | object): Resources {
  const schemaJson =
    typeof target === 'string'
      ? JSON.parse(fs.readFileSync(target, 'utf8'))
      : target;

  const resource = generateResourcesFromJSON(schemaJson);

  return resource;
}
