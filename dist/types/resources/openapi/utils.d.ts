import { RouteHandler } from 'fastify';
import { InnerOperation } from '../routes';
import { OpenAPI, Operation, Path } from './openapiTypes';
export declare function extractByMethod(method: string, target: InnerOperation | Path): Operation | RouteHandler | undefined;
export declare function convertOpenAPItoSchemas(openAPI: OpenAPI): OpenAPI;
export declare function getReferenceSchemaName(path: string, method: string, statusCode: string | number): string;
export declare function convertToPlural(resourceName: string): string;
export declare function convertToSingle(resourceName: string): string;
