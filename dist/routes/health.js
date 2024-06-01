"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const routes_1 = require("../resources/routes");
const healthRoute = new routes_1.RoutesBuilder('health');
const responsesAll = healthRoute.responses(200, {
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
exports.default = (sequelize) => healthRoute
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
    handler: handlerAll(sequelize)
})
    .build();
function handlerStatus(_request, reply) {
    reply.send({ status: 'UP' });
}
const handlerAll = (sequelize) => (_request, reply) => {
    reply.send({
        memory: getMemoryInfo(),
        process: getProcessInfo(),
        os: getOsInfo(),
        database: getDatabaseInfo(sequelize),
        container: getContainerInfo(),
        app: getAppInfo(),
        status: 'UP'
    });
};
function getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
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
    const hostname = os.hostname();
    const type = os.type();
    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();
    const uptime = os.uptime();
    const cpus = os.cpus().length;
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
function getDatabaseInfo(sequelize) {
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
