import { Responses, Response, Properties, Reference } from './openapiTypes';

const errorResponse = (description: string): Response => {
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
};

const resolveSchema = (
  target: Properties | Reference
): Properties | Reference => {
  if ((target as Reference).$ref) {
    return target as Reference;
  }

  return {
    type: 'object',
    properties: target
  } as Properties;
};

const makeResponses = (
  resourceName: string,
  defaultSuccessStatusCode: number,
  successProperties: Properties | Reference,
  conflict = false
): Responses => {
  const responses: Responses = {
    [defaultSuccessStatusCode]: {
      description: `Response for get ${resourceName}`,
      content: {
        'application/json': {
          schema: resolveSchema(successProperties)
        }
      }
    }
  };

  const errors: Record<string, string> = {
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '403': 'Forbidden',
    '404': 'Not Found',
    '500': 'Internal Server Error'
  };

  if (conflict) {
    errors['409'] = 'Conflict';
  }

  Object.keys(errors).forEach((statusCode) => {
    const description = errors[statusCode];
    responses[parseInt(statusCode)] = errorResponse(description);
  });

  return responses;
};

export { makeResponses };
