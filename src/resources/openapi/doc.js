"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createFullDoc", {
    enumerable: true,
    get: function() {
        return createFullDoc;
    }
});
const _utils = require("./utils");
function createFullDoc(paths) {
    const openapi = {
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
    return (0, _utils.convertOpenAPItoSchemas)(openapi);
}
const resolvePaths = (schemas)=>{
    Object.keys(schemas).forEach((path)=>{
        schemas[path].servers = [
            {
                url: process.env.APP_URL || 'http://localhost:3000'
            }
        ];
    });
    return schemas;
};
hemas;
};
