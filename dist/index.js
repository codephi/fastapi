"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelName = exports.log = exports.Model = exports.AutoColumn = exports.SchemaBuilder = exports.makeResponses = exports.RoutesBuilder = exports.PathBuilder = exports.FastAPI = void 0;
var serve_1 = require("./middle/serve");
var openapi_1 = require("./resources/openapi");
var routes_1 = require("./resources/routes");
var createTables_1 = require("./resources/sequelize/createTables");
var database_1 = require("./middle/database");
var sequelize_1 = require("./resources/sequelize");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return sequelize_1.SequelizeModel; } });
var health_1 = require("./routes/health");
var openapi_2 = require("./routes/openapi");
var events_1 = require("./resources/events");
var util_1 = require("util");
var log_1 = require("./resources/log");
exports.log = log_1.default;
var FastAPI = /** @class */ (function () {
    function FastAPI(props) {
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
                this.database = __assign(__assign({}, this.database), props.database);
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
    FastAPI.prototype.databaseInstance = function () {
        if (this.databaseLoaded)
            return;
        var _a = this.database, database = _a.database, password = _a.password, username = _a.username, options = __rest(_a, ["database", "password", "username"]);
        (0, database_1.databaseConnect)({
            database: database,
            password: password,
            username: username,
            options: options
        });
        this.databaseLoaded = true;
    };
    FastAPI.prototype.setDatabaseInstance = function (database) {
        (0, database_1.setGlobalSequelize)(database);
        this.databaseLoaded = true;
    };
    FastAPI.prototype.setSchema = function (schema) {
        this.schema = schema;
    };
    FastAPI.prototype.loadSchema = function (schema) {
        this.databaseInstance();
        if (schema === undefined) {
            schema = this.schema;
        }
        if (schema) {
            this.resources = (0, sequelize_1.importResources)(schema);
            for (var key in this.resources) {
                var resource = this.resources[key];
                this.models[modelName(resource.name)] = resource.model;
            }
        }
        else {
            throw new Error('Schema not found');
        }
    };
    FastAPI.prototype.loadRoutes = function () {
        var shemasPaths = {};
        var resources = this.resources;
        var tags = this.tags;
        var handlers = this.handlers;
        var createRoutes = new routes_1.CreateRoutes(this.api);
        for (var key in this.resources) {
            var resource = resources[key];
            var paths_1 = (0, openapi_1.generateOpenapiSchemas)(resource, tags).paths;
            createRoutes.createRouteResource({
                paths: paths_1,
                resource: resource,
                handlers: handlers
            });
            shemasPaths = __assign(__assign({}, shemasPaths), paths_1);
        }
        var paths = {};
        this.routes.forEach(function (route) {
            createRoutes.createRoutes(__assign({}, route));
            paths = __assign(__assign({}, paths), (0, routes_1.routesToPaths)(route));
        });
        var health = (0, health_1.default)();
        createRoutes.createRoutes(health);
        var healthPaths = (0, routes_1.routesToPaths)(health);
        var openapi = (0, openapi_2.default)(__assign(__assign(__assign({}, shemasPaths), healthPaths), paths));
        createRoutes.createRoutes(openapi);
        createRoutes.api.setErrorHandler(function (error, request, reply) {
            reply.send(error);
        });
    };
    FastAPI.prototype.load = function () {
        this.loadSchema();
        this.loadRoutes();
    };
    FastAPI.prototype.setDatabase = function (database) {
        this.database = __assign(__assign({}, this.database), database);
        return this;
    };
    FastAPI.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var database, createTablesConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        database = this.database;
                        if (!(this.database.sync !== undefined)) return [3 /*break*/, 3];
                        createTablesConfig = {};
                        if (database.sync.alter === true) {
                            createTablesConfig.alter = true;
                        }
                        else if (database.sync.force === true) {
                            createTablesConfig.force = true;
                        }
                        return [4 /*yield*/, (0, database_1.testDatabaseConnection)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, createTables_1.createTables)(createTablesConfig)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FastAPI.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.listen(this.listenConfig)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //Resources
    FastAPI.prototype.getResource = function (resourceName) {
        return this.resources[resourceName];
    };
    // Routes
    FastAPI.prototype.addRoutes = function (routes) {
        if (routes instanceof routes_1.RoutesBuilder || routes instanceof routes_1.PathBuilder) {
            routes = routes.build();
        }
        this.routes.push(routes);
        return this;
    };
    FastAPI.prototype.path = function (path, options) {
        var _a;
        this.addRoutes((_a = {},
            _a[path] = options,
            _a));
        return this;
    };
    FastAPI.prototype.get = function (path, options) {
        return this.path(path, {
            get: options
        });
    };
    FastAPI.prototype.post = function (path, options) {
        return this.path(path, {
            post: options
        });
    };
    FastAPI.prototype.put = function (path, options) {
        return this.path(path, {
            put: options
        });
    };
    FastAPI.prototype.delete = function (path, options) {
        return this.path(path, {
            delete: options
        });
    };
    FastAPI.prototype.patch = function (path, options) {
        return this.path(path, {
            patch: options
        });
    };
    // Events
    FastAPI.prototype.on = function (modelName, action, callback) {
        (0, events_1.on)(modelName, action, callback);
        return this;
    };
    FastAPI.prototype.emit = function (modelName, action, err, data) {
        (0, events_1.emit)(modelName, action, err, data);
        return this;
    };
    FastAPI.prototype.removeListener = function (modelName, action) {
        (0, events_1.remove)(modelName, action);
        return this;
    };
    return FastAPI;
}());
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
    var name = text.charAt(0).toUpperCase();
    // se terminar com s, remove a ultima letra
    if (text[text.length - 1] === 's') {
        return name + text.slice(1, -1);
    }
    return name + text.slice(1);
}
exports.modelName = modelName;
