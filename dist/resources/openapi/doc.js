import { convertOpenAPItoSchemas } from "./utils";
export function createFullDoc(paths) {
    var openapi = {
        openapi: "3.0.0",
        info: {
            title: process.env.APP_NAME || "Fastapi",
            description: process.env.APP_DESCRIPTION || "Fastapi",
            version: process.env.APP_VERSION || "1.0.0"
        },
        servers: [
            {
                url: process.env.APP_URL || "http://localhost:3000"
            }
        ],
        paths: resolvePaths(paths)
    };
    return convertOpenAPItoSchemas(openapi);
}
var resolvePaths = function(schemas) {
    Object.keys(schemas).forEach(function(path) {
        schemas[path].servers = [
            {
                url: process.env.APP_URL || "http://localhost:3000"
            }
        ];
    });
    return schemas;
};
