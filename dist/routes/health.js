"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var database_1 = require("../middle/database");
var routes_1 = require("../resources/routes");
var healthRoute = new routes_1.RoutesBuilder('health');
var responsesAll = healthRoute.responses(200, {
    server: {
        type: 'object',
        properties: {
            platform: { type: 'string' },
            release: { type: 'string' },
            arch: { type: 'string' },
            uptime: { type: 'number' },
            cpus: { type: 'number' }
        }
    },
    memory: {
        type: 'object',
        properties: {
            total: { type: 'number' },
            free: { type: 'number' },
            used: { type: 'number' },
            active: { type: 'number' },
            available: { type: 'number' }
        }
    },
    process: {
        type: 'object',
        properties: {
            pid: { type: 'number' },
            uptime: { type: 'number' },
            versions: { type: 'object' },
            memoryUsage: { type: 'object' }
        }
    },
    os: {
        type: 'object',
        properties: {
            hostname: { type: 'string' },
            type: { type: 'string' },
            platform: { type: 'string' },
            release: { type: 'string' },
            arch: { type: 'string' },
            uptime: { type: 'number' },
            cpus: { type: 'number' }
        }
    },
    container: {
        type: 'object',
        properties: {
            image: { type: 'string' },
            version: { type: 'string' },
            containerId: { type: 'string' }
        }
    },
    database: {
        type: 'object',
        properties: {
            dialect: { type: 'string' },
            host: { type: 'string' },
            port: { type: 'number' },
            database: { type: 'string' },
            username: { type: 'string' }
        }
    },
    status: { type: 'string' }
});
exports.default = (function () {
    return healthRoute
        .path('/health')
        .get({
        tags: ['Health'],
        summary: 'Get health information',
        description: 'Get health information',
        responses: healthRoute.responses(200, {
            status: { type: 'string' }
        }),
        handler: handlerStatus
    })
        .path('/health/all')
        .get({
        tags: ['Health'],
        summary: 'Get all health information',
        description: 'Get all health information',
        responses: responsesAll,
        handler: handlerAll
    })
        .build();
});
function handlerStatus(_request, reply) {
    reply.send({ status: 'UP' });
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
    var total = os.totalmem();
    var free = os.freemem();
    var used = total - free;
    var active = total - free;
    var available = total - free;
    return {
        total: total,
        free: free,
        used: used,
        active: active,
        available: available
    };
}
function getProcessInfo() {
    var pid = process.pid;
    var uptime = process.uptime();
    var versions = process.versions;
    var memoryUsage = process.memoryUsage();
    return {
        pid: pid,
        uptime: uptime,
        versions: versions,
        memoryUsage: memoryUsage
    };
}
function getOsInfo() {
    var hostname = os.hostname();
    var type = os.type();
    var platform = os.platform();
    var release = os.release();
    var arch = os.arch();
    var uptime = os.uptime();
    var cpus = os.cpus().length;
    return {
        hostname: hostname,
        type: type,
        platform: platform,
        release: release,
        arch: arch,
        uptime: uptime,
        cpus: cpus
    };
}
function getDatabaseInfo() {
    var sequelize = database_1.global.getSequelize();
    var dialect = sequelize.getDialect();
    var host = sequelize.config.host;
    var port = parseInt(sequelize.config.port);
    var database = sequelize.config.database;
    var username = sequelize.config.username;
    return {
        dialect: dialect,
        host: host,
        port: port,
        database: database,
        username: username
    };
}
function getContainerInfo() {
    var image = process.env.IMAGE;
    var version = process.env.VERSION;
    var containerId = process.env.HOSTNAME;
    return {
        image: image,
        version: version,
        containerId: containerId
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
