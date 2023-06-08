import os from 'os';
import { FastifyRequest, FastifyReply } from 'fastify';
import { global } from '../middle/database';
import { resolveResponses } from '../resources/openapi/responses';

export interface Server {
  platform: string;
  release: string;
  arch: string;
  uptime: number;
  cpus: number;
}

export interface Memory {
  total: number;
  free: number;
  used: number;
  active: number;
  available: number;
}

export interface Process {
  pid: number;
  uptime: number;
  versions: NodeJS.ProcessVersions;
  memoryUsage: NodeJS.MemoryUsage;
}

export interface Os {
  hostname: string;
  type: string;
  platform: string;
  release: string;
  arch: string;
  uptime: number;
  cpus: number;
}

export interface Container {
  image: string;
  version: string;
  containerId: string;
}

export interface Database {
  dialect: string;
  host: string;
  port: number;
  database: string;
  username: string;
}

export interface HealthResponse {
  server: Server;
  memory: Memory;
  process: Process;
  os: Os;
  database: Database;
  container: Container;
  status: string;
}

export interface HealthQuery {
  info?: string;
}

const healthHandler = (request: FastifyRequest, reply: FastifyReply): void => {
  const { info } = request.query as HealthQuery;

  const sequelize = global.getSequelize();

  if (info === 'all') {
    const serverInfo = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      uptime: os.uptime(),
      cpus: os.cpus().length
    } as Server;
    const memoryInfo = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      active: os.totalmem() - os.freemem(),
      available: os.totalmem() - os.freemem()
    } as Memory;
    const processInfo = {
      pid: process.pid,
      uptime: process.uptime(),
      versions: process.versions,
      memoryUsage: process.memoryUsage()
    } as Process;
    const osInfo = {
      hostname: os.hostname(),
      type: os.type(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      uptime: os.uptime(),
      cpus: os.cpus().length
    } as Os;
    const databaseInfo = {
      dialect: global.getSequelize().getDialect(),
      host: sequelize.config.host,
      port: sequelize.config.port ? parseInt(sequelize.config.port) || 0 : 0,
      database: sequelize.config.database,
      username: sequelize.config.username
    } as Database;
    const container = {
      image: process.env.IMAGE,
      version: process.env.VERSION,
      containerId: process.env.HOSTNAME
    } as Container;

    const response: HealthResponse = {
      server: serverInfo,
      memory: memoryInfo,
      process: processInfo,
      os: osInfo,
      database: databaseInfo,
      container,
      status: 'ok'
    };

    reply.send(response);
  } else {
    const response = { status: 'ok' };
    reply.send(response);
  }
};

const healthPath = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Get health information',
      description: 'Get health information',
      parameters: [
        {
          name: 'info',
          in: 'query',
          description: 'Get all information',
          required: false,
          schema: {
            type: 'string',
            enum: ['all', 'off']
          }
        }
      ],
      responses: resolveResponses('health', 200, {
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
      }),
      handler: healthHandler
    }
  }
};

export default healthPath;
