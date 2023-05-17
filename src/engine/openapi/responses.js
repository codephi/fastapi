function errorSchema(description) {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'integer' },
            detail: { type: 'string' }
          }
        }
      }
    }
  };
}

const resolveResponses = (
  resourceName,
  defaultSuccessStatusCode,
  successProperties,
  conflict = false
) => {
  const responses = {
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
    }
  };

  const errors = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error'
  };

  if (conflict) {
    errors[409] = 'Conflict';
  }

  Object.keys(errors).forEach((statusCode) => {
    const description = errors[statusCode];
    responses[statusCode] = errorSchema(description);
  });

  return responses;
};

module.exports.resolveResponses = resolveResponses;
