import { FastifyRequest, FastifyReply, FastifyListenOptions, FastifyInstance } from 'fastify';
import { Tags } from './resources/openapi';
import { Handlers, Methods, PathBuilder, Route, Routes, RoutesBuilder } from './resources/routes';
import { Resource, Resources, Schema, SequelizeModel } from './resources/sequelize';
import { EventCallback } from './resources/events';
import { Sequelize, SyncOptions } from 'sequelize';
import log from './resources/log';
export interface LoadSpecOptions {
    resources: Resources;
    tags?: Tags;
    routes?: Routes[];
    handlers?: Handlers;
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
export interface DatabaseOptions {
    database?: string | null;
    username?: string | null;
    password?: string | null;
    sync?: SyncOptions;
    testConnection?: boolean;
    host?: string;
    port?: number;
    dialect?: string;
    logging?: (sql: string) => void;
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
    constructor(props?: FastAPIOptions);
    private databaseInstance;
    setDatabaseInstance(database: Sequelize): void;
    setSchema(schema: string | Schema): void;
    loadSchema(schema?: string | Schema): void;
    loadRoutes(): void;
    load(): void;
    setDatabase(database: DatabaseOptions): FastAPI;
    connect(): Promise<void>;
    start(): Promise<void>;
    getResource(resourceName: string): Resource;
    addRoutes(routes: Routes | RoutesBuilder | PathBuilder): FastAPI;
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
export { SchemaBuilder, AutoColumn } from './resources/sequelize/builder';
export { SequelizeModel as Model, Tags, log };
export { FastifyReply as Reply, FastifyRequest as Request };
export declare function modelName(text: string): string;
