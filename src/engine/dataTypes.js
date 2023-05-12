const dataTypes = {
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
  }
}

module.exports.dataTypes = dataTypes
