"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveResponses = exports.CreateRoutes = exports.RoutesBuilder = exports.PathBuilder = exports.routesToPaths = exports.MethodType = void 0;
const routes_1 = require("./routes");
const responses_1 = require("../openapi/responses");
const utils_1 = require("../openapi/utils");
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
    const paths = {};
    Object.keys(routes).forEach((path) => {
        paths[path] = {};
        const route = routes[path];
        if (route.get) {
            const { handler, ...get } = route.get;
            paths[path].get = get;
        }
        if (route.post) {
            const { handler, ...post } = route.post;
            paths[path].post = post;
        }
        if (route.put) {
            const { handler, ...put } = route.put;
            paths[path].put = put;
        }
        if (route.delete) {
            const { handler, ...del } = route.delete;
            paths[path].delete = del;
        }
        if (route.patch) {
            const { handler, ...patch } = route.patch;
            paths[path].patch = patch;
        }
    });
    return paths;
}
exports.routesToPaths = routesToPaths;
class PathBuilder {
    constructor(parent, pathName) {
        this.methods = {};
        this.builded = false;
        this.pathName = pathName;
        this.parent = parent;
    }
    get(route) {
        this.methods.get = route;
        return this;
    }
    post(route) {
        this.methods.post = route;
        return this;
    }
    put(route) {
        this.methods.put = route;
        return this;
    }
    delete(route) {
        this.methods.delete = route;
        return this;
    }
    patch(route) {
        this.methods.patch = route;
        return this;
    }
    buildPath() {
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
    }
    path(path) {
        this.buildPath();
        return new PathBuilder(this.parent, path);
    }
    responses(defaultSuccessStatusCode, successProperties, conflict = false) {
        return this.parent.responses(defaultSuccessStatusCode, successProperties, conflict);
    }
    build() {
        this.buildPath();
        return this.parent.build();
    }
}
exports.PathBuilder = PathBuilder;
class RoutesBuilder {
    constructor(resourceName) {
        this.routes = {};
        this.resourceName = resourceName ?? 'default';
    }
    addRoute(path, method, route) {
        if (!this.routes[path]) {
            this.routes[path] = {};
        }
        this.routes[path][method] = route;
    }
    path(path) {
        const pathBuilder = new PathBuilder(this, path);
        return pathBuilder;
    }
    responses(defaultSuccessStatusCode, successProperties, conflict = false) {
        return (0, responses_1.makeResponses)(this.resourceName, defaultSuccessStatusCode, successProperties, conflict);
    }
    build() {
        return this.routes;
    }
}
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
class CreateRoutes {
    constructor(api) {
        this.api = api;
    }
    createRoutes(routes) {
        Object.entries(routes).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, route]) => {
                const { handler, ...operation } = route;
                this.createRouteInner({ path, method, operation, handler });
            });
        });
    }
    createRouteResource({ paths, resource, handlers }) {
        Object.entries(paths).forEach(([path, value]) => {
            const innerOperation = getOperations(value);
            Object.keys(innerOperation).forEach((method) => {
                const operation = (0, utils_1.extractByMethod)(method, innerOperation);
                if (!operation) {
                    return;
                }
                const handler = isHandler(handlers)
                    ? (0, utils_1.extractByMethod)(method, handlers)
                    : getRouteHandler(method, resource, operation);
                if (handler === undefined) {
                    return;
                }
                this.createRouteInner({ path, method, operation, handler });
            });
        });
    }
    createRouteInner({ path, method, operation, handler }) {
        const route = {
            method: method.toUpperCase(),
            url: resolvePath(path),
            schema: {
                response: resolveResponses(operation.responses)
            },
            handler
        };
        if (route.schema !== undefined && operation.requestBody !== undefined) {
            const responseBody = operation.requestBody;
            const schema = responseBody.content['application/json'].schema;
            route.schema.body = responseToProperties(filterPropertiesRecursive(schema));
        }
        if (route.schema !== undefined &&
            operation.requestBody !== undefined &&
            operation.parameters !== undefined) {
            const query = operation.parameters?.filter((p) => {
                try {
                    const parameter = p;
                    return parameter.in === 'query';
                }
                catch (_) {
                    return false;
                }
            });
            if (query.length > 0) {
                const querySchema = {
                    type: 'object',
                    properties: queryToProperties(query)
                };
                route.schema.querystring = querySchema;
            }
        }
        this.api.route(route);
    }
}
exports.CreateRoutes = CreateRoutes;
function queryToProperties(properties) {
    const newProperties = {};
    properties.forEach(({ name, ...value }) => {
        newProperties[name] = value.schema;
    });
    return newProperties;
}
function responseToProperties(properties) {
    const newProperties = {};
    Object.entries(properties).forEach(([key, value]) => {
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
    const newProperties = {};
    Object.entries(properties).forEach(([key, value]) => {
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
    const newResponses = {};
    Object.keys(responses).forEach((statusCode) => {
        const response = responses[parseInt(statusCode)];
        if (!response.content)
            return;
        const content = response.content['application/json'];
        if (!content)
            return;
        const schema = content.schema;
        const properties = schema.properties;
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
    const newPath = path.replace(/{/g, ':').replace(/}/g, '');
    return newPath;
}
//# sourceMappingURL=index.js.map