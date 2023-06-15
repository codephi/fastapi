import { Resource } from '../sequelize';
export type RouteHandler = (request: any, reply: any) => Promise<void> | void;
export declare function getAll(resource: Resource): RouteHandler;
export declare function getOne(resource: Resource): RouteHandler;
export declare function create(resource: Resource): RouteHandler;
export declare function update(resource: Resource): RouteHandler;
export declare function remove(resource: Resource): RouteHandler;
