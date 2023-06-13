"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _os = /*#__PURE__*/ _interop_require_wildcard(require("os"));
const _database = require("../middle/database");
const _routes = require("../resources/routes/index");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const healthRoute = new _routes.RoutesBuilder('health');
const responsesAll = healthRoute.responses(200, {
    server: {
        type: 'object',
        properties: {
            platform: {
                type: 'string'
            },
            release: {
                type: 'string'
            },
            arch: {
                type: 'string'
            },
            uptime: {
                type: 'number'
            },
            cpus: {
                type: 'number'
            }
        }
    },
    memory: {
        type: 'object',
        properties: {
            total: {
                type: 'number'
            },
            free: {
                type: 'number'
            },
            used: {
                type: 'number'
            },
            active: {
                type: 'number'
            },
            available: {
                type: 'number'
            }
        }
    },
    process: {
        type: 'object',
        properties: {
            pid: {
                type: 'number'
            },
            uptime: {
                type: 'number'
            },
            versions: {
                type: 'object'
            },
            memoryUsage: {
                type: 'object'
            }
        }
    },
    os: {
        type: 'object',
        properties: {
            hostname: {
                type: 'string'
            },
            type: {
                type: 'string'
            },
            platform: {
                type: 'string'
            },
            release: {
                type: 'string'
            },
            arch: {
                type: 'string'
            },
            uptime: {
                type: 'number'
            },
            cpus: {
                type: 'number'
            }
        }
    },
    container: {
        type: 'object',
        properties: {
            image: {
                type: 'string'
            },
            version: {
                type: 'string'
            },
            containerId: {
                type: 'string'
            }
        }
    },
    database: {
        type: 'object',
        properties: {
            dialect: {
                type: 'string'
            },
            host: {
                type: 'string'
            },
            port: {
                type: 'number'
            },
            database: {
                type: 'string'
            },
            username: {
                type: 'string'
            }
        }
    },
    status: {
        type: 'string'
    }
});
const _default = ()=>healthRoute.path('/health').get({
        tags: [
            'Health'
        ],
        summary: 'Get health information',
        description: 'Get health information',
        responses: healthRoute.responses(200, {
            status: {
                type: 'string'
            }
        }),
        handler: handlerStatus
    }).path('/health/all').get({
        tags: [
            'Health'
        ],
        summary: 'Get all health information',
        description: 'Get all health information',
        responses: responsesAll,
        handler: handlerAll
    }).build();
function handlerStatus(_request, reply) {
    reply.send({
        status: 'UP'
    });
}
function handlerAll(_request, reply) {
    reply.send({
        memory: getMemoryInfo(),
        process: getProcessInfo(),
        os: getOsInfo(),
        database: getDatabaseInfo(),
        container: getContainerInfo(),
        app: getAppInfo(),
        status: 'UP'
    });
}
function getMemoryInfo() {
    const total = _os.totalmem();
    const free = _os.freemem();
    const used = total - free;
    const active = total - free;
    const available = total - free;
    return {
        total,
        free,
        used,
        active,
        available
    };
}
function getProcessInfo() {
    const pid = process.pid;
    const uptime = process.uptime();
    const versions = process.versions;
    const memoryUsage = process.memoryUsage();
    return {
        pid,
        uptime,
        versions,
        memoryUsage
    };
}
function getOsInfo() {
    const hostname = _os.hostname();
    const type = _os.type();
    const platform = _os.platform();
    const release = _os.release();
    const arch = _os.arch();
    const uptime = _os.uptime();
    const cpus = _os.cpus().length;
    return {
        hostname,
        type,
        platform,
        release,
        arch,
        uptime,
        cpus
    };
}
function getDatabaseInfo() {
    const sequelize = _database.global.getSequelize();
    const dialect = sequelize.getDialect();
    const host = sequelize.config.host;
    const port = parseInt(sequelize.config.port);
    const database = sequelize.config.database;
    const username = sequelize.config.username;
    return {
        dialect,
        host,
        port,
        database,
        username
    };
}
function getContainerInfo() {
    const image = process.env.IMAGE;
    const version = process.env.VERSION;
    const containerId = process.env.HOSTNAME;
    return {
        image,
        version,
        containerId
    };
}
function getAppInfo() {
    const image = process.env.NAME;
    const version = process.env.VERSION;
    return {
        image,
        version
    };
}
};
}
function getAppInfo() {
    var image = process.env.NAME;
    var version = process.env.VERSION;
    return {
        image: image,
        version: version
    };
}
