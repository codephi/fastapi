const fastify = require('../../middle/serve');
const { superFiler } = require('../superFilter');
const { emit } = require('../events');

const getAll =
  ({ model, metadata }) =>
  async (request, reply) => {
    try {
      const page = parseInt(request.query.page, 10) || 1;
      const pageSize = parseInt(request.query.page_size, 10) || 10;
      const searchTerm = request.query.search;
      const order = request.query.order || 'desc';
      const orderBy = request.query.orderBy || 'updatedAt';
      const offset = (page - 1) * pageSize;

      const searchFilter =
        metadata && metadata.search && searchTerm
          ? superFiler(metadata.search, searchTerm)
          : {};

      const findOptions = {
        where: searchFilter,
        offset,
        limit: pageSize,
        order: [[orderBy, order]]
      };

      const data = await model.findAndCountAll(findOptions);

      if (findOptions.include !== undefined && data.rows.length > 0) {
        data.rows = data.rows.map((row) => {
          for (const relationship of metadata.relationships) {
            const relationshipName = relationship.model.name.toLowerCase();
            row[relationshipName] = row[relationship.model.name];
            delete row[relationship.model.name];

            return row;
          }
        });
      }

      const totalPages = Math.ceil(data.count / pageSize);

      reply.send({
        data: data.rows,
        meta: {
          page,
          pageSize,
          totalPages,
          totalItems: data.count
        }
      });

      emit(model.name, 'getAll', null, data.rows);
    } catch (err) {
      emit(model.name, 'getAll', err);
      fastify.log.error(err);
      reply.status(500).send({ error: `Failed to fetch ${model.name}.` });
    }
  };

const getOne =
  ({ model }) =>
  async (request, reply) => {
    try {
      const data = await model.findByPk(request.params.id);

      if (!data) {
        reply.status(404).send({ error: `${model.name} not found.` });
        return;
      }

      reply.send(data);
      emit(model.name, 'getOne', null, data.rows);
    } catch (err) {
      emit(model.name, 'getOne', err);
      fastify.log.error(err);
      reply.status(500).send({ error: `Failed to fetch ${model.name}.` });
    }
  };

const create =
  ({ model }) =>
  async (request, reply) => {
    try {
      const data = await model.create(request.body);

      reply.send(data);
      emit(model.name, 'create', null, data.rows);
    } catch (err) {
      emit(model.name, 'create', err);
      fastify.log.error(err);
      reply.status(500).send({ error: `Failed to create ${model.name}.` });
    }
  };

const update =
  ({ model }) =>
  async (request, reply) => {
    try {
      const data = await model.findByPk(request.params.id);

      if (!data) {
        reply.status(404).send({ error: `${model.name} not found.` });
        return;
      }

      await data.update(request.body);

      reply.send(data);
      emit(model.name, 'update', null, data.rows);
    } catch (err) {
      emit(model.name, 'update', err);
      fastify.log.error(err);
      reply.status(500).send({ error: `Failed to update ${model.name}.` });
    }
  };

const remove =
  ({ model }) =>
  async (request, reply) => {
    try {
      const data = await model.findByPk(request.params.id);

      if (!data) {
        reply.status(404).send({ error: `${model.name} not found.` });
        return;
      }

      await data.destroy();

      reply.send({ message: `${model.name} deleted successfully.` });
      emit(model.name, 'remove', null, data.rows);
    } catch (err) {
      emit(model.name, 'remove', err);
      fastify.log.error(err);
      reply.status(500).send({ error: `Failed to delete ${model.name}.` });
    }
  };

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove
};
