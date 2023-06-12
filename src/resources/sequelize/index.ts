import { DataTypes, Model } from 'sequelize';
import { global } from '../../middle/database';
import * as fs from 'fs';

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
  search?: string[];
}

export interface Column {
  name: string;
  type: string;
  constraints?: string[];
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
  name: string;
  primaryKey: string | null;
  columns: Record<string, Column>;
  relationships?: Relationship[];
  search?: string[];
}

export interface Resources {
  [resurceName: string]: Resource;
}

function generateResourcesFromJSON(jsonSchema: Schema): Resources {
  const resources: Resources = {};

  for (const table of jsonSchema.tables) {
    const tableColumns: Record<string, any> = {};
    const tableName = getTableName(table.name);
    const resurceName = getResourceName(table.name);
    const resource = {
      primaryKey: null,
      columns: {},
      search: table.search,
      name: table.name
    } as Resource;

    for (const column of table.columns) {
      const columnName = column.name;
      const columnType = getSequelizeDataType(column);
      const columnConstraints = column.constraints
        ? getSequelizeConstraints(column.constraints)
        : [];

      const primaryKey =
        column.primaryKey || columnConstraints.includes('PRIMARY KEY');
      const allowNull =
        column.allowNull !== undefined
          ? column.allowNull
          : column.constraints
          ? !columnConstraints.includes('NOT NULL')
          : false;
      const defaultValue =
        column.defaultValue || getDefaultValue(columnConstraints, columnType);
      const unique = column.unique || columnConstraints.includes('UNIQUE');

      column.required = !allowNull || column.required;

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

      resource.columns[columnName] = column;
    }

    class Table extends Model {}

    Table.init(tableColumns, {
      sequelize: global.getSequelize(),
      tableName
    });

    resource.model = Table;

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
  // se terminar com s, remove o s
  const lastPosition = name.length - 1;
  if (name.lastIndexOf('s') !== lastPosition) {
    return name.slice(0, -1).toLocaleLowerCase();
  }

  return name.toLocaleLowerCase();
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

function getSequelizeDataType(column: Column): DataTypesResult {
  const { type, ...attributes } = column;

  const columnType = type.toUpperCase();

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

export function importResources(target: string | Schema): Resources {
  const schemaJson =
    typeof target === 'string'
      ? JSON.parse(fs.readFileSync(target, 'utf8'))
      : target;

  const resource = generateResourcesFromJSON(schemaJson);

  return resource;
}
