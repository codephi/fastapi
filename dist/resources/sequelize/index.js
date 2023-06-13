"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importResources = exports.SequelizeModel = void 0;
var sequelize_1 = require("sequelize");
var database_1 = require("../../middle/database");
var fs = require("fs");
var utils_1 = require("../openapi/utils");
var SequelizeModel = /** @class */ (function (_super) {
    __extends(SequelizeModel, _super);
    function SequelizeModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SequelizeModel;
}(sequelize_1.Model));
exports.SequelizeModel = SequelizeModel;
function generateResourcesFromJSON(jsonSchema) {
    var _a, _b, _c, _d;
    var resources = {};
    for (var _i = 0, _e = jsonSchema.tables; _i < _e.length; _i++) {
        var table = _e[_i];
        var tableColumns = {};
        var tableName = getTableName(table.name);
        var singleName = (0, utils_1.convertToSingle)(tableName);
        var resurceName = getResourceName(table.name);
        var resource = {
            primaryKey: null,
            columns: {},
            search: table.search,
            name: table.name
        };
        for (var _f = 0, _g = table.columns; _f < _g.length; _f++) {
            var column = _g[_f];
            var columnName = column.name;
            var columnType = getSequelizeDataType(column);
            var primaryKey = (_a = column.primaryKey) !== null && _a !== void 0 ? _a : false;
            var allowNull = (_b = column.allowNull) !== null && _b !== void 0 ? _b : false;
            var defaultValue = column.defaultValue;
            var unique = (_c = column.unique) !== null && _c !== void 0 ? _c : false;
            column.required = !allowNull || column.required;
            tableColumns[columnName] = {
                type: columnType,
                allowNull: allowNull,
                primaryKey: primaryKey,
                references: null,
                autoIncrement: column.autoIncrement || false,
                defaultValue: defaultValue,
                unique: unique
            };
            if (primaryKey) {
                resource.primaryKey = columnName;
            }
            resource.columns[columnName] = column;
        }
        var DynamicTable = /** @class */ (function (_super) {
            __extends(DynamicTable, _super);
            function DynamicTable() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return DynamicTable;
        }(sequelize_1.Model));
        DynamicTable.init(tableColumns, {
            sequelize: database_1.global.getSequelize(),
            modelName: singleName
        });
        resource.model = DynamicTable;
        resources[resurceName] = resource;
    }
    // Configurar as associações entre os modelos
    for (var _h = 0, _j = jsonSchema.tables; _h < _j.length; _h++) {
        var table = _j[_h];
        var resurceName = getResourceName(table.name);
        var model = resources[resurceName].model;
        for (var _k = 0, _l = table.columns; _k < _l.length; _k++) {
            var column = _l[_k];
            if (!column.reference) {
                continue;
            }
            var tableName = getTableName(column.reference);
            var referencedTable = getResourceName(tableName);
            var referencedModel = resources[referencedTable].model;
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
                (_d = resources[resurceName].relationships) === null || _d === void 0 ? void 0 : _d.push({
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
    var lastPosition = name.length - 1;
    if (name.lastIndexOf('s') !== lastPosition) {
        return name.slice(0, -1).toLocaleLowerCase();
    }
    return name.toLocaleLowerCase();
}
function getTableName(name) {
    return name.toLowerCase();
}
function getDefaultValue(columnConstraints, columnType) {
    var columnTypeString = columnType.valueOf().toString();
    var defaultValue = columnConstraints.find(function (constraint) {
        return constraint.startsWith('DEFAULT');
    });
    if (defaultValue) {
        var value = defaultValue.split('DEFAULT ')[1];
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
    var params = {};
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
    var type = column.type, attributes = __rest(column, ["type"]);
    var columnType = type.toUpperCase();
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
    throw new Error("Unknown column type: ".concat(columnType));
}
function getSequelizeConstraints(columnConstraints) {
    // Remover a referência ao modelo pai da restrição de chave estrangeira
    return columnConstraints.filter(function (constraint) { return !constraint.includes('REFERENCES'); });
}
function parseReferences(columnConstraints) {
    // Analisar a referência da restrição de chave estrangeira, se existir
    var referencesConstraint = columnConstraints.find(function (constraint) {
        return constraint.includes('REFERENCES');
    });
    if (referencesConstraint) {
        var referencedTable = getReferencedTableName([referencesConstraint]);
        return {
            model: referencedTable,
            key: 'id' // Assumindo que a coluna referenciada é sempre 'id'
        };
    }
    return null;
}
function getReferencedTableName(constraints) {
    // Extrair o nome da tabela referenciada da restrição de chave estrangeira
    var referenceRegex = /REFERENCES\s+(\w+)\s+\(.*\)/;
    var match = constraints[0].match(referenceRegex);
    if (match) {
        return match[1];
    }
    return null;
}
function importResources(target) {
    var schemaJson = typeof target === 'string'
        ? JSON.parse(fs.readFileSync(target, 'utf8'))
        : target;
    var resource = generateResourcesFromJSON(schemaJson);
    return resource;
}
exports.importResources = importResources;
