const { convertType } = require('./dataTypes');
const { resolveResponses } = require('./responses');

const resolveTags = (model, tags = []) => {
  const resourceName = model.name.toLowerCase();

  return tags.map((tag) => {
    if (tag.indexOf('$name') > -1) {
      return tag.replace('$name', resourceName);
    }

    return tag;
  });
};

const generateSchemas = ({ model }, tags) => {
  const resourceName = model.name.toLowerCase();
  const resourcePlural = resourceName.endsWith('s')
    ? resourceName
    : `${resourceName}s`;
  const attributeKeys = Object.keys(model.rawAttributes);
  const properties = {};

  attributeKeys.forEach((key) => {
    const attribute = model.rawAttributes[key];
    const propertyType = convertType(attribute.type.toString());

    const property = {
      ...propertyType,
      description: `${model.name} ${key}`,
    };

    if (property.type === 'string') {
      property.maxLength = 255;
    }

    if (attribute.type.constructor.name === 'ENUM') {
      property.type = 'string';
      property.enum = attribute.type.values;
    }

    properties[key] = property;
  });

  const getAllResponseProperties = () => {
    return {
      data: {
        type: 'array',
        properties: {
          type: 'object',
          properties: { ...properties },
        },
      },
      meta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          totalPages: { type: 'integer' },
          totalItems: { type: 'integer' },
        },
      },
    };
  };

  const getRequestProperties = () => {
    return { ...properties };
  };

  const getPostRequestProperties = () => {
    const postProperties = { ...properties };
    delete postProperties.createdAt;
    delete postProperties.updatedAt;
    return postProperties;
  };

  const getPutRequestProperties = () => {
    const putProperties = { ...properties };
    delete putProperties.createdAt;
    delete putProperties.updatedAt;
    return putProperties;
  };

  const getOrderByEnumValues = () => {
    const sortFields = Object.keys(properties);
    return sortFields.map((field) =>
      field.startsWith('-') ? field.substr(1) : field
    );
  };

  return {
    paths: {
      [`/api/${resourcePlural}`]: {
        get: {
          summary: `List ${model.name}`,
          description: `List and search ${model.name}`,
          tags: resolveTags(model, tags.list),
          'x-admin': {
            types: ['list', 'search'],
            groupName: model.name,
            resourceName: 'List',
            references: {
              list: {
                query: {
                  pageSize: 'page_size',
                  page: 'page',
                  orderBy: 'order_by',
                  order: 'order',
                  searchTerm: 'search',
                },
              },
              search: {
                query: {
                  searchTerm: 'search',
                  pageSize: 'page_size',
                  orderBy: 'order_by',
                  order: 'order',
                  searchTerm: 'search',
                  page: 'page',
                },
              },
            },
          },
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: {
                type: 'integer',
                minimum: 1,
              },
            },
            {
              name: 'page_size',
              in: 'query',
              description: 'Number of items per page',
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
              },
            },
            {
              name: 'search',
              in: 'query',
              description: 'Search query string',
              schema: {
                type: 'string',
              },
            },
            {
              name: 'order_by',
              in: 'query',
              description: 'Order field',
              schema: {
                type: 'string',
                enum: getOrderByEnumValues(),
              },
              'x-parameter-name': 'orderBy',
            },
            {
              name: 'order',
              in: 'query',
              description: 'Order direction',
              schema: {
                type: 'string',
                enum: ['desc', 'asc'],
              },
            },
          ],
          responses: resolveResponses(
            model.name,
            200,
            getAllResponseProperties()
          ),
        },
        post: {
          summary: `Create ${model.name}`,
          'x-admin': {
            types: ['create'],
            groupName: model.name,
            resourceName: 'Create',
          },
          description: `Create ${model.name}`,
          tags: resolveTags(model, tags.create),
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: getPostRequestProperties(),
                },
              },
            },
          },
          responses: resolveResponses(
            model.name,
            201,
            getRequestProperties(),
            true
          ),
        },
      },
      [`/api/${resourcePlural}/{id}`]: {
        get: {
          summary: `Get ${model.name} by ID`,
          'x-admin': {
            types: ['read'],
            groupName: model.name,
            resourceName: 'Read',
          },
          description: `Get ${model.name} by ID`,
          tags: resolveTags(model, tags.get),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${model.name} ID`,
              schema: {
                type: 'integer',
              },
              required: true,
            },
          ],
          responses: resolveResponses(model.name, 200, getRequestProperties()),
        },
        put: {
          summary: `Update ${model.name}`,
          'x-admin': {
            types: ['update'],
            groupName: model.name,
            resourceName: 'Update',
          },
          description: `Update ${model.name}`,
          tags: resolveTags(model, tags.update),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${model.name} ID`,
              schema: {
                type: 'integer',
              },
              required: true,
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: getPutRequestProperties(),
                },
              },
            },
          },
          responses: resolveResponses(model.name, 200, getRequestProperties()),
        },
        delete: {
          summary: `Delete ${model.name}`,
          'x-admin': {
            types: ['delete'],
            groupName: model.name,
            resourceName: 'Delete',
          },
          description: `Delete ${model.name}`,
          tags: resolveTags(model, tags.delete),
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: `${model.name} ID`,
              schema: {
                type: 'integer',
              },
              required: true,
            },
          ],
          responses: resolveResponses(model.name, 200, getRequestProperties()),
        },
      },
    },
  };
};

module.exports.generateSchemas = generateSchemas;
