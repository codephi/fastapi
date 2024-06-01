import { Responses, Properties, Reference } from './openapiTypes';
declare const makeResponses: (resourceName: string, defaultSuccessStatusCode: number, successProperties: Properties | Reference, conflict?: boolean) => Responses;
export { makeResponses };
