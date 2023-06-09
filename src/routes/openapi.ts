import { FastifyReply } from 'fastify';
import { createFullDoc } from '../resources/openapi/doc';
import { Paths } from '../resources/openapi/openapiTypes';
import { Routes, RoutesBuilder } from '../resources/routes';

export default function generateOpenAPIJSON(paths: Paths): Routes {
  const doc = createFullDoc(paths);

  const route = new RoutesBuilder('doc');
  route.path('/documentation/json').get({
    tags: ['Documentation'],
    summary: 'Get OpenAPI JSON',
    description: 'Get OpenAPI JSON',
    responses: route.responses(200, {
      schema: {
        type: 'object'
      }
    }),
    handler: async (_request, reply: FastifyReply): Promise<void> => {
      reply.send(doc);
    }
  });

  return route.build();
}
