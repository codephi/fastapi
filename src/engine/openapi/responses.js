const statusCodeErrors = require('./statusCodeErrors')

const responseWrapper = (
  resourceName,
  defaultSuccessStatusCode,
  successProperties,
  conflict = false
) => {
  const conflictResponse = conflict
    ? {
        409: {
          description: 'Conflict',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: statusCodeErrors.conflict()
              }
            }
          }
        }
      }
    : {}

  return {
    [defaultSuccessStatusCode]: {
      description: `Response for get ${resourceName}`,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: successProperties
          }
        }
      }
    },
    400: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: statusCodeErrors.badRequest()
          }
        }
      }
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: statusCodeErrors.unauthorized()
          }
        }
      }
    },
    403: {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: statusCodeErrors.forbidden()
          }
        }
      }
    },
    404: {
      description: 'Not Found',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: statusCodeErrors.notFound()
          }
        }
      }
    },
    ...conflictResponse,
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: statusCodeErrors.internalServerError()
          }
        }
      }
    }
  }
}

module.exports.responseWrapper = responseWrapper
