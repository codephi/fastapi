"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelName = exports.log = exports.Model = exports.AutoColumn = exports.SchemaBuilder = exports.makeResponses = exports.RoutesBuilder = exports.PathBuilder = exports.FastAPI = void 0;
const serve_1 = require("./middle/serve");
const openapi_1 = require("./resources/openapi");
const routes_1 = require("./resources/routes");
const createTables_1 = require("./resources/sequelize/createTables");
const database_1 = require("./middle/database");
const sequelize_1 = require("./resources/sequelize");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return sequelize_1.SequelizeModel; } });
const health_1 = require("./routes/health");
const openapi_2 = require("./routes/openapi");
const events_1 = require("./resources/events");
const util_1 = require("util");
const log_1 = require("./resources/log");
exports.log = log_1.default;
class FastAPI {
    constructor(props) {
        this.listenConfig = {
            port: 3000,
            host: '0.0.0.0'
        };
        this.routes = [];
        this.tags = {
            create: ['create'],
            read: ['read'],
            update: ['update'],
            delete: ['delete'],
            list: ['list']
        };
        this.handlers = {};
        this.resources = {};
        this.models = {};
        this.database = {
            database: process.env.DB_NAME || process.env.DATABASE_NAME || null,
            username: process.env.DB_USER || process.env.DATABASE_USER || null,
            password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || null,
            host: 'localhost',
            port: 5432,
            dialect: 'postgres',
            logging: undefined,
            sync: {
                force: false
            },
            testConnection: true
        };
        this.cors = {
            origin: '*'
        };
        this.forceCreateTables = false;
        this.databaseLoaded = false;
        if (props) {
            if (props.schema !== undefined) {
                this.schema = props.schema;
            }
            if (props.routes !== undefined) {
                this.routes = props.routes;
            }
            if (props.handlers !== undefined) {
                this.handlers = props.handlers;
            }
            if (props.tags !== undefined) {
                this.tags = props.tags;
            }
            if (props.database !== undefined) {
                this.database = { ...this.database, ...props.database };
            }
            if (props.cors !== undefined) {
                this.cors = props.cors;
            }
            if (props.forceCreateTables) {
                this.forceCreateTables = props.forceCreateTables;
            }
            if (props.listen !== undefined) {
                this.listenConfig = props.listen;
            }
        }
        this.api = (0, serve_1.default)();
        this.listen = (0, util_1.promisify)(this.api.listen.bind(this.api));
        return this;
    }
    databaseInstance() {
        if (this.databaseLoaded)
            return;
        const { database, password, username, ...options } = this.database;
        (0, database_1.databaseConnect)({
            database,
            password,
            username,
            options
        });
        this.databaseLoaded = true;
    }
    setDatabaseInstance(database) {
        (0, database_1.setGlobalSequelize)(database);
        this.databaseLoaded = true;
    }
    setSchema(schema) {
        this.schema = schema;
    }
    loadSchema(schema) {
        this.databaseInstance();
        if (schema === undefined) {
            schema = this.schema;
        }
        if (schema) {
            this.resources = (0, sequelize_1.importResources)(schema);
            for (const key in this.resources) {
                const resource = this.resources[key];
                this.models[modelName(resource.name)] = resource.model;
            }
        }
        else {
            throw new Error('Schema not found');
        }
    }
    loadRoutes() {
        let shemasPaths = {};
        const resources = this.resources;
        const tags = this.tags;
        const handlers = this.handlers;
        const createRoutes = new routes_1.CreateRoutes(this.api);
        for (const key in this.resources) {
            const resource = resources[key];
            const paths = (0, openapi_1.generateOpenapiSchemas)(resource, tags).paths;
            createRoutes.createRouteResource({
                paths,
                resource,
                handlers
            });
            shemasPaths = { ...shemasPaths, ...paths };
        }
        let paths = {};
        this.routes.forEach((route) => {
            createRoutes.createRoutes({ ...route });
            paths = { ...paths, ...(0, routes_1.routesToPaths)(route) };
        });
        const health = (0, health_1.default)();
        createRoutes.createRoutes(health);
        const healthPaths = (0, routes_1.routesToPaths)(health);
        const openapi = (0, openapi_2.default)({
            ...shemasPaths,
            ...healthPaths,
            ...paths
        });
        createRoutes.createRoutes(openapi);
        createRoutes.api.setErrorHandler(function (error, request, reply) {
            reply.send(error);
        });
    }
    load() {
        this.loadSchema();
        this.loadRoutes();
    }
    setDatabase(database) {
        this.database = { ...this.database, ...database };
        return this;
    }
    async connect() {
        const { database } = this;
        if (this.database.sync !== undefined) {
            const createTablesConfig = {};
            if (database.sync.alter === true) {
                createTablesConfig.alter = true;
            }
            else if (database.sync.force === true) {
                createTablesConfig.force = true;
            }
            await (0, database_1.testDatabaseConnection)();
            await (0, createTables_1.createTables)(createTablesConfig);
        }
    }
    async start() {
        await this.connect();
        await this.listen(this.listenConfig);
    }
    //Resources
    getResource(resourceName) {
        return this.resources[resourceName];
    }
    // Routes
    addRoutes(routes) {
        if (routes instanceof routes_1.RoutesBuilder || routes instanceof routes_1.PathBuilder) {
            routes = routes.build();
        }
        this.routes.push(routes);
        return this;
    }
    path(path, options) {
        this.addRoutes({
            [path]: options
        });
        return this;
    }
    get(path, options) {
        return this.path(path, {
            get: options
        });
    }
    post(path, options) {
        return this.path(path, {
            post: options
        });
    }
    put(path, options) {
        return this.path(path, {
            put: options
        });
    }
    delete(path, options) {
        return this.path(path, {
            delete: options
        });
    }
    patch(path, options) {
        return this.path(path, {
            patch: options
        });
    }
    // Events
    on(modelName, action, callback) {
        (0, events_1.on)(modelName, action, callback);
        return this;
    }
    emit(modelName, action, err, data) {
        (0, events_1.emit)(modelName, action, err, data);
        return this;
    }
    removeListener(modelName, action) {
        (0, events_1.remove)(modelName, action);
        return this;
    }
}
exports.FastAPI = FastAPI;
var routes_2 = require("./resources/routes");
Object.defineProperty(exports, "PathBuilder", { enumerable: true, get: function () { return routes_2.PathBuilder; } });
Object.defineProperty(exports, "RoutesBuilder", { enumerable: true, get: function () { return routes_2.RoutesBuilder; } });
var responses_1 = require("./resources/openapi/responses");
Object.defineProperty(exports, "makeResponses", { enumerable: true, get: function () { return responses_1.makeResponses; } });
var builder_1 = require("./resources/sequelize/builder");
Object.defineProperty(exports, "SchemaBuilder", { enumerable: true, get: function () { return builder_1.SchemaBuilder; } });
Object.defineProperty(exports, "AutoColumn", { enumerable: true, get: function () { return builder_1.AutoColumn; } });
function modelName(text) {
    const name = text.charAt(0).toUpperCase();
    // se terminar com s, remove a ultima letra
    if (text[text.length - 1] === 's') {
        return name + text.slice(1, -1);
    }
    return name + text.slice(1);
}
exports.modelName = modelName;
//# sourceMappingURL=index.js.map