function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
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
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
import { getAll, getOne, create, update, remove } from "./routes";
import { makeResponses } from "../openapi/responses";
import { extractByMethod } from "../openapi/utils";
export var MethodType;
(function(MethodType) {
    MethodType["GET"] = "get";
    MethodType["POST"] = "post";
    MethodType["PUT"] = "put";
    MethodType["DELETE"] = "delete";
    MethodType["PATCH"] = "patch";
})(MethodType || (MethodType = {}));
function getOperations(value) {
    return {
        get: value.get,
        post: value.post,
        put: value.put,
        delete: value.delete,
        patch: value.patch
    };
}
export function routesToPaths(routes) {
    var paths = {};
    Object.keys(routes).forEach(function(path) {
        paths[path] = {};
        var route = routes[path];
        if (route.get) {
            var _route_get = route.get, handler = _route_get.handler, get = _object_without_properties(_route_get, [
                "handler"
            ]);
            paths[path].get = get;
        }
        if (route.post) {
            var _route_post = route.post, handler1 = _route_post.handler, post = _object_without_properties(_route_post, [
                "handler"
            ]);
            paths[path].post = post;
        }
        if (route.put) {
            var _route_put = route.put, handler2 = _route_put.handler, put = _object_without_properties(_route_put, [
                "handler"
            ]);
            paths[path].put = put;
        }
        if (route.delete) {
            var _route_delete = route.delete, handler3 = _route_delete.handler, del = _object_without_properties(_route_delete, [
                "handler"
            ]);
            paths[path].delete = del;
        }
        if (route.patch) {
            var _route_patch = route.patch, handler4 = _route_patch.handler, patch = _object_without_properties(_route_patch, [
                "handler"
            ]);
            paths[path].patch = patch;
        }
    });
    return paths;
}
export var PathBuilder = /*#__PURE__*/ function() {
    "use strict";
    function PathBuilder(parent, pathName) {
        _class_call_check(this, PathBuilder);
        _define_property(this, "methods", {});
        _define_property(this, "pathName", void 0);
        _define_property(this, "parent", void 0);
        _define_property(this, "builded", false);
        this.pathName = pathName;
        this.parent = parent;
    }
    _create_class(PathBuilder, [
        {
            key: "get",
            value: function get(route) {
                this.methods.get = route;
                return this;
            }
        },
        {
            key: "post",
            value: function post(route) {
                this.methods.post = route;
                return this;
            }
        },
        {
            key: "put",
            value: function put(route) {
                this.methods.put = route;
                return this;
            }
        },
        {
            key: "delete",
            value: function _delete(route) {
                this.methods.delete = route;
                return this;
            }
        },
        {
            key: "patch",
            value: function patch(route) {
                this.methods.patch = route;
                return this;
            }
        },
        {
            key: "buildPath",
            value: function buildPath() {
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
        },
        {
            key: "path",
            value: function path(path) {
                this.buildPath();
                return new PathBuilder(this.parent, path);
            }
        },
        {
            key: "responses",
            value: function responses(defaultSuccessStatusCode, successProperties) {
                var conflict = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                return this.parent.responses(defaultSuccessStatusCode, successProperties, conflict);
            }
        },
        {
            key: "build",
            value: function build() {
                this.buildPath();
                return this.parent.build();
            }
        }
    ]);
    return PathBuilder;
}();
export var RoutesBuilder = /*#__PURE__*/ function() {
    "use strict";
    function RoutesBuilder(resourceName) {
        _class_call_check(this, RoutesBuilder);
        _define_property(this, "routes", {});
        _define_property(this, "resourceName", void 0);
        this.resourceName = resourceName !== null && resourceName !== void 0 ? resourceName : "default";
    }
    _create_class(RoutesBuilder, [
        {
            key: "addRoute",
            value: function addRoute(path, method, route) {
                if (!this.routes[path]) {
                    this.routes[path] = {};
                }
                this.routes[path][method] = route;
            }
        },
        {
            key: "path",
            value: function path(path) {
                var pathBuilder = new PathBuilder(this, path);
                return pathBuilder;
            }
        },
        {
            key: "responses",
            value: function responses(defaultSuccessStatusCode, successProperties) {
                var conflict = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                return makeResponses(this.resourceName, defaultSuccessStatusCode, successProperties, conflict);
            }
        },
        {
            key: "build",
            value: function build() {
                return this.routes;
            }
        }
    ]);
    return RoutesBuilder;
}();
function isHandler(handlers) {
    if (handlers === undefined) {
        return false;
    }
    if (handlers.get || handlers.post || handlers.put || handlers.delete || handlers.patch) {
        return true;
    }
    return false;
}
export var CreateRoutes = /*#__PURE__*/ function() {
    "use strict";
    function CreateRoutes(api) {
        _class_call_check(this, CreateRoutes);
        _define_property(this, "api", void 0);
        this.api = api;
    }
    _create_class(CreateRoutes, [
        {
            key: "createRoutes",
            value: function createRoutes(routes) {
                var _this = this;
                Object.entries(routes).forEach(function(param) {
                    var _param = _sliced_to_array(param, 2), path = _param[0], methods = _param[1];
                    Object.entries(methods).forEach(function(param) {
                        var _param = _sliced_to_array(param, 2), method = _param[0], route = _param[1];
                        var handler = route.handler, operation = _object_without_properties(route, [
                            "handler"
                        ]);
                        _this.createRouteInner({
                            path: path,
                            method: method,
                            operation: operation,
                            handler: handler
                        });
                    });
                });
            }
        },
        {
            key: "createRouteResource",
            value: function createRouteResource(param) {
                var paths = param.paths, resource = param.resource, handlers = param.handlers;
                var _this = this;
                Object.entries(paths).forEach(function(param) {
                    var _param = _sliced_to_array(param, 2), path = _param[0], value = _param[1];
                    var innerOperation = getOperations(value);
                    Object.keys(innerOperation).forEach(function(method) {
                        var operation = extractByMethod(method, innerOperation);
                        if (!operation) {
                            return;
                        }
                        var handler = isHandler(handlers) ? extractByMethod(method, handlers) : getRouteHandler(method, resource, operation);
                        if (handler === undefined) {
                            return;
                        }
                        _this.createRouteInner({
                            path: path,
                            method: method,
                            operation: operation,
                            handler: handler
                        });
                    });
                });
            }
        },
        {
            key: "createRouteInner",
            value: function createRouteInner(param) {
                var path = param.path, method = param.method, operation = param.operation, handler = param.handler;
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
                    var schema = responseBody.content["application/json"].schema;
                    route.schema.body = responseToProperties(filterPropertiesRecursive(schema));
                }
                if (route.schema !== undefined && operation.requestBody !== undefined && operation.parameters !== undefined) {
                    var _operation_parameters_filter, _object;
                    var query = (_object = operation.parameters) === null || _object === void 0 ? void 0 : (_operation_parameters_filter = _object.filter) === null || _operation_parameters_filter === void 0 ? void 0 : _operation_parameters_filter.call(_object, function(p) {
                        try {
                            var parameter = p;
                            return parameter.in === "query";
                        } catch (_) {
                            return false;
                        }
                    });
                    if (query.length > 0) {
                        var querySchema = {
                            type: "object",
                            properties: queryToProperties(query)
                        };
                        route.schema.querystring = querySchema;
                    }
                }
                this.api.route(route);
            }
        }
    ]);
    return CreateRoutes;
}();
function queryToProperties(properties) {
    var newProperties = {};
    properties.forEach(function(_param) {
        var name = _param.name, value = _object_without_properties(_param, [
            "name"
        ]);
        newProperties[name] = value.schema;
    });
    return newProperties;
}
function responseToProperties(properties) {
    var newProperties = {};
    Object.entries(properties).forEach(function(param) {
        var _param = _sliced_to_array(param, 2), key = _param[0], value = _param[1];
        newProperties[key] = propertiesToItems(value);
    });
    return newProperties;
}
function propertiesToItems(value) {
    if (value.type !== "object" && value.properties !== undefined) {
        value.items = value.properties;
        delete value.properties;
    }
    return value;
}
function filterPropertiesRecursive(properties) {
    var newProperties = {};
    Object.entries(properties).forEach(function(param) {
        var _param = _sliced_to_array(param, 2), key = _param[0], value = _param[1];
        if (key.startsWith("x-")) return;
        // value is Schema
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                newProperties[key] = filterPropertiesRecursive(value);
                return;
            }
        }
        newProperties[key] = value;
    });
    return newProperties;
}
export function resolveResponses(responses) {
    if (!responses) return {};
    var newResponses = {};
    Object.keys(responses).forEach(function(statusCode) {
        var response = responses[parseInt(statusCode)];
        if (!response.content) return;
        var content = response.content["application/json"];
        if (!content) return;
        var schema = content.schema;
        var properties = schema.properties;
        newResponses[statusCode] = {
            description: response.description,
            type: "object",
            properties: properties ? responseToProperties(properties) : undefined
        };
    });
    return newResponses;
}
function getRouteHandler(method, resource, operation) {
    if (method === "get") {
        if (operation["x-admin"].types.includes("list")) {
            return getAll(resource);
        } else {
            return getOne(resource);
        }
    } else if (method === "post") {
        return create(resource);
    } else if (method === "put") {
        return update(resource);
    } else if (method === "delete") {
        return remove(resource);
    }
}
function resolvePath(path) {
    var newPath = path.replace(/{/g, ":").replace(/}/g, "");
    return newPath;
}
