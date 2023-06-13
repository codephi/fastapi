"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertType = exports.dataTypes = void 0;
exports.dataTypes = {
    STRING: {
        type: 'string'
    },
    CHAR: {
        type: 'string'
    },
    TEXT: {
        type: 'string'
    },
    INTEGER: {
        type: 'integer'
    },
    BIGINT: {
        type: 'integer'
    },
    FLOAT: {
        type: 'number'
    },
    REAL: {
        type: 'number'
    },
    DOUBLE: {
        type: 'number'
    },
    DECIMAL: {
        type: 'number'
    },
    BOOLEAN: {
        type: 'boolean'
    },
    ENUM: {
        type: 'string'
    },
    DATE: {
        type: 'string',
        format: 'date-time'
    },
    DATEONLY: {
        type: 'string',
        format: 'date'
    },
    TIME: {
        type: 'string',
        format: 'time'
    },
    NOW: {
        type: 'string',
        format: 'date-time'
    },
    UUID: {
        type: 'string',
        format: 'uuid'
    },
    UUIDV1: {
        type: 'string',
        format: 'uuid'
    },
    UUIDV4: {
        type: 'string',
        format: 'uuid'
    },
    ARRAY: {
        type: 'array'
    },
    JSON: {
        type: 'object'
    },
    JSONB: {
        type: 'object'
    },
    VARCHAR: {
        type: 'string'
    },
    'DOUBLE PRECISION': {
        type: 'number'
    },
    'TIMESTAMP WITH TIME ZONE': {
        type: 'string',
        format: 'date-time'
    },
    'TIMESTAMP WITHOUT TIME ZONE': {
        type: 'string',
        format: 'date-time'
    },
    'TIME WITH TIME ZONE': {
        type: 'string',
        format: 'time'
    },
    'TIME WITHOUT TIME ZONE': {
        type: 'string',
        format: 'time'
    }
};
var convertType = function (sequelizeType) {
    var propertyType = exports.dataTypes[sequelizeType];
    if (propertyType === undefined) {
        var occurrence = sequelizeType.search(/[([]/);
        if (occurrence > -1) {
            var complex = sequelizeType.split(/[([]/);
            var type = complex[0];
            var lengthString = complex[1].split(/[)\]]/)[0];
            var maxLength = parseInt(lengthString) || undefined;
            var typeDefinition = exports.dataTypes[type];
            if (typeDefinition !== undefined) {
                if (type !== 'DECIMAL' && maxLength !== undefined) {
                    return __assign(__assign({}, typeDefinition), { maxLength: maxLength });
                }
                return typeDefinition;
            }
        }
        throw new Error("Unknown data type: ".concat(sequelizeType));
    }
    return propertyType;
};
exports.convertType = convertType;
