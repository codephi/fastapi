export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export const internalServerError = (): ErrorResponse => {
  return {
    type: 'https://example.com/probs/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred on the server.'
  };
};

export const notFound = (): ErrorResponse => {
  return {
    type: 'https://example.com/probs/not-found',
    title: 'Not Found',
    status: 404,
    detail: 'The requested resource could not be found.'
  };
};

export const badRequest = (message: string): ErrorResponse => {
  return {
    type: 'https://example.com/probs/bad-request',
    title: 'Bad Request',
    status: 400,
    detail: message
  };
};

export const unauthorized = (): ErrorResponse => {
  return {
    type: 'https://example.com/probs/unauthorized',
    title: 'Unauthorized',
    status: 401,
    detail: 'You are not authorized to access this resource.'
  };
};

export const forbidden = (): ErrorResponse => {
  return {
    type: 'https://example.com/probs/forbidden',
    title: 'Forbidden',
    status: 403,
    detail: 'Access to this resource is forbidden.'
  };
};

export const conflict = (): ErrorResponse => {
  return {
    type: 'https://example.com/probs/conflict',
    title: 'Conflict',
    status: 409,
    detail: 'There was a conflict while processing the request.'
  };
};
