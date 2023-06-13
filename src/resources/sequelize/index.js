"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    SequelizeModel: function() {
        return SequelizeModel;
    },
    importResources: function() {
        return importResources;
    }
});
const _sequelize = require("sequelize");
const _database = require("../../middle/database");
const _fs = /*#__PURE__*/ _interop_require_wildcard(require("fs"));
const _utils = require("../openapi/utils");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _assert_this_initialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _get_prototype_of(o) {
    _get_prototype_of = Object.setPrototypeOf ? Object.getPrototypeOf : function getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _get_prototype_of(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = _object_without_properties_loose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function _possible_constructor_return(self, call) {
    if (call && (_type_of(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assert_this_initialized(self);
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _is_native_reflect_construct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
        return true;
    } catch (e) {
        return false;
    }
}
function _create_super(Derived) {
    var hasNativeReflectConstruct = _is_native_reflect_construct();
    return function _createSuperInternal() {
        var Super = _get_prototype_of(Derived), result;
        if (hasNativeReflectConstruct) {
            var NewTarget = _get_prototype_of(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
        } else {
            result = Super.apply(this, arguments);
        }
        return _possible_constructor_return(this, result);
    };
}
var SequelizeModel = /*#__PURE__*/ function(Model) {
    "use strict";
    _inherits(SequelizeModel, Model);
    var _super = _create_super(SequelizeModel);
    function SequelizeModel() {
        _class_call_check(this, SequelizeModel);
        return _super.apply(this, arguments);
    }
    return SequelizeModel;
}(_sequelize.Model);
function generateResourcesFromJSON(jsonSchema) {
    var resources = {};
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        var _loop = function() {
            var table = _step.value;
            var tableColumns = {};
            var tableName = getTableName(table.name);
            var singleName = (0, _utils.convertToSingle)(tableName);
            var resurceName = getResourceName(table.name);
            var resource = {
                primaryKey: null,
                columns: {},
                search: table.search,
                name: table.name
            };
            var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
            try {
                for(var _iterator = table.columns[Symbol.iterator](), _step1; !(_iteratorNormalCompletion = (_step1 = _iterator.next()).done); _iteratorNormalCompletion = true){
                    var column = _step1.value;
                    var columnName = column.name;
                    var columnType = getSequelizeDataType(column);
                    var _column_primaryKey;
                    var primaryKey = (_column_primaryKey = column.primaryKey) !== null && _column_primaryKey !== void 0 ? _column_primaryKey : false;
                    var _column_allowNull;
                    var allowNull = (_column_allowNull = column.allowNull) !== null && _column_allowNull !== void 0 ? _column_allowNull : false;
                    var defaultValue = column.defaultValue;
                    var _column_unique;
                    var unique = (_column_unique = column.unique) !== null && _column_unique !== void 0 ? _column_unique : false;
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
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                    }
                } finally{
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
            var DynamicTable = /*#__PURE__*/ function(Model) {
                "use strict";
                _inherits(DynamicTable, Model);
                var _super = _create_super(DynamicTable);
                function DynamicTable() {
                    _class_call_check(this, DynamicTable);
                    return _super.apply(this, arguments);
                }
                return DynamicTable;
            }(_sequelize.Model);
            DynamicTable.init(tableColumns, {
                sequelize: _database.global.getSequelize(),
                modelName: singleName
            });
            resource.model = DynamicTable;
            resources[resurceName] = resource;
        };
        for(var _iterator = jsonSchema.tables[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
    try {
        // Configurar as associações entre os modelos
        for(var _iterator1 = jsonSchema.tables[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
            var table = _step1.value;
            var resurceName = getResourceName(table.name);
            var model = resources[resurceName].model;
            var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
            try {
                for(var _iterator2 = table.columns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                    var column = _step2.value;
                    if (!column.reference) {
                        continue;
                    }
                    var tableName = getTableName(column.reference);
                    var referencedTable = getResourceName(tableName);
                    var referencedModel = resources[referencedTable].model;
                    model.belongsTo(referencedModel, {
                        foreignKey: column.name
                    });
                    referencedModel.hasMany(model, {
                        foreignKey: column.name
                    });
                    if (resources[resurceName].relationships === undefined) {
                        resources[resurceName].relationships = [
                            {
                                model: referencedModel,
                                as: column.name
                            }
                        ];
                    } else {
                        var _resources_resurceName_relationships_push, _object;
                        (_object = resources[resurceName].relationships) === null || _object === void 0 ? void 0 : (_resources_resurceName_relationships_push = _object.push) === null || _resources_resurceName_relationships_push === void 0 ? void 0 : _resources_resurceName_relationships_push.call(_object, {
                            model: referencedModel,
                            as: column.name
                        });
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                        _iterator2.return();
                    }
                } finally{
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError1 = true;
        _iteratorError1 = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                _iterator1.return();
            }
        } finally{
            if (_didIteratorError1) {
                throw _iteratorError1;
            }
        }
    }
    return resources;
}
function getResourceName(name) {
    // se terminar com s, remove o s
    var lastPosition = name.length - 1;
    if (name.lastIndexOf("s") !== lastPosition) {
        return name.slice(0, -1).toLocaleLowerCase();
    }
    return name.toLocaleLowerCase();
}
function getTableName(name) {
    return name.toLowerCase();
}
function getDefaultValue(columnConstraints, columnType) {
    var columnTypeString = columnType.valueOf().toString();
    var defaultValue = columnConstraints.find(function(constraint) {
        return constraint.startsWith("DEFAULT");
    });
    if (defaultValue) {
        var value = defaultValue.split("DEFAULT ")[1];
        if (value === "NULL") {
            return null;
        }
        if (columnTypeString === _sequelize.DataTypes.INTEGER.name) {
            return parseInt(value);
        }
        if (columnTypeString === _sequelize.DataTypes.FLOAT.name) {
            return parseFloat(value);
        }
        if (columnTypeString === _sequelize.DataTypes.BOOLEAN.name) {
            return value === "true";
        }
        if (columnTypeString === _sequelize.DataTypes.STRING.name || columnTypeString === _sequelize.DataTypes.ENUM.name || columnTypeString === _sequelize.DataTypes.CHAR.name || columnTypeString === _sequelize.DataTypes.TEXT.name) {
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
    var type = column.type, attributes = _object_without_properties(column, [
        "type"
    ]);
    var columnType = type.toUpperCase();
    if ((columnType.includes("TEXT") || columnType.includes("VARCHAR")) && attributes.maxLength) {
        return _sequelize.DataTypes.STRING(attributes.maxLength, attributes.binary);
    } else if (columnType === "STRING") {
        return _sequelize.DataTypes.STRING(attributes.maxLength, attributes.binary);
    } else if (columnType === "CHAR") {
        return _sequelize.DataTypes.CHAR(attributes.maxLength, attributes.binary);
    } else if (columnType === "TEXT") {
        return _sequelize.DataTypes.TEXT;
    } else if (columnType === "DATE") {
        return _sequelize.DataTypes.DATE(attributes.maxLength);
    } else if (columnType === "TIME") {
        return _sequelize.DataTypes.TIME;
    } else if (columnType === "NOW") {
        return _sequelize.DataTypes.NOW;
    } else if (columnType === "BOOLEAN") {
        return _sequelize.DataTypes.BOOLEAN;
    } else if (columnType === "UUID") {
        return _sequelize.DataTypes.UUID;
    } else if (columnType === "ENUM") {
        return _sequelize.DataTypes.ENUM.apply(null, attributes.values);
    } else if (columnType === "JSON" || columnType === "JSONTYPE") {
        return _sequelize.DataTypes.JSON;
    } else if (columnType === "INT" || columnType === "INTEGER" || columnType === "SERIAL") {
        return _sequelize.DataTypes.INTEGER;
    } else if (columnType === "FLOAT") {
        return _sequelize.DataTypes.FLOAT(attributes.length, attributes.decimals);
    } else if (columnType === "BIGINT" || columnType === "SMALLINT" || columnType === "TINYINT" || columnType === "MEDIUMINT" || columnType === "DOUBLE" || columnType === "DECIMAL" || columnType === "REAL" || columnType === "NUMERIC") {
        return _sequelize.DataTypes.NUMBER(getNumberProps(attributes));
    } else if (columnType === "CODE") {
        return _sequelize.DataTypes.STRING(attributes.maxLength, attributes.binary);
    }
    throw new Error("Unknown column type: ".concat(columnType));
}
function getSequelizeConstraints(columnConstraints) {
    // Remover a referência ao modelo pai da restrição de chave estrangeira
    return columnConstraints.filter(function(constraint) {
        return !constraint.includes("REFERENCES");
    });
}
function parseReferences(columnConstraints) {
    // Analisar a referência da restrição de chave estrangeira, se existir
    var referencesConstraint = columnConstraints.find(function(constraint) {
        return constraint.includes("REFERENCES");
    });
    if (referencesConstraint) {
        var referencedTable = getReferencedTableName([
            referencesConstraint
        ]);
        return {
            model: referencedTable,
            key: "id" // Assumindo que a coluna referenciada é sempre 'id'
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
    var schemaJson = typeof target === "string" ? JSON.parse(_fs.readFileSync(target, "utf8")) : target;
    var resource = generateResourcesFromJSON(schemaJson);
    return resource;
}
