"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenapiSchemas = void 0;
const dataTypes_1 = require("./dataTypes");
const responses_1 = require("./responses");
const utils_1 = require("./utils");
const resolveTags = (name, tags = []) => {
    const resourceName = name.toLowerCase();
    return tags.map((tag) => {
        if (tag.indexOf('$name') > -1) {
            return tag.replace('$name', resourceName);
        }
        return tag;
    });
};
const removeImutable = (properties, removeOnlyAllProp = false) => {
    const newProperties = {};
    Object.entries(properties).forEach(([key, value]) => {
        const imutable = value.imutable;
        delete value.imutable;
        if (removeOnlyAllProp && imutable) {
            return;
        }
        newProperties[key] = value;
    });
    return newProperties;
};
function generateOpenapiSchemas(resource, tags) {
    const { model, columns, search, name } = resource;
    const resourceName = name.toLowerCase();
    const singleName = (0, utils_1.convertToSingle)(name);
    const pluralName = (0, utils_1.convertToPlural)(resourceName);
    const groupName = singleName.charAt(0).toUpperCase() + singleName.slice(1);
    const attributeKeys = Object.keys(model.getAttributes());
    const properties = {};
    const required = [];
    attributeKeys.forEach((key) => {
        const column = columns[key];
        const attribute = model.getAttributes()[key];
        const propertyType = (0, dataTypes_1.convertType)(attribute.type.constructor.name);
        const property = {
            ...propertyType,
            description: `${name} ${key}`
        };
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
    const makeAllResponseProperties = () => {
        return {
            data: {
                type: 'array',
                properties: {
                    type: 'object',
                    properties: { ...properties }
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
    const makeRequestProperties = () => {
        return removeImutable(properties, false);
    };
    const makeCreateUpdateProperties = () => {
        const postProperties = { ...properties };
        delete postProperties.id;
        delete postProperties.createdAt;
        delete postProperties.updatedAt;
        return removeImutable(postProperties, true);
    };
    const getOrderByEnumValues = () => {
        const sortFields = Object.keys(properties);
        return sortFields.map((field) => field.startsWith('-') ? field.substr(1) : field);
    };
    const createUpdateProperties = makeCreateUpdateProperties();
    const requestProperties = makeRequestProperties();
    const responseResolvedPost = (0, responses_1.makeResponses)(name, 201, requestProperties, true);
    const responseResolvedDelete = (0, responses_1.makeResponses)(name, 204, requestProperties);
    const responseResolvedGetAndPut = (0, responses_1.makeResponses)(name, 200, requestProperties);
    const responseResolvedList = (0, responses_1.makeResponses)(name, 200, makeAllResponseProperties());
    const operationGet = {
        summary: `List ${name}`,
        description: `List and search ${name}`,
        tags: resolveTags(name, tags.list),
        'x-admin': {
            types: (() => {
                if (search && search.length > 0) {
                    return ['list', 'search'];
                }
                else {
                    return ['list'];
                }
            })(),
            groupName,
            resourceName: 'List',
            references: (() => {
                const references = {
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
        paths: {
            [`/api/${pluralName}`]: {
                get: {
                    summary: `List ${name}`,
                    description: `List and search ${name}`,
                    tags: resolveTags(name, tags.list),
                    'x-admin': {
                        types: (() => {
                            if (search && search.length > 0) {
                                return ['list', 'search'];
                            }
                            else {
                                return ['list'];
                            }
                        })(),
                        groupName,
                        resourceName: 'List',
                        references: (() => {
                            const references = {
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
                    summary: `Create ${name}`,
                    'x-admin': {
                        types: ['create'],
                        groupName,
                        resourceName: 'Create'
                    },
                    description: `Create ${name}`,
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
            [`/api/${pluralName}/{id}`]: {
                get: {
                    summary: `Get ${name} by ID`,
                    'x-admin': {
                        types: ['read'],
                        groupName,
                        resourceName: 'Read'
                    },
                    description: `Get ${name} by ID`,
                    tags: resolveTags(name, tags.read),
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            description: `${name} ID`,
                            schema: {
                                type: 'integer'
                            },
                            required: true
                        }
                    ],
                    responses: responseResolvedGetAndPut
                },
                put: {
                    summary: `Update ${name}`,
                    'x-admin': {
                        types: ['update'],
                        groupName,
                        resourceName: 'Update'
                    },
                    description: `Update ${name}`,
                    tags: resolveTags(name, tags.update),
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            description: `${name} ID`,
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
                    summary: `Delete ${name}`,
                    'x-admin': {
                        types: ['delete'],
                        groupName,
                        resourceName: 'Delete'
                    },
                    description: `Delete ${name}`,
                    tags: resolveTags(name, tags.delete),
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            description: `${name} ID`,
                            schema: {
                                type: 'integer'
                            },
                            required: true
                        }
                    ],
                    responses: responseResolvedDelete
                }
            }
        }
    };
}
exports.generateOpenapiSchemas = generateOpenapiSchemas;
