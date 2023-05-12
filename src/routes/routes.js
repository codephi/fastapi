const { Op } = require('sequelize')
const fastify = require('../middle/serve')

const getAll = (Model, resourceName) => async (request, reply) => {
  try {
    const page = parseInt(request.query.page, 10) || 1
    const pageSize = parseInt(request.query.pageSize, 10) || 10
    const searchTerm = request.query.search
    const order = request.query.order || 'desc'
    const orderBy = request.query.orderBy || 'updatedAt'
    const offset = (page - 1) * pageSize

    const searchFilter = searchTerm
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${searchTerm}%` } },
            { content: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        }
      : {}

    const data = await Model.findAndCountAll({
      where: searchFilter,
      offset,
      limit: pageSize,
      order: [[orderBy, order]]
    })

    const totalPages = Math.ceil(data.count / pageSize)

    reply.send({
      data: data.rows,
      meta: {
        page,
        pageSize,
        totalPages,
        totalItems: data.count
      }
    })
  } catch (err) {
    fastify.log.error(err)
    reply.status(500).send({ error: `Failed to fetch ${resourceName}.` })
  }
}

const getOne = (Model, resourceName) => async (request, reply) => {
  try {
    const data = await Model.findByPk(request.params.id)

    if (!data) {
      reply.status(404).send({ error: `${resourceName} not found.` })
      return
    }

    reply.send(data)
  } catch (err) {
    fastify.log.error(err)
    reply.status(500).send({ error: `Failed to fetch ${resourceName}.` })
  }
}

const create = (Model, resourceName) => async (request, reply) => {
  try {
    const data = await Model.create(request.body)

    reply.send(data)
  } catch (err) {
    fastify.log.error(err)
    reply.status(500).send({ error: `Failed to create ${resourceName}.` })
  }
}

const update = (Model, resourceName) => async (request, reply) => {
  try {
    const data = await Model.findByPk(request.params.id)

    if (!data) {
      reply.status(404).send({ error: `${resourceName} not found.` })
      return
    }

    await data.update(request.body)

    reply.send(data)
  } catch (err) {
    fastify.log.error(err)
    reply.status(500).send({ error: `Failed to update ${resourceName}.` })
  }
}

const remove = (Model, resourceName) => async (request, reply) => {
  try {
    const data = await Model.findByPk(request.params.id)

    if (!data) {
      reply.status(404).send({ error: `${resourceName} not found.` })
      return
    }

    await data.destroy()

    reply.send({ message: `${resourceName} deleted successfully.` })
  } catch (err) {
    fastify.log.error(err)
    reply.status(500).send({ error: `Failed to delete ${resourceName}.` })
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove
}
