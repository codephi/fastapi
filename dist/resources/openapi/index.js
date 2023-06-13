function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
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
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
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
import { convertType } from "./dataTypes";
import { makeResponses } from "./responses";
import { convertToPlural, convertToSingle } from "./utils";
var resolveTags = function(name) {
    var tags = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
    var resourceName = name.toLowerCase();
    return tags.map(function(tag) {
        if (tag.indexOf("$name") > -1) {
            return tag.replace("$name", resourceName);
        }
        return tag;
    });
};
var removeImutable = function(properties) {
    var removeOnlyAllProp = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    var newProperties = {};
    Object.entries(properties).forEach(function(param) {
        var _param = _sliced_to_array(param, 2), key = _param[0], value = _param[1];
        var imutable = value.imutable;
        delete value.imutable;
        if (removeOnlyAllProp && imutable) {
            return;
        }
        newProperties[key] = value;
    });
    return newProperties;
};
export function generateOpenapiSchemas(resource, tags) {
    var model = resource.model, columns = resource.columns, search = resource.search, name = resource.name;
    var resourceName = name.toLowerCase();
    var singleName = convertToSingle(name);
    var pluralName = convertToPlural(resourceName);
    var groupName = singleName.charAt(0).toUpperCase() + singleName.slice(1);
    var attributeKeys = Object.keys(model.getAttributes());
    var properties = {};
    var required = [];
    attributeKeys.forEach(function(key) {
        var column = columns[key];
        var attribute = model.getAttributes()[key];
        var propertyType = convertType(attribute.type.constructor.name);
        var property = _object_spread_props(_object_spread({}, propertyType), {
            description: "".concat(name, " ").concat(key)
        });
        if (property.type === "string" && "maxLength" in column && column.maxLength !== undefined) {
            property.maxLength = column.maxLength;
        }
        if (attribute.type.constructor.name === "ENUM") {
            property.type = "string";
            property.enum = column.values;
        }
        if ("min" in column) {
            property.minimum = column.min;
        }
        if ("max" in column) {
            property.maximum = column.max;
        }
        if ("defaultValue" in column) {
            property.default = column.defaultValue;
        }
        if ("imutable" in column) {
            property.imutable = column.imutable;
        }
        if (column.allowNull === true) {
            property.nullable = true;
        }
        property["x-admin-type"] = column.type;
        properties[key] = property;
        if (!attribute.allowNull || column.required) {
            required.push(key);
        }
    });
    var makeAllResponseProperties = function() {
        return {
            data: {
                type: "array",
                properties: {
                    type: "object",
                    properties: _object_spread({}, properties)
                }
            },
            meta: {
                type: "object",
                properties: {
                    page: {
                        type: "integer"
                    },
                    pageSize: {
                        type: "integer"
                    },
                    totalPages: {
                        type: "integer"
                    },
                    totalItems: {
                        type: "integer"
                    }
                }
            }
        };
    };
    var makeRequestProperties = function() {
        return removeImutable(properties, false);
    };
    var makeCreateUpdateProperties = function() {
        var postProperties = _object_spread({}, properties);
        delete postProperties.id;
        delete postProperties.createdAt;
        delete postProperties.updatedAt;
        return removeImutable(postProperties, true);
    };
    var getOrderByEnumValues = function() {
        var sortFields = Object.keys(properties);
        return sortFields.map(function(field) {
            return field.startsWith("-") ? field.substr(1) : field;
        });
    };
    var createUpdateProperties = makeCreateUpdateProperties();
    var requestProperties = makeRequestProperties();
    var responseResolvedPost = makeResponses(name, 201, requestProperties, true);
    var responseResolvedDelete = makeResponses(name, 204, requestProperties);
    var responseResolvedGetAndPut = makeResponses(name, 200, requestProperties);
    var responseResolvedList = makeResponses(name, 200, makeAllResponseProperties());
    var operationGet = {
        summary: "List ".concat(name),
        description: "List and search ".concat(name),
        tags: resolveTags(name, tags.list),
        "x-admin": {
            types: function() {
                if (search && search.length > 0) {
                    return [
                        "list",
                        "search"
                    ];
                } else {
                    return [
                        "list"
                    ];
                }
            }(),
            groupName: groupName,
            resourceName: "List",
            references: function() {
                var references = {
                    list: {
                        query: {
                            pageSize: "page_size",
                            page: "page",
                            orderBy: "order_by",
                            order: "order",
                            searchTerm: "search"
                        }
                    }
                };
                if (search && search.length > 0) {
                    references.search = {
                        query: {
                            pageSize: "page_size",
                            page: "page",
                            orderBy: "order_by",
                            order: "order",
                            searchTerm: "search"
                        }
                    };
                }
                return references;
            }()
        },
        parameters: [
            {
                name: "page",
                in: "query",
                description: "Page number",
                schema: {
                    type: "integer",
                    minimum: 1
                }
            },
            {
                name: "page_size",
                in: "query",
                description: "Number of items per page",
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 100
                }
            },
            {
                name: "search",
                in: "query",
                description: "Search query string",
                schema: {
                    type: "string"
                }
            },
            {
                name: "order_by",
                in: "query",
                description: "Order field",
                schema: {
                    type: "string",
                    enum: getOrderByEnumValues()
                }
            },
            {
                name: "order",
                in: "query",
                description: "Order direction",
                schema: {
                    type: "string",
                    enum: [
                        "desc",
                        "asc"
                    ]
                }
            }
        ],
        responses: responseResolvedList
    };
    var _obj;
    return {
        paths: (_obj = {}, _define_property(_obj, "/api/".concat(pluralName), {
            get: {
                summary: "List ".concat(name),
                description: "List and search ".concat(name),
                tags: resolveTags(name, tags.list),
                "x-admin": {
                    types: function() {
                        if (search && search.length > 0) {
                            return [
                                "list",
                                "search"
                            ];
                        } else {
                            return [
                                "list"
                            ];
                        }
                    }(),
                    groupName: groupName,
                    resourceName: "List",
                    references: function() {
                        var references = {
                            list: {
                                query: {
                                    pageSize: "page_size",
                                    page: "page",
                                    orderBy: "order_by",
                                    order: "order",
                                    searchTerm: "search"
                                }
                            }
                        };
                        if (search && search.length > 0) {
                            references.search = {
                                query: {
                                    pageSize: "page_size",
                                    page: "page",
                                    orderBy: "order_by",
                                    order: "order",
                                    searchTerm: "search"
                                }
                            };
                        }
                        return references;
                    }()
                },
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        description: "Page number",
                        schema: {
                            type: "integer",
                            minimum: 1
                        }
                    },
                    {
                        name: "page_size",
                        in: "query",
                        description: "Number of items per page",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100
                        }
                    },
                    {
                        name: "search",
                        in: "query",
                        description: "Search query string",
                        schema: {
                            type: "string"
                        }
                    },
                    {
                        name: "order_by",
                        in: "query",
                        description: "Order field",
                        schema: {
                            type: "string",
                            enum: getOrderByEnumValues()
                        }
                    },
                    {
                        name: "order",
                        in: "query",
                        description: "Order direction",
                        schema: {
                            type: "string",
                            enum: [
                                "desc",
                                "asc"
                            ]
                        }
                    }
                ],
                responses: responseResolvedList
            },
            post: {
                summary: "Create ".concat(name),
                "x-admin": {
                    types: [
                        "create"
                    ],
                    groupName: groupName,
                    resourceName: "Create"
                },
                description: "Create ".concat(name),
                tags: resolveTags(name, tags.create),
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: createUpdateProperties
                            }
                        }
                    }
                },
                responses: responseResolvedPost
            }
        }), _define_property(_obj, "/api/".concat(pluralName, "/{id}"), {
            get: {
                summary: "Get ".concat(name, " by ID"),
                "x-admin": {
                    types: [
                        "read"
                    ],
                    groupName: groupName,
                    resourceName: "Read"
                },
                description: "Get ".concat(name, " by ID"),
                tags: resolveTags(name, tags.read),
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "".concat(name, " ID"),
                        schema: {
                            type: "integer"
                        },
                        required: true
                    }
                ],
                responses: responseResolvedGetAndPut
            },
            put: {
                summary: "Update ".concat(name),
                "x-admin": {
                    types: [
                        "update"
                    ],
                    groupName: groupName,
                    resourceName: "Update"
                },
                description: "Update ".concat(name),
                tags: resolveTags(name, tags.update),
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "".concat(name, " ID"),
                        schema: {
                            type: "integer"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: createUpdateProperties
                            }
                        }
                    }
                },
                responses: responseResolvedGetAndPut
            },
            delete: {
                summary: "Delete ".concat(name),
                "x-admin": {
                    types: [
                        "delete"
                    ],
                    groupName: groupName,
                    resourceName: "Delete"
                },
                description: "Delete ".concat(name),
                tags: resolveTags(name, tags.delete),
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "".concat(name, " ID"),
                        schema: {
                            type: "integer"
                        },
                        required: true
                    }
                ],
                responses: responseResolvedDelete
            }
        }), _obj)
    };
}
