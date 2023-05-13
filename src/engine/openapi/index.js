const { convertType } = require('./dataTypes')
const { resolveResponses } = require('./responses')

const generateSchemas = (Model, tags) => {
  const resourceName = Model.name.toLowerCase()
  const resourcePlural = resourceName.endsWith('s')
    ? resourceName
    : `${resourceName}s`
  const attributeKeys = Object.keys(Model.rawAttributes)
  const properties = {}

  attributeKeys.forEach((key) => {
    const attribute = Model.rawAttributes[key]
    const propertyType = convertType(attribute.type.toString())

    const property = {
      ...propertyType,
      description: `${Model.name} ${key}`
    }

    if (property.type === 'string') {
      property.maxLength = 255
    }

    if (attribute.type.constructor.name === 'ENUM') {
      property.type = 'string'
      property.enum = attribute.type.values
    }

    properties[key] = property
  })

  const getAllResponseProperties = () => {
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
    }
  }

  const getRequestProperties = () => {
    return { ...properties }
  }

  const getPostRequestProperties = () => {
    const postProperties = { ...properties }
    delete postProperties.createdAt
    delete postProperties.updatedAt
    return postProperties
  }

  const getPutRequestProperties = () => {
    const putProperties = { ...properties }
    delete putProperties.createdAt
    delete putProperties.updatedAt
    return putProperties
  }

  const getOrderByEnumValues = () => {
    const sortFields = Object.keys(properties)
    return sortFields.map((field) =>
      field.startsWith('-') ? field.substr(1) : field
    )
  }

  return {
    paths: {
      [`/api/${resourcePlural}`]: {
        get: {
          summary: `Get ${Model.name}`,
          tags: tags.list || [],
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
              },
              'x-parameter-name': 'pageSize'
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
              },
              'x-parameter-name': 'orderBy'
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
          responses: resolveResponses(
            Model.name,
            200,
            getAllResponseProperties()
          )
        },
        post: {
          summary: `Create ${Model.name}`,
          tags: tags.create || [],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: getPostRequestProperties()
                }
              }
            }
          },
          responses: resolveResponses(
            Model.name,
            201,
            getRequestProperties(),
            true
          )
        }
      },
      [`/api/${resourcePlural}/{id}`]: {
        get: {
          summary: `Get ${Model.name} by ID`,
          responses: resolveResponses(Model.name, 200, getRequestProperties())
        },
        put: {
          summary: `Update ${Model.name}`,
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: getPutRequestProperties()
                }
              }
            }
          },
          responses: resolveResponses(Model.name, 200, getRequestProperties()),
          delete: {
            summary: `Delete ${Model.name}`,
            responses: resolveResponses(
              Model.name,
              200,
              getRequestProperties()
            )
          }
        }
      }
    }
  }
}

module.exports.generateSchemas = generateSchemas
