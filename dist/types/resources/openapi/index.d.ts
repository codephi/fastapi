import { Resource } from '../sequelize';
import { OpenAPI } from './openapiTypes';
export interface Tags {
    create: string[];
    read: string[];
    update: string[];
    delete: string[];
    list: string[];
}
export declare function generateOpenapiSchemas(resource: Resource, tags: Tags): OpenAPI;
