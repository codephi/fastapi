import { api } from '../../middle/serve';
import { superFiler } from './superFilter';
import { emit } from '../events';
import { Model } from 'sequelize';
import { Resource } from '../sequelize/generateResources';

const getAll = (resource: Resource) => async (request: any, reply: any) => {
  try {
    const page = parseInt(request.query.page, 10) || 1;
    const pageSize = parseInt(request.query.page_size, 10) || 10;
    const searchTerm = request.query.search;
    const order = request.query.order || 'desc';
    const orderBy = request.query.orderBy || 'updatedAt';
    const offset = (page - 1) * pageSize;

    const searchFilter =
      resource.search && searchTerm
        ? superFiler(resource.search, searchTerm)
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

    emit(resource, 'list', null, data.rows);
  } catch (err) {
    api.log.error(err);
    reply.status(500).send({ error: `Failed to fetch ${resource.name}.` });
    emit(resource.name, 'list', err);
  }
};

interface GetOneOptions {
  model: typeof Model;
}

const getOne = (resource: Resource) => async (request: any, reply: any) => {
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
    api.log.error(err);
    reply.status(500).send({ error: `Failed to fetch ${resource.name}.` });
    emit(resource.name, 'read', err);
  }
};

interface CreateOptions {
  model: typeof Model;
}

const create = (resource: Resource) => async (request: any, reply: any) => {
  try {
    const data = await resource.model.create(request.body);
    reply.send(data);
    emit(resource.name, 'create', null, data);
  } catch (err) {
    api.log.error(err);
    reply.status(500).send({ error: `Failed to create ${resource.name}.` });
    emit(resource.name, 'create', err);
  }
};

const update = (resource: Resource) => async (request: any, reply: any) => {
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
    api.log.error(err);
    reply.status(500).send({ error: `Failed to update ${resource.name}.` });
    emit(resource.name, 'update', err);
  }
};

const remove = (resource: Resource) => async (request: any, reply: any) => {
  try {
    const data = await resource.model.findByPk(request.params.id);
    const value = data?.dataValues;

    if (!data) {
      reply.status(404).send({ error: `${resource.name} not found.` });
      return;
    }

    await data.destroy();

    reply.send({ message: `${resource.name} deleted successfully.` });
    emit(resource.name, 'remove', null, value.rows);
  } catch (err) {
    api.log.error(err);
    reply.status(500).send({ error: `Failed to delete ${resource.name}.` });
    emit(resource.name, 'remove', err);
  }
};

export { getAll, getOne, create, update, remove };
