import { Paths } from '../resources/openapi/openapiTypes';
import { Routes } from '../resources/routes';
import { JSONSchema7 } from 'json-schema';
export default function builderOpeapi(paths: Paths): Routes;
export declare function objectToJSONSchema7(json: any): JSONSchema7;
