function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = _object_without_properties_loose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
import api from "./middle/serve";
import { FastifyRequest, FastifyReply } from "fastify";
import { Tags, generateOpenapiSchemas } from "./resources/openapi";
import { PathBuilder, RoutesBuilder, CreateRoutes, routesToPaths } from "./resources/routes";
import { createTables } from "./resources/sequelize/createTables";
import { databaseConnect, testDatabaseConnection, setGlobalSequelize } from "./middle/database";
import { SequelizeModel, importResources } from "./resources/sequelize";
import healthRoute from "./routes/health";
import builderOpeapi from "./routes/openapi";
import { on, emit, remove } from "./resources/events";
import { promisify } from "util";
import log from "./resources/log";
export var FastAPI = /*#__PURE__*/ function() {
    "use strict";
    function FastAPI(props) {
        _class_call_check(this, FastAPI);
        _define_property(this, "listenConfig", {
            port: 3000,
            host: "0.0.0.0"
        });
        _define_property(this, "routes", []);
        _define_property(this, "tags", {
            create: [
                "create"
            ],
            read: [
                "read"
            ],
            update: [
                "update"
            ],
            delete: [
                "delete"
            ],
            list: [
                "list"
            ]
        });
        _define_property(this, "handlers", {});
        _define_property(this, "schema", void 0);
        _define_property(this, "resources", {});
        _define_property(this, "models", {});
        _define_property(this, "database", {
            database: process.env.DB_NAME || process.env.DATABASE_NAME || null,
            username: process.env.DB_USER || process.env.DATABASE_USER || null,
            password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || null,
            host: "localhost",
            port: 5432,
            dialect: "postgres",
            logging: undefined,
            sync: {
                force: false
            },
            testConnection: true
        });
        _define_property(this, "cors", {
            origin: "*"
        });
        _define_property(this, "forceCreateTables", false);
        _define_property(this, "api", void 0);
        _define_property(this, "databaseLoaded", false);
        _define_property(this, "listen", void 0);
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
                this.database = _object_spread({}, this.database, props.database);
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
        this.api = api();
        this.listen = promisify(this.api.listen.bind(this.api));
        return this;
    }
    _create_class(FastAPI, [
        {
            key: "databaseInstance",
            value: function databaseInstance() {
                if (this.databaseLoaded) return;
                var _this_database = this.database, database = _this_database.database, password = _this_database.password, username = _this_database.username, options = _object_without_properties(_this_database, [
                    "database",
                    "password",
                    "username"
                ]);
                databaseConnect({
                    database: database,
                    password: password,
                    username: username,
                    options: options
                });
                this.databaseLoaded = true;
            }
        },
        {
            key: "setDatabaseInstance",
            value: function setDatabaseInstance(database) {
                setGlobalSequelize(database);
                this.databaseLoaded = true;
            }
        },
        {
            key: "setSchema",
            value: function setSchema(schema) {
                this.schema = schema;
            }
        },
        {
            key: "loadSchema",
            value: function loadSchema(schema) {
                this.databaseInstance();
                if (schema === undefined) {
                    schema = this.schema;
                }
                if (schema) {
                    this.resources = importResources(schema);
                    for(var key in this.resources){
                        var resource = this.resources[key];
                        this.models[modelName(resource.name)] = resource.model;
                    }
                } else {
                    throw new Error("Schema not found");
                }
            }
        },
        {
            key: "loadRoutes",
            value: function loadRoutes() {
                var shemasPaths = {};
                var resources = this.resources;
                var tags = this.tags;
                var handlers = this.handlers;
                var createRoutes = new CreateRoutes(this.api);
                for(var key in this.resources){
                    var resource = resources[key];
                    var paths = generateOpenapiSchemas(resource, tags).paths;
                    createRoutes.createRouteResource({
                        paths: paths,
                        resource: resource,
                        handlers: handlers
                    });
                    shemasPaths = _object_spread({}, shemasPaths, paths);
                }
                var paths1 = {};
                this.routes.forEach(function(route) {
                    createRoutes.createRoutes(_object_spread({}, route));
                    paths1 = _object_spread({}, paths1, routesToPaths(route));
                });
                var health = healthRoute();
                createRoutes.createRoutes(health);
                var healthPaths = routesToPaths(health);
                var openapi = builderOpeapi(_object_spread({}, shemasPaths, healthPaths, paths1));
                createRoutes.createRoutes(openapi);
                createRoutes.api.setErrorHandler(function(error, request, reply) {
                    reply.send(error);
                });
            }
        },
        {
            key: "load",
            value: function load() {
                this.loadSchema();
                this.loadRoutes();
            }
        },
        {
            key: "setDatabase",
            value: function setDatabase(database) {
                this.database = _object_spread({}, this.database, database);
                return this;
            }
        },
        {
            key: "connect",
            value: function connect() {
                var _this = this;
                return _async_to_generator(function() {
                    var database, createTablesConfig;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                database = _this.database;
                                if (!(_this.database.sync !== undefined)) return [
                                    3,
                                    3
                                ];
                                createTablesConfig = {};
                                if (database.sync.alter === true) {
                                    createTablesConfig.alter = true;
                                } else if (database.sync.force === true) {
                                    createTablesConfig.force = true;
                                }
                                return [
                                    4,
                                    testDatabaseConnection()
                                ];
                            case 1:
                                _state.sent();
                                return [
                                    4,
                                    createTables(createTablesConfig)
                                ];
                            case 2:
                                _state.sent();
                                _state.label = 3;
                            case 3:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "start",
            value: function start() {
                var _this = this;
                return _async_to_generator(function() {
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                return [
                                    4,
                                    _this.connect()
                                ];
                            case 1:
                                _state.sent();
                                return [
                                    4,
                                    _this.listen(_this.listenConfig)
                                ];
                            case 2:
                                _state.sent();
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            //Resources
            key: "getResource",
            value: function getResource(resourceName) {
                return this.resources[resourceName];
            }
        },
        {
            // Routes
            key: "addRoutes",
            value: function addRoutes(routes) {
                if (_instanceof(routes, RoutesBuilder) || _instanceof(routes, PathBuilder)) {
                    routes = routes.build();
                }
                this.routes.push(routes);
                return this;
            }
        },
        {
            key: "path",
            value: function path(path, options) {
                this.addRoutes(_define_property({}, path, options));
                return this;
            }
        },
        {
            key: "get",
            value: function get(path, options) {
                return this.path(path, {
                    get: options
                });
            }
        },
        {
            key: "post",
            value: function post(path, options) {
                return this.path(path, {
                    post: options
                });
            }
        },
        {
            key: "put",
            value: function put(path, options) {
                return this.path(path, {
                    put: options
                });
            }
        },
        {
            key: "delete",
            value: function _delete(path, options) {
                return this.path(path, {
                    delete: options
                });
            }
        },
        {
            key: "patch",
            value: function patch(path, options) {
                return this.path(path, {
                    patch: options
                });
            }
        },
        {
            // Events
            key: "on",
            value: function on1(modelName, action, callback) {
                on(modelName, action, callback);
                return this;
            }
        },
        {
            key: "emit",
            value: function emit1(modelName, action, err, data) {
                emit(modelName, action, err, data);
                return this;
            }
        },
        {
            key: "removeListener",
            value: function removeListener(modelName, action) {
                remove(modelName, action);
                return this;
            }
        }
    ]);
    return FastAPI;
}();
export { PathBuilder, RoutesBuilder } from "./resources/routes";
export { makeResponses } from "./resources/openapi/responses";
export { SchemaBuilder, AutoColumn } from "./resources/sequelize/builder";
export { SequelizeModel as Model, Tags, log };
export { FastifyReply as Reply, FastifyRequest as Request };
export function modelName(text) {
    var name = text.charAt(0).toUpperCase();
    // se terminar com s, remove a ultima letra
    if (text[text.length - 1] === "s") {
        return name + text.slice(1, -1);
    }
    return name + text.slice(1);
}
