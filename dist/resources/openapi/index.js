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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenapiSchemas = void 0;
var dataTypes_1 = require("./dataTypes");
var responses_1 = require("./responses");
var utils_1 = require("./utils");
var resolveTags = function (name, tags) {
    if (tags === void 0) { tags = []; }
    var resourceName = name.toLowerCase();
    return tags.map(function (tag) {
        if (tag.indexOf('$name') > -1) {
            return tag.replace('$name', resourceName);
        }
        return tag;
    });
};
var removeImutable = function (properties, removeOnlyAllProp) {
    if (removeOnlyAllProp === void 0) { removeOnlyAllProp = false; }
    var newProperties = {};
    Object.entries(properties).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var imutable = value.imutable;
        delete value.imutable;
        if (removeOnlyAllProp && imutable) {
            return;
        }
        newProperties[key] = value;
    });
    return newProperties;
};
function generateOpenapiSchemas(resource, tags) {
    var _a;
    var model = resource.model, columns = resource.columns, search = resource.search, name = resource.name;
    var resourceName = name.toLowerCase();
    var singleName = (0, utils_1.convertToSingle)(name);
    var pluralName = (0, utils_1.convertToPlural)(resourceName);
    var groupName = singleName.charAt(0).toUpperCase() + singleName.slice(1);
    var attributeKeys = Object.keys(model.getAttributes());
    var properties = {};
    var required = [];
    attributeKeys.forEach(function (key) {
        var column = columns[key];
        var attribute = model.getAttributes()[key];
        var propertyType = (0, dataTypes_1.convertType)(attribute.type.constructor.name);
        var property = __assign(__assign({}, propertyType), { description: "".concat(name, " ").concat(key) });
        if (property.type === 'string' &&
            'maxLength' in column &&
            column.maxLength !== undefined) {
            property.maxLength = column.maxLength;
        }
        if (attribute.type.constructor.name === 'ENUM') {
            property.type = 'string';
            property.enum = column.values;
        }
        if ('min' in column) {
            property.minimum = column.min;
        }
        if ('max' in column) {
            property.maximum = column.max;
        }
        if ('defaultValue' in column) {
            property.default = column.defaultValue;
        }
        if ('imutable' in column) {
            property.imutable = column.imutable;
        }
        if (column.allowNull === true) {
            property.nullable = true;
        }
        property['x-admin-type'] = column.type;
        properties[key] = property;
        if (!attribute.allowNull || column.required) {
            required.push(key);
        }
    });
    var makeAllResponseProperties = function () {
        return {
            data: {
                type: 'array',
                properties: {
                    type: 'object',
                    properties: __assign({}, properties)
                }
            },
            meta: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    totalItems: { type: 'integer' }
                }
            }
        };
    };
    var makeRequestProperties = function () {
        return removeImutable(properties, false);
    };
    var makeCreateUpdateProperties = function () {
        var postProperties = __assign({}, properties);
        delete postProperties.id;
        delete postProperties.createdAt;
        delete postProperties.updatedAt;
        return removeImutable(postProperties, true);
    };
    var getOrderByEnumValues = function () {
        var sortFields = Object.keys(properties);
        return sortFields.map(function (field) {
            return field.startsWith('-') ? field.substr(1) : field;
        });
    };
    var createUpdateProperties = makeCreateUpdateProperties();
    var requestProperties = makeRequestProperties();
    var responseResolvedPost = (0, responses_1.makeResponses)(name, 201, requestProperties, true);
    var responseResolvedDelete = (0, responses_1.makeResponses)(name, 204, requestProperties);
    var responseResolvedGetAndPut = (0, responses_1.makeResponses)(name, 200, requestProperties);
    var responseResolvedList = (0, responses_1.makeResponses)(name, 200, makeAllResponseProperties());
    var operationGet = {
        summary: "List ".concat(name),
        description: "List and search ".concat(name),
        tags: resolveTags(name, tags.list),
        'x-admin': {
            types: (function () {
                if (search && search.length > 0) {
                    return ['list', 'search'];
                }
                else {
                    return ['list'];
                }
            })(),
            groupName: groupName,
            resourceName: 'List',
            references: (function () {
                var references = {
                    list: {
                        query: {
                            pageSize: 'page_size',
                            page: 'page',
                            orderBy: 'order_by',
                            order: 'order',
                            searchTerm: 'search'
                        }
                    }
                };
                if (search && search.length > 0) {
                    references.search = {
                        query: {
                            pageSize: 'page_size',
                            page: 'page',
                            orderBy: 'order_by',
                            order: 'order',
                            searchTerm: 'search'
                        }
                    };
                }
                return references;
            })()
        },
        parameters: [
            {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: {
                    type: 'integer',
                    minimum: 1
                }
            },
            {
                name: 'page_size',
                in: 'query',
                description: 'Number of items per page',
                schema: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100
                }
            },
            {
                name: 'search',
                in: 'query',
                description: 'Search query string',
                schema: {
                    type: 'string'
                }
            },
            {
                name: 'order_by',
                in: 'query',
                description: 'Order field',
                schema: {
                    type: 'string',
                    enum: getOrderByEnumValues()
                }
            },
            {
                name: 'order',
                in: 'query',
                description: 'Order direction',
                schema: {
                    type: 'string',
                    enum: ['desc', 'asc']
                }
            }
        ],
        responses: responseResolvedList
    };
    return {
        paths: (_a = {},
            _a["/api/".concat(pluralName)] = {
                get: {
                    summary: "List ".concat(name),
                    description: "List and search ".concat(name),
                    tags: resolveTags(name, tags.list),
                    'x-admin': {
                        types: (function () {
                            if (search && search.length > 0) {
                                return ['list', 'search'];
                            }
                            else {
                                return ['list'];
                            }
                        })(),
                        groupName: groupName,
                        resourceName: 'List',
                        references: (function () {
                            var references = {
                                list: {
                                    query: {
                                        pageSize: 'page_size',
                                        page: 'page',
                                        orderBy: 'order_by',
                                        order: 'order',
                                        searchTerm: 'search'
                                    }
                                }
                            };
                            if (search && search.length > 0) {
                                references.search = {
                                    query: {
                                        pageSize: 'page_size',
                                        page: 'page',
                                        orderBy: 'order_by',
                                        order: 'order',
                                        searchTerm: 'search'
                                    }
                                };
                            }
                            return references;
                        })()
                    },
                    parameters: [
                        {
                            name: 'page',
                            in: 'query',
                            description: 'Page number',
                            schema: {
                                type: 'integer',
                                minimum: 1
                            }
                        },
                        {
                            name: 'page_size',
                            in: 'query',
                            description: 'Number of items per page',
                            schema: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 100
                            }
                        },
                        {
                            name: 'search',
                            in: 'query',
                            description: 'Search query string',
                            schema: {
                                type: 'string'
                            }
                        },
                        {
                            name: 'order_by',
                            in: 'query',
                            description: 'Order field',
                            schema: {
                                type: 'string',
                                enum: getOrderByEnumValues()
                            }
                        },
                        {
                            name: 'order',
                            in: 'query',
                            description: 'Order direction',
                            schema: {
                                type: 'string',
                                enum: ['desc', 'asc']
                            }
                        }
                    ],
                    responses: responseResolvedList
                },
                post: {
                    summary: "Create ".concat(name),
                    'x-admin': {
                        types: ['create'],
                        groupName: groupName,
                        resourceName: 'Create'
                    },
                    description: "Create ".concat(name),
                    tags: resolveTags(name, tags.create),
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: createUpdateProperties
                                }
                            }
                        }
                    },
                    responses: responseResolvedPost
                }
            },
            _a["/api/".concat(pluralName, "/{id}")] = {
                get: {
                    summary: "Get ".concat(name, " by ID"),
                    'x-admin': {
                        types: ['read'],
                        groupName: groupName,
                        resourceName: 'Read'
                    },
                    description: "Get ".concat(name, " by ID"),
                    tags: resolveTags(name, tags.read),
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            description: "".concat(name, " ID"),
                            schema: {
                                type: 'integer'
                            },
                            required: true
                        }
                    ],
                    responses: responseResolvedGetAndPut
                },
                put: {
                    summary: "Update ".concat(name),
                    'x-admin': {
                        types: ['update'],
                        groupName: groupName,
                        resourceName: 'Update'
                    },
                    description: "Update ".concat(name),
                    tags: resolveTags(name, tags.update),
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            description: "".concat(name, " ID"),
                            schema: {
                                type: 'integer'
                            },
                            required: true
                        }
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: createUpdateProperties
                                }
                            }
                        }
                    },
                    responses: responseResolvedGetAndPut
                },
                delete: {
                    summary: "Delete ".concat(name),
                    'x-admin': {
                        types: ['delete'],
                        groupName: groupName,
                        resourceName: 'Delete'
                    },
                    description: "Delete ".concat(name),
                    tags: resolveTags(name, tags.delete),
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            description: "".concat(name, " ID"),
                            schema: {
                                type: 'integer'
                            },
                            required: true
                        }
                    ],
                    responses: responseResolvedDelete
                }
            },
            _a)
    };
}
exports.generateOpenapiSchemas = generateOpenapiSchemas;
