"use strict";
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
exports.resolveResponses = exports.CreateRoutes = exports.RoutesBuilder = exports.PathBuilder = exports.routesToPaths = exports.MethodType = void 0;
var routes_1 = require("./routes");
var responses_1 = require("../openapi/responses");
var utils_1 = require("../openapi/utils");
var MethodType;
(function (MethodType) {
    MethodType["GET"] = "get";
    MethodType["POST"] = "post";
    MethodType["PUT"] = "put";
    MethodType["DELETE"] = "delete";
    MethodType["PATCH"] = "patch";
})(MethodType || (exports.MethodType = MethodType = {}));
function getOperations(value) {
    return {
        get: value.get,
        post: value.post,
        put: value.put,
        delete: value.delete,
        patch: value.patch
    };
}
function routesToPaths(routes) {
    var paths = {};
    Object.keys(routes).forEach(function (path) {
        paths[path] = {};
        var route = routes[path];
        if (route.get) {
            var _a = route.get, handler = _a.handler, get = __rest(_a, ["handler"]);
            paths[path].get = get;
        }
        if (route.post) {
            var _b = route.post, handler = _b.handler, post = __rest(_b, ["handler"]);
            paths[path].post = post;
        }
        if (route.put) {
            var _c = route.put, handler = _c.handler, put = __rest(_c, ["handler"]);
            paths[path].put = put;
        }
        if (route.delete) {
            var _d = route.delete, handler = _d.handler, del = __rest(_d, ["handler"]);
            paths[path].delete = del;
        }
        if (route.patch) {
            var _e = route.patch, handler = _e.handler, patch = __rest(_e, ["handler"]);
            paths[path].patch = patch;
        }
    });
    return paths;
}
exports.routesToPaths = routesToPaths;
var PathBuilder = /** @class */ (function () {
    function PathBuilder(parent, pathName) {
        this.methods = {};
        this.builded = false;
        this.pathName = pathName;
        this.parent = parent;
    }
    PathBuilder.prototype.get = function (route) {
        this.methods.get = route;
        return this;
    };
    PathBuilder.prototype.post = function (route) {
        this.methods.post = route;
        return this;
    };
    PathBuilder.prototype.put = function (route) {
        this.methods.put = route;
        return this;
    };
    PathBuilder.prototype.delete = function (route) {
        this.methods.delete = route;
        return this;
    };
    PathBuilder.prototype.patch = function (route) {
        this.methods.patch = route;
        return this;
    };
    PathBuilder.prototype.buildPath = function () {
        if (this.builded) {
            return;
        }
        this.builded = true;
        if (this.methods.get) {
            this.parent.addRoute(this.pathName, MethodType.GET, this.methods.get);
        }
        if (this.methods.post) {
            this.parent.addRoute(this.pathName, MethodType.POST, this.methods.post);
        }
        if (this.methods.put) {
            this.parent.addRoute(this.pathName, MethodType.PUT, this.methods.put);
        }
        if (this.methods.delete) {
            this.parent.addRoute(this.pathName, MethodType.DELETE, this.methods.delete);
        }
        if (this.methods.patch) {
            this.parent.addRoute(this.pathName, MethodType.PATCH, this.methods.patch);
        }
    };
    PathBuilder.prototype.path = function (path) {
        this.buildPath();
        return new PathBuilder(this.parent, path);
    };
    PathBuilder.prototype.responses = function (defaultSuccessStatusCode, successProperties, conflict) {
        if (conflict === void 0) { conflict = false; }
        return this.parent.responses(defaultSuccessStatusCode, successProperties, conflict);
    };
    PathBuilder.prototype.build = function () {
        this.buildPath();
        return this.parent.build();
    };
    return PathBuilder;
}());
exports.PathBuilder = PathBuilder;
var RoutesBuilder = /** @class */ (function () {
    function RoutesBuilder(resourceName) {
        this.routes = {};
        this.resourceName = resourceName !== null && resourceName !== void 0 ? resourceName : 'default';
    }
    RoutesBuilder.prototype.addRoute = function (path, method, route) {
        if (!this.routes[path]) {
            this.routes[path] = {};
        }
        this.routes[path][method] = route;
    };
    RoutesBuilder.prototype.path = function (path) {
        var pathBuilder = new PathBuilder(this, path);
        return pathBuilder;
    };
    RoutesBuilder.prototype.responses = function (defaultSuccessStatusCode, successProperties, conflict) {
        if (conflict === void 0) { conflict = false; }
        return (0, responses_1.makeResponses)(this.resourceName, defaultSuccessStatusCode, successProperties, conflict);
    };
    RoutesBuilder.prototype.build = function () {
        return this.routes;
    };
    return RoutesBuilder;
}());
exports.RoutesBuilder = RoutesBuilder;
function isHandler(handlers) {
    if (handlers === undefined) {
        return false;
    }
    if (handlers.get ||
        handlers.post ||
        handlers.put ||
        handlers.delete ||
        handlers.patch) {
        return true;
    }
    return false;
}
var CreateRoutes = /** @class */ (function () {
    function CreateRoutes(api) {
        this.api = api;
    }
    CreateRoutes.prototype.createRoutes = function (routes) {
        var _this = this;
        Object.entries(routes).forEach(function (_a) {
            var path = _a[0], methods = _a[1];
            Object.entries(methods).forEach(function (_a) {
                var method = _a[0], route = _a[1];
                var handler = route.handler, operation = __rest(route, ["handler"]);
                _this.createRouteInner({ path: path, method: method, operation: operation, handler: handler });
            });
        });
    };
    CreateRoutes.prototype.createRouteResource = function (_a) {
        var _this = this;
        var paths = _a.paths, resource = _a.resource, handlers = _a.handlers;
        Object.entries(paths).forEach(function (_a) {
            var path = _a[0], value = _a[1];
            var innerOperation = getOperations(value);
            Object.keys(innerOperation).forEach(function (method) {
                var operation = (0, utils_1.extractByMethod)(method, innerOperation);
                if (!operation) {
                    return;
                }
                var handler = isHandler(handlers)
                    ? (0, utils_1.extractByMethod)(method, handlers)
                    : getRouteHandler(method, resource, operation);
                if (handler === undefined) {
                    return;
                }
                _this.createRouteInner({ path: path, method: method, operation: operation, handler: handler });
            });
        });
    };
    CreateRoutes.prototype.createRouteInner = function (_a) {
        var _b;
        var path = _a.path, method = _a.method, operation = _a.operation, handler = _a.handler;
        var route = {
            method: method.toUpperCase(),
            url: resolvePath(path),
            schema: {
                response: resolveResponses(operation.responses)
            },
            handler: handler
        };
        if (route.schema !== undefined && operation.requestBody !== undefined) {
            var responseBody = operation.requestBody;
            var schema = responseBody.content['application/json'].schema;
            route.schema.body = responseToProperties(filterPropertiesRecursive(schema));
        }
        if (route.schema !== undefined &&
            operation.requestBody !== undefined &&
            operation.parameters !== undefined) {
            var query = (_b = operation.parameters) === null || _b === void 0 ? void 0 : _b.filter(function (p) {
                try {
                    var parameter = p;
                    return parameter.in === 'query';
                }
                catch (_) {
                    return false;
                }
            });
            if (query.length > 0) {
                var querySchema = {
                    type: 'object',
                    properties: queryToProperties(query)
                };
                route.schema.querystring = querySchema;
            }
        }
        this.api.route(route);
    };
    return CreateRoutes;
}());
exports.CreateRoutes = CreateRoutes;
function queryToProperties(properties) {
    var newProperties = {};
    properties.forEach(function (_a) {
        var name = _a.name, value = __rest(_a, ["name"]);
        newProperties[name] = value.schema;
    });
    return newProperties;
}
function responseToProperties(properties) {
    var newProperties = {};
    Object.entries(properties).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        newProperties[key] = propertiesToItems(value);
    });
    return newProperties;
}
function propertiesToItems(value) {
    if (value.type !== 'object' && value.properties !== undefined) {
        value.items = value.properties;
        delete value.properties;
    }
    return value;
}
function filterPropertiesRecursive(properties) {
    var newProperties = {};
    Object.entries(properties).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (key.startsWith('x-'))
            return;
        // value is Schema
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value)) {
                newProperties[key] = filterPropertiesRecursive(value);
                return;
            }
        }
        newProperties[key] = value;
    });
    return newProperties;
}
function resolveResponses(responses) {
    if (!responses)
        return {};
    var newResponses = {};
    Object.keys(responses).forEach(function (statusCode) {
        var response = responses[parseInt(statusCode)];
        if (!response.content)
            return;
        var content = response.content['application/json'];
        if (!content)
            return;
        var schema = content.schema;
        var properties = schema.properties;
        newResponses[statusCode] = {
            description: response.description,
            type: 'object',
            properties: properties ? responseToProperties(properties) : undefined
        };
    });
    return newResponses;
}
exports.resolveResponses = resolveResponses;
function getRouteHandler(method, resource, operation) {
    if (method === 'get') {
        if (operation['x-admin'].types.includes('list')) {
            return (0, routes_1.getAll)(resource);
        }
        else {
            return (0, routes_1.getOne)(resource);
        }
    }
    else if (method === 'post') {
        return (0, routes_1.create)(resource);
    }
    else if (method === 'put') {
        return (0, routes_1.update)(resource);
    }
    else if (method === 'delete') {
        return (0, routes_1.remove)(resource);
    }
}
function resolvePath(path) {
    var newPath = path.replace(/{/g, ':').replace(/}/g, '');
    return newPath;
}
