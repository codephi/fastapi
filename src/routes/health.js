const os = require('os')
const { sequelize } = require('../middle/database')
const { resolveResponses } = require('../engine/openapi/responses')

module.exports = {
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Get health information',
        description: 'Get health information',
        operationId: 'getHealth',
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
        })
      }
    }
  },
  handler: (request, reply) => {
    const { info } = request.query

    if (info === 'all') {
      const serverInfo = {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        uptime: os.uptime(),
        cpus: os.cpus().length
      }
      const memoryInfo = {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        active: os.totalmem() - os.freemem(),
        available: os.totalmem() - os.freemem()
      }
      const processInfo = {
        pid: process.pid,
        uptime: process.uptime(),
        versions: process.versions,
        memoryUsage: process.memoryUsage()
      }
      const osInfo = {
        hostname: os.hostname(),
        type: os.type(),
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        uptime: os.uptime(),
        cpus: os.cpus().length
      }
      const databaseInfo = {
        dialect: sequelize.getDialect(),
        host: sequelize.config.host,
        port: sequelize.config.port,
        database: sequelize.config.database,
        username: sequelize.config.username
      }
      const container = {
        image: process.env.IMAGE,
        version: process.env.VERSION,
        containerId: process.env.HOSTNAME
      }

      reply.send({
        server: serverInfo,
        memory: memoryInfo,
        process: processInfo,
        os: osInfo,
        database: databaseInfo,
        container,
        status: 'ok'
      })
    } else {
      reply.send({ status: 'ok' })
    }
  }
}
