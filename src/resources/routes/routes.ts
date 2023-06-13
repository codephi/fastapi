import { superFilter } from './superFilter';
import { emit } from '../events';
import { Resource } from '../sequelize';
import log from '../log';

export type RouteHandler = (request: any, reply: any) => Promise<void> | void;

export function getAll(resource: Resource): RouteHandler {
  return async (request: any, reply: any) => {
    try {
      const page = parseInt(request.query.page, 10) || 1;
      const pageSize = parseInt(request.query.page_size, 10) || 10;
      const searchTerm = request.query.search;
      const order = request.query.order || 'desc';
      const orderBy = request.query.orderBy || 'updatedAt';
      const offset = (page - 1) * pageSize;

      const searchFilter =
        resource.search && searchTerm
          ? superFilter(resource.search, searchTerm)
          : {};

      const data = await resource.model.findAndCountAll({
        where: searchFilter,
        offset,
        limit: pageSize,
        order: [[orderBy, order]]
      });

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

      emit(resource.name, 'list', null, data.rows);
    } catch (err) {
      log.error(err);
      reply.status(500).send({ error: `Failed to fetch ${resource.name}.` });
      emit(resource.name, 'list', err);
    }
  };
}

export function getOne(resource: Resource): RouteHandler {
  return async (request: any, reply: any) => {
    try {
      const data = await resource.model.findByPk(request.params.id);
      const values = data?.dataValues;

      if (!values) {
        reply.status(404).send({ error: `${resource.name} not found.` });
        return;
      }

      reply.send(data);
      emit(resource.name, 'read', null, values.rows);
    } catch (err) {
      log.error(err);
      reply.status(500).send({ error: `Failed to fetch ${resource.name}.` });
      emit(resource.name, 'read', err);
    }
  };
}

export function create(resource: Resource): RouteHandler {
  return async (request: any, reply: any) => {
    try {
      const data = await resource.model.create(request.body);
      reply.status(201).send(data);
      emit(resource.name, 'create', null, data);
    } catch (err) {
      log.error(err);
      reply.status(500).send({ error: `Failed to create ${resource.name}.` });
      emit(resource.name, 'create', err);
    }
  };
}

export function update(resource: Resource): RouteHandler {
  return async (request: any, reply: any) => {
    try {
      const data = await resource.model.findByPk(request.params.id);
      const value = data?.dataValues;

      if (!value) {
        reply.status(404).send({ error: `${resource.name} not found.` });
        return;
      }

      await data.update(request.body);

      reply.send(data);
      emit(resource.name, 'update', null, value.rows);
    } catch (err) {
      log.error(err);
      reply.status(500).send({ error: `Failed to update ${resource.name}.` });
      emit(resource.name, 'update', err);
    }
  };
}

export function remove(resource: Resource): RouteHandler {
  return async (request: any, reply: any) => {
    try {
      const data = await resource.model.findByPk(request.params.id);
      const value = data?.dataValues;

      if (!data) {
        reply.status(404).send({ error: `${resource.name} not found.` });
        return;
      }

      await data.destroy();

      reply
        .status(204)
        .send({ message: `${resource.name} deleted successfully.` });
      emit(resource.name, 'remove', null, value.rows);
    } catch (err) {
      log.error(err);
      reply.status(500).send({ error: `Failed to delete ${resource.name}.` });
      emit(resource.name, 'remove', err);
    }
  };
}
