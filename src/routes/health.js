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
        parameters: [
          {
            name: 'info',
            in: 'query',
            description: 'Get all information',
            required: false,
            schema: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            style: 'form',
            explode: true,
            collectionFormat: 'csv',
            default: [
              'all',
              'status',
              'memory',
              'process',
              'os',
              'container',
              'database'
            ]
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

    if (info === undefined) {
      reply.send({ status: 'ok' })
    } else if (info === 'all') {
      reply.send({
        memory: getMemoryInfo(),
        process: getProcessInfo(),
        os: getOsInfo(),
        database: getDatabaseInfo(),
        container: getContainerInfo(),
        app: getAppInfo(),
        status: 'ok'
      })
    } else {
      const response = { status: 'ok' }

      info.forEach(element => {
        switch (element) {
          case 'memory':
            response.memory = getMemoryInfo()
            break
          case 'process':
            response.process = getProcessInfo()
            break
          case 'os':
            response.os = getOsInfo()
            break
          case 'database':
            response.database = getDatabaseInfo()
            break
          case 'container':
            response.container = getContainerInfo()
            break
          case 'app':
            response.app = getAppInfo()
            break
          case 'all':
            response.memory = getMemoryInfo()
            response.process = getProcessInfo()
            response.os = getOsInfo()
            response.database = getDatabaseInfo()
            response.container = getContainerInfo()
            response.app = getAppInfo()
            break
        }
      })

      reply.send(response)
    }
  }
}

const getMemoryInfo = () => {
  const total = os.totalmem()
  const free = os.freemem()
  const used = total - free
  const active = total - free
  const available = total - free

  return {
    total,
    free,
    used,
    active,
    available
  }
}

const getProcessInfo = () => {
  const pid = process.pid
  const uptime = process.uptime()
  const versions = process.versions
  const memoryUsage = process.memoryUsage()

  return {
    pid,
    uptime,
    versions,
    memoryUsage
  }
}

const getOsInfo = () => {
  const hostname = os.hostname()
  const type = os.type()
  const platform = os.platform()
  const release = os.release()
  const arch = os.arch()
  const uptime = os.uptime()
  const cpus = os.cpus().length

  return {
    hostname,
    type,
    platform,
    release,
    arch,
    uptime,
    cpus
  }
}

const getDatabaseInfo = () => {
  const dialect = sequelize.getDialect()
  const host = sequelize.config.host
  const port = sequelize.config.port
  const database = sequelize.config.database
  const username = sequelize.config.username

  return {
    dialect,
    host,
    port,
    database,
    username
  }
}

const getContainerInfo = () => {
  const image = process.env.IMAGE
  const version = process.env.VERSION
  const containerId = process.env.HOSTNAME

  return {
    image,
    version,
    containerId
  }
}

const getAppInfo = () => {
  const image = process.env.NAME
  const version = process.env.VERSION

  return {
    image,
    version
  }
}
