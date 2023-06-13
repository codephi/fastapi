function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
export var dataTypes = {
    STRING: {
        type: "string"
    },
    CHAR: {
        type: "string"
    },
    TEXT: {
        type: "string"
    },
    INTEGER: {
        type: "integer"
    },
    BIGINT: {
        type: "integer"
    },
    FLOAT: {
        type: "number"
    },
    REAL: {
        type: "number"
    },
    DOUBLE: {
        type: "number"
    },
    DECIMAL: {
        type: "number"
    },
    BOOLEAN: {
        type: "boolean"
    },
    ENUM: {
        type: "string"
    },
    DATE: {
        type: "string",
        format: "date-time"
    },
    DATEONLY: {
        type: "string",
        format: "date"
    },
    TIME: {
        type: "string",
        format: "time"
    },
    NOW: {
        type: "string",
        format: "date-time"
    },
    UUID: {
        type: "string",
        format: "uuid"
    },
    UUIDV1: {
        type: "string",
        format: "uuid"
    },
    UUIDV4: {
        type: "string",
        format: "uuid"
    },
    ARRAY: {
        type: "array"
    },
    JSON: {
        type: "object"
    },
    JSONB: {
        type: "object"
    },
    VARCHAR: {
        type: "string"
    },
    "DOUBLE PRECISION": {
        type: "number"
    },
    "TIMESTAMP WITH TIME ZONE": {
        type: "string",
        format: "date-time"
    },
    "TIMESTAMP WITHOUT TIME ZONE": {
        type: "string",
        format: "date-time"
    },
    "TIME WITH TIME ZONE": {
        type: "string",
        format: "time"
    },
    "TIME WITHOUT TIME ZONE": {
        type: "string",
        format: "time"
    }
};
export var convertType = function(sequelizeType) {
    var propertyType = dataTypes[sequelizeType];
    if (propertyType === undefined) {
        var occurrence = sequelizeType.search(/[([]/);
        if (occurrence > -1) {
            var complex = sequelizeType.split(/[([]/);
            var type = complex[0];
            var lengthString = complex[1].split(/[)\]]/)[0];
            var maxLength = parseInt(lengthString) || undefined;
            var typeDefinition = dataTypes[type];
            if (typeDefinition !== undefined) {
                if (type !== "DECIMAL" && maxLength !== undefined) {
                    return _object_spread_props(_object_spread({}, typeDefinition), {
                        maxLength: maxLength
                    });
                }
                return typeDefinition;
            }
        }
        throw new Error("Unknown data type: ".concat(sequelizeType));
    }
    return propertyType;
};
