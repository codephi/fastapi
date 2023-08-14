import { FastifyRequest, FastifyReply, FastifyListenOptions, FastifyInstance } from 'fastify';
import { Tags } from './resources/openapi';
import { HandlerMethods, Methods, PathBuilder, Route, Routes, RoutesBuilder, Handlers } from './resources/routes';
import { Resource, Resources, Schema, SequelizeModel } from './resources/sequelize';
import { EventCallback } from './resources/events';
import { Options, Sequelize } from 'sequelize';
import log from './resources/log';
export interface LoadSpecOptions {
    resources: Resources;
    tags?: Tags;
    routes?: Routes[];
    handlers?: HandlerMethods;
}
export interface DatabaseOptions extends Options {
    uri?: string;
}
export interface FastAPIOptions {
    routes?: Routes[];
    tags?: Tags;
    handlers?: Handlers;
    schema?: string | Schema;
    resources?: Resources;
    database?: DatabaseOptions;
    cors?: Cors;
    forceCreateTables?: boolean;
    listen?: FastifyListenOptions;
}
export interface Cors {
    origin: string;
}
export interface Models {
    [key: string]: typeof SequelizeModel;
}
export declare class FastAPI {
    listenConfig: FastifyListenOptions;
    routes: Routes[];
    tags: Tags;
    handlers: Handlers;
    private schema?;
    resources: Resources;
    models: Models;
    database: DatabaseOptions;
    cors: Cors;
    forceCreateTables: boolean;
    api: FastifyInstance;
    private databaseLoaded;
    private listen;
    sequelize?: Sequelize;
    constructor(props?: FastAPIOptions);
    private loadDatabaseInstance;
    setDatabaseInstance(sequelize: Sequelize): void;
    setSchema(schema: string | Schema): void;
    loadSchema(schema?: string | Schema): void;
    loadRoutes(): void;
    load(): void;
    setDatabase(database: Options): FastAPI;
    connect(): Promise<void>;
    private createTables;
    testDatabaseConnection(): Promise<void>;
    start(): Promise<void>;
    getResource(resourceName: string): Resource;
    addRoutes(routes: Routes | RoutesBuilder | PathBuilder): void;
    addHandlers(handlers: Handlers): void;
    path(path: string, options: Methods): FastAPI;
    get(path: string, options: Route): FastAPI;
    post(path: string, options: Route): FastAPI;
    put(path: string, options: Route): FastAPI;
    delete(path: string, options: Route): FastAPI;
    patch(path: string, options: Route): FastAPI;
    on(modelName: string, action: string, callback: EventCallback): FastAPI;
    emit(modelName: string, action: string, err: any, data: any): FastAPI;
    removeListener(modelName: string, action: string): FastAPI;
}
export { PathBuilder, RoutesBuilder } from './resources/routes';
export { makeResponses } from './resources/openapi/responses';
export { SchemaBuilder, AutoColumn, TableBuilder } from './resources/sequelize/builder';
export { ColumnType } from './resources/sequelize';
export { SequelizeModel as Model, Tags, log, HandlerMethods, Handlers };
export { FastifyReply as Reply, FastifyRequest as Request };
export { DataTypes } from 'sequelize';
export declare function modelName(text: string): string;
