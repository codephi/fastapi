import { FastifyReply } from 'fastify';
import { createFullDoc } from '../resources/openapi/doc';
import { Paths } from '../resources/openapi/openapiTypes';
import { HandlerProps } from '../resources/routes';

export default function generateOpenAPIJSON(paths: Paths): HandlerProps {
  const doc = createFullDoc(paths);

  return {
    paths: {
      '/documentation/json': {
        get: {
          tags: ['Documentation'],
          summary: 'Get OpenAPI JSON',
          description: 'Get OpenAPI JSON',
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object'
                  }
                }
              }
            }
          }
        }
      }
    },
    handler: async (_request, reply: FastifyReply): Promise<void> => {
      reply.send(doc);
    }
  };
}
