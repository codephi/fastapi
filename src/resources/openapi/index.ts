import { Resource } from '../sequelize';
import { convertType } from './dataTypes';
import { AdminReferences, OpenAPI, Operation } from './openapiTypes';
import { makeResponses } from './responses';
import { resolvePlural } from './utils';

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
}

interface SchemaProperties {
  [key: string]: Property;
}

const resolveTags = (model: any, tags: string[] = []): string[] => {
  const resourceName = model.name.toLowerCase();

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
  const { model, columns, search } = resource;
  const resourceName = model.name.toLowerCase();
  const resourcePlural = resolvePlural(resourceName);
  const attributeKeys = Object.keys(model.getAttributes());
  const properties: SchemaProperties = {};
  const required: string[] = [];

  attributeKeys.forEach((key) => {
    const data = columns[key];
    const attribute = model.getAttributes()[key];
    const propertyType = convertType(attribute.type.constructor.name);

    const property: Property = {
      ...propertyType,
      description: `${model.name} ${key}`
    };

    if (
      property.type === 'string' &&
      'maxLength' in data &&
      data.maxLength !== undefined
    ) {
      property.maxLength = data.maxLength;
    }

    if (attribute.type.constructor.name === 'ENUM') {
      property.type = 'string';
      property.enum = data.values;
    }

    if ('min' in data) {
      property.minimum = data.min;
    }

    if ('max' in data) {
      property.maximum = data.max;
    }

    if ('defaultValue' in data) {
      property.default = data.defaultValue;
    }

    if ('imutable' in data) {
      property.imutable = data.imutable;
    }

    properties[key] = property;

    if (!attribute.allowNull || data.required) {
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

  const responseResolved = makeResponses(model.name, 200, requestProperties);
  const responseResolvedList = makeResponses(
    model.name,
    200,
    makeAllResponseProperties()
  );
  const responseResolvedConflict = makeResponses(
    model.name,
    200,
    requestProperties,
    true
  );

  const operationGet: Operation = {
    summary: `List ${model.name}`,
    description: `List and search ${model.name}`,
    tags: resolveTags(model, tags.list),
    'x-admin': {
      types: (() => {
        if (search && search.length > 0) {
          return ['list', 'search'];
        } else {
          return ['list'];
        }
      })(),
      groupName: model.name,
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
      [`/api/${resourcePlural}`]: {
        get: {
          summary: `List ${model.name}`,
          description: `List and search ${model.name}`,
          tags: resolveTags(model, tags.list),
          'x-admin': {
            types: (() => {
              if (search && search.length > 0) {
                return ['list', 'search'];
              } else {
                return ['list'];
              }
            })(),
            groupName: model.name,
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
          summary: `Create ${model.name}`,
          'x-admin': {
            types: ['create'],
            groupName: model.name,
            resourceName: 'Create'
          },
          description: `Create ${model.name}`,
          tags: resolveTags(model, tags.create),
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
          responses: responseResolvedConflict
        }
      },
      [`/api/${resourcePlural}/{id}`]: {
        get: {
          summary: `Get ${model.name} by ID`,
          'x-admin': {
            types: ['read'],
            groupName: model.name,
            resourceName: 'Read'
          },
          description: `Get ${model.name} by ID`,
          tags: resolveTags(model, tags.read),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${model.name} ID`,
              schema: {
                type: 'integer'
              },
              required: true
            }
          ],
          responses: responseResolved
        },
        put: {
          summary: `Update ${model.name}`,
          'x-admin': {
            types: ['update'],
            groupName: model.name,
            resourceName: 'Update'
          },
          description: `Update ${model.name}`,
          tags: resolveTags(model, tags.update),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${model.name} ID`,
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
          responses: responseResolved
        },
        delete: {
          summary: `Delete ${model.name}`,
          'x-admin': {
            types: ['delete'],
            groupName: model.name,
            resourceName: 'Delete'
          },
          description: `Delete ${model.name}`,
          tags: resolveTags(model, tags.delete),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${model.name} ID`,
              schema: {
                type: 'integer'
              },
              required: true
            }
          ],
          responses: responseResolved
        }
      }
    }
  };
}
