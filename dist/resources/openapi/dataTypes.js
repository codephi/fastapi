"use strict";
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
const convertType = (sequelizeType) => {
    const propertyType = exports.dataTypes[sequelizeType];
    if (propertyType === undefined) {
        const occurrence = sequelizeType.search(/[([]/);
        if (occurrence > -1) {
            const complex = sequelizeType.split(/[([]/);
            const type = complex[0];
            const lengthString = complex[1].split(/[)\]]/)[0];
            const maxLength = parseInt(lengthString) || undefined;
            const typeDefinition = exports.dataTypes[type];
            if (typeDefinition !== undefined) {
                if (type !== 'DECIMAL' && maxLength !== undefined) {
                    return {
                        ...typeDefinition,
                        maxLength
                    };
                }
                return typeDefinition;
            }
        }
        throw new Error(`Unknown data type: ${sequelizeType}`);
    }
    return propertyType;
};
exports.convertType = convertType;
