import { Resource } from '../sequelize';
import { convertType } from './dataTypes';
import { AdminReferences, OpenAPI, Operation } from './openapiTypes';
import { makeResponses } from './responses';
import { convertToPlural, convertToSingle } from './utils';

export interface Tags {
  create: string[];
  read: string[];
  update: string[];
  delete: string[];
  list: string[];
}

interface Property {
  type: string;
  description: string;
  maxLength?: number;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  default?: any;
  imutable?: boolean;
  anyOf?: Property[];
  allOf?: Property[];
  oneOf?: Property[];
  not?: Property;
  items?: Property;
  required?: string[];
  properties?: SchemaProperties;
  additionalProperties?: boolean;
  format?: string;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  'x-admin-type'?: string;
}

interface SchemaProperties {
  [key: string]: Property;
}

const resolveTags = (name: string, tags: string[] = []): string[] => {
  const resourceName = name.toLowerCase();

  return tags.map((tag) => {
    if (tag.indexOf('$name') > -1) {
      return tag.replace('$name', resourceName);
    }

    return tag;
  });
};

const removeImutable = (
  properties: SchemaProperties,
  removeOnlyAllProp: boolean = false
): SchemaProperties => {
  const newProperties: SchemaProperties = {};

  Object.entries(properties).forEach(([key, value]) => {
    const imutable = value.imutable;

    delete value.imutable;

    if (removeOnlyAllProp && imutable) {
      return;
    }

    newProperties[key] = value;
  });

  return newProperties;
};

export function generateOpenapiSchemas(
  resource: Resource,
  tags: Tags
): OpenAPI {
  const { model, columns, search, name } = resource;
  const resourceName = name.toLowerCase();
  const singleName = convertToSingle(name);
  const pluralName = convertToPlural(resourceName);
  const groupName = singleName.charAt(0).toUpperCase() + singleName.slice(1);

  const attributeKeys = Object.keys(model.getAttributes());
  const properties: SchemaProperties = {};
  const required: string[] = [];

  attributeKeys.forEach((key) => {
    const column = columns[key];
    const attribute = model.getAttributes()[key];
    const propertyType = convertType(attribute.type.constructor.name);

    const property: Property = {
      ...propertyType,
      description: `${name} ${key}`
    };

    if (
      property.type === 'string' &&
      'maxLength' in column &&
      column.maxLength !== undefined
    ) {
      property.maxLength = column.maxLength;
    }

    if (attribute.type.constructor.name === 'ENUM') {
      property.type = 'string';
      property.enum = column.values;
    }

    if ('min' in column) {
      property.minimum = column.min;
    }

    if ('max' in column) {
      property.maximum = column.max;
    }

    if ('defaultValue' in column) {
      property.default = column.defaultValue;
    }

    if ('imutable' in column) {
      property.imutable = column.imutable;
    }

    if (column.allowNull === true) {
      property.nullable = true;
    }

    property['x-admin-type'] = column.type;

    properties[key] = property;
    if (!attribute.allowNull || column.required) {
      required.push(key);
    }
  });

  const makeAllResponseProperties = (): any => {
    return {
      data: {
        type: 'array',
        properties: {
          type: 'object',
          properties: { ...properties }
        }
      },
      meta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          totalPages: { type: 'integer' },
          totalItems: { type: 'integer' }
        }
      }
    };
  };

  const makeRequestProperties = (): SchemaProperties => {
    return removeImutable(properties, false);
  };

  const makeCreateUpdateProperties = (): SchemaProperties => {
    const postProperties = { ...properties };
    delete postProperties.id;
    delete postProperties.createdAt;
    delete postProperties.updatedAt;
    return removeImutable(postProperties, true);
  };

  const getOrderByEnumValues = (): string[] => {
    const sortFields = Object.keys(properties);
    return sortFields.map((field) =>
      field.startsWith('-') ? field.substr(1) : field
    );
  };

  const createUpdateProperties = makeCreateUpdateProperties();

  const requestProperties = makeRequestProperties();

  const responseResolvedPost = makeResponses(
    name,
    201,
    requestProperties,
    true
  );
  const responseResolvedDelete = makeResponses(name, 204, requestProperties);
  const responseResolvedGetAndPut = makeResponses(name, 200, requestProperties);
  const responseResolvedList = makeResponses(
    name,
    200,
    makeAllResponseProperties()
  );

  const operationGet: Operation = {
    summary: `List ${name}`,
    description: `List and search ${name}`,
    tags: resolveTags(name, tags.list),
    'x-admin': {
      types: (() => {
        if (search && search.length > 0) {
          return ['list', 'search'];
        } else {
          return ['list'];
        }
      })(),
      groupName,
      resourceName: 'List',
      references: (() => {
        const references: AdminReferences = {
          list: {
            query: {
              pageSize: 'page_size',
              page: 'page',
              orderBy: 'order_by',
              order: 'order',
              searchTerm: 'search'
            }
          }
        };

        if (search && search.length > 0) {
          references.search = {
            query: {
              pageSize: 'page_size',
              page: 'page',
              orderBy: 'order_by',
              order: 'order',
              searchTerm: 'search'
            }
          };
        }

        return references;
      })()
    },
    parameters: [
      {
        name: 'page',
        in: 'query',
        description: 'Page number',
        schema: {
          type: 'integer',
          minimum: 1
        }
      },
      {
        name: 'page_size',
        in: 'query',
        description: 'Number of items per page',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100
        }
      },
      {
        name: 'search',
        in: 'query',
        description: 'Search query string',
        schema: {
          type: 'string'
        }
      },
      {
        name: 'order_by',
        in: 'query',
        description: 'Order field',
        schema: {
          type: 'string',
          enum: getOrderByEnumValues()
        }
      },
      {
        name: 'order',
        in: 'query',
        description: 'Order direction',
        schema: {
          type: 'string',
          enum: ['desc', 'asc']
        }
      }
    ],
    responses: responseResolvedList
  };

  return {
    paths: {
      [`/api/${pluralName}`]: {
        get: {
          summary: `List ${name}`,
          description: `List and search ${name}`,
          tags: resolveTags(name, tags.list),
          'x-admin': {
            types: (() => {
              if (search && search.length > 0) {
                return ['list', 'search'];
              } else {
                return ['list'];
              }
            })(),
            groupName,
            resourceName: 'List',
            references: (() => {
              const references: AdminReferences = {
                list: {
                  query: {
                    pageSize: 'page_size',
                    page: 'page',
                    orderBy: 'order_by',
                    order: 'order',
                    searchTerm: 'search'
                  }
                }
              };

              if (search && search.length > 0) {
                references.search = {
                  query: {
                    pageSize: 'page_size',
                    page: 'page',
                    orderBy: 'order_by',
                    order: 'order',
                    searchTerm: 'search'
                  }
                };
              }

              return references;
            })()
          },
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: {
                type: 'integer',
                minimum: 1
              }
            },
            {
              name: 'page_size',
              in: 'query',
              description: 'Number of items per page',
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100
              }
            },
            {
              name: 'search',
              in: 'query',
              description: 'Search query string',
              schema: {
                type: 'string'
              }
            },
            {
              name: 'order_by',
              in: 'query',
              description: 'Order field',
              schema: {
                type: 'string',
                enum: getOrderByEnumValues()
              }
            },
            {
              name: 'order',
              in: 'query',
              description: 'Order direction',
              schema: {
                type: 'string',
                enum: ['desc', 'asc']
              }
            }
          ],
          responses: responseResolvedList
        },
        post: {
          summary: `Create ${name}`,
          'x-admin': {
            types: ['create'],
            groupName,
            resourceName: 'Create'
          },
          description: `Create ${name}`,
          tags: resolveTags(name, tags.create),
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: createUpdateProperties
                }
              }
            }
          },
          responses: responseResolvedPost
        }
      },
      [`/api/${pluralName}/{id}`]: {
        get: {
          summary: `Get ${name} by ID`,
          'x-admin': {
            types: ['read'],
            groupName,
            resourceName: 'Read'
          },
          description: `Get ${name} by ID`,
          tags: resolveTags(name, tags.read),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${name} ID`,
              schema: {
                type: 'integer'
              },
              required: true
            }
          ],
          responses: responseResolvedGetAndPut
        },
        put: {
          summary: `Update ${name}`,
          'x-admin': {
            types: ['update'],
            groupName,
            resourceName: 'Update'
          },
          description: `Update ${name}`,
          tags: resolveTags(name, tags.update),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${name} ID`,
              schema: {
                type: 'integer'
              },
              required: true
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: createUpdateProperties
                }
              }
            }
          },
          responses: responseResolvedGetAndPut
        },
        delete: {
          summary: `Delete ${name}`,
          'x-admin': {
            types: ['delete'],
            groupName,
            resourceName: 'Delete'
          },
          description: `Delete ${name}`,
          tags: resolveTags(name, tags.delete),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${name} ID`,
              schema: {
                type: 'integer'
              },
              required: true
            }
          ],
          responses: responseResolvedDelete
        }
      }
    }
  };
}
