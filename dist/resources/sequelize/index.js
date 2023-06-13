"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importResources = exports.SequelizeModel = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../middle/database");
const fs = require("fs");
const utils_1 = require("../openapi/utils");
class SequelizeModel extends sequelize_1.Model {
}
exports.SequelizeModel = SequelizeModel;
function generateResourcesFromJSON(jsonSchema) {
    const resources = {};
    for (const table of jsonSchema.tables) {
        const tableColumns = {};
        const tableName = getTableName(table.name);
        const singleName = (0, utils_1.convertToSingle)(tableName);
        const resurceName = getResourceName(table.name);
        const resource = {
            primaryKey: null,
            columns: {},
            search: table.search,
            name: table.name
        };
        for (const column of table.columns) {
            const columnName = column.name;
            const columnType = getSequelizeDataType(column);
            const primaryKey = column.primaryKey ?? false;
            const allowNull = column.allowNull ?? false;
            const defaultValue = column.defaultValue;
            const unique = column.unique ?? false;
            column.required = !allowNull || column.required;
            tableColumns[columnName] = {
                type: columnType,
                allowNull,
                primaryKey,
                references: null,
                autoIncrement: column.autoIncrement || false,
                defaultValue,
                unique
            };
            if (primaryKey) {
                resource.primaryKey = columnName;
            }
            resource.columns[columnName] = column;
        }
        class DynamicTable extends sequelize_1.Model {
        }
        DynamicTable.init(tableColumns, {
            sequelize: database_1.global.getSequelize(),
            modelName: singleName
        });
        resource.model = DynamicTable;
        resources[resurceName] = resource;
    }
    // Configurar as associações entre os modelos
    for (const table of jsonSchema.tables) {
        const resurceName = getResourceName(table.name);
        const model = resources[resurceName].model;
        for (const column of table.columns) {
            if (!column.reference) {
                continue;
            }
            const tableName = getTableName(column.reference);
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
            }
            else {
                resources[resurceName].relationships?.push({
                    model: referencedModel,
                    as: column.name
                });
            }
        }
    }
    return resources;
}
function getResourceName(name) {
    // se terminar com s, remove o s
    const lastPosition = name.length - 1;
    if (name.lastIndexOf('s') !== lastPosition) {
        return name.slice(0, -1).toLocaleLowerCase();
    }
    return name.toLocaleLowerCase();
}
function getTableName(name) {
    return name.toLowerCase();
}
function getDefaultValue(columnConstraints, columnType) {
    const columnTypeString = columnType.valueOf().toString();
    const defaultValue = columnConstraints.find((constraint) => constraint.startsWith('DEFAULT'));
    if (defaultValue) {
        const value = defaultValue.split('DEFAULT ')[1];
        if (value === 'NULL') {
            return null;
        }
        if (columnTypeString === sequelize_1.DataTypes.INTEGER.name) {
            return parseInt(value);
        }
        if (columnTypeString === sequelize_1.DataTypes.FLOAT.name) {
            return parseFloat(value);
        }
        if (columnTypeString === sequelize_1.DataTypes.BOOLEAN.name) {
            return value === 'true';
        }
        if (columnTypeString === sequelize_1.DataTypes.STRING.name ||
            columnTypeString === sequelize_1.DataTypes.ENUM.name ||
            columnTypeString === sequelize_1.DataTypes.CHAR.name ||
            columnTypeString === sequelize_1.DataTypes.TEXT.name) {
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
function getSequelizeDataType(column) {
    const { type, ...attributes } = column;
    const columnType = type.toUpperCase();
    if ((columnType.includes('TEXT') || columnType.includes('VARCHAR')) &&
        attributes.maxLength) {
        return sequelize_1.DataTypes.STRING(attributes.maxLength, attributes.binary);
    }
    else if (columnType === 'STRING') {
        return sequelize_1.DataTypes.STRING(attributes.maxLength, attributes.binary);
    }
    else if (columnType === 'CHAR') {
        return sequelize_1.DataTypes.CHAR(attributes.maxLength, attributes.binary);
    }
    else if (columnType === 'TEXT') {
        return sequelize_1.DataTypes.TEXT;
    }
    else if (columnType === 'DATE') {
        return sequelize_1.DataTypes.DATE(attributes.maxLength);
    }
    else if (columnType === 'TIME') {
        return sequelize_1.DataTypes.TIME;
    }
    else if (columnType === 'NOW') {
        return sequelize_1.DataTypes.NOW;
    }
    else if (columnType === 'BOOLEAN') {
        return sequelize_1.DataTypes.BOOLEAN;
    }
    else if (columnType === 'UUID') {
        return sequelize_1.DataTypes.UUID;
    }
    else if (columnType === 'ENUM') {
        return sequelize_1.DataTypes.ENUM.apply(null, attributes.values);
    }
    else if (columnType === 'JSON' || columnType === 'JSONTYPE') {
        return sequelize_1.DataTypes.JSON;
    }
    else if (columnType === 'INT' ||
        columnType === 'INTEGER' ||
        columnType === 'SERIAL') {
        return sequelize_1.DataTypes.INTEGER;
    }
    else if (columnType === 'FLOAT') {
        return sequelize_1.DataTypes.FLOAT(attributes.length, attributes.decimals);
    }
    else if (columnType === 'BIGINT' ||
        columnType === 'SMALLINT' ||
        columnType === 'TINYINT' ||
        columnType === 'MEDIUMINT' ||
        columnType === 'DOUBLE' ||
        columnType === 'DECIMAL' ||
        columnType === 'REAL' ||
        columnType === 'NUMERIC') {
        return sequelize_1.DataTypes.NUMBER(getNumberProps(attributes));
    }
    else if (columnType === 'CODE') {
        return sequelize_1.DataTypes.STRING(attributes.maxLength, attributes.binary);
    }
    throw new Error(`Unknown column type: ${columnType}`);
}
function getSequelizeConstraints(columnConstraints) {
    // Remover a referência ao modelo pai da restrição de chave estrangeira
    return columnConstraints.filter((constraint) => !constraint.includes('REFERENCES'));
}
function parseReferences(columnConstraints) {
    // Analisar a referência da restrição de chave estrangeira, se existir
    const referencesConstraint = columnConstraints.find((constraint) => constraint.includes('REFERENCES'));
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
function importResources(target) {
    const schemaJson = typeof target === 'string'
        ? JSON.parse(fs.readFileSync(target, 'utf8'))
        : target;
    const resource = generateResourcesFromJSON(schemaJson);
    return resource;
}
exports.importResources = importResources;
//# sourceMappingURL=index.js.map