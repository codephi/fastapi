"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFullDoc = void 0;
var utils_1 = require("./utils");
function createFullDoc(paths) {
    var openapi = {
        openapi: '3.0.0',
        info: {
            title: process.env.APP_NAME || 'Fastapi',
            description: process.env.APP_DESCRIPTION || 'Fastapi',
            version: process.env.APP_VERSION || '1.0.0'
        },
        servers: [
            {
                url: process.env.APP_URL || 'http://localhost:3000'
            }
        ],
        paths: resolvePaths(paths)
    };
    return (0, utils_1.convertOpenAPItoSchemas)(openapi);
}
exports.createFullDoc = createFullDoc;
var resolvePaths = function (schemas) {
    Object.keys(schemas).forEach(function (path) {
        schemas[path].servers = [
            {
                url: process.env.APP_URL || 'http://localhost:3000'
            }
        ];
    });
    return schemas;
};
