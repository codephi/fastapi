"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getOne = exports.getAll = void 0;
const superFilter_1 = require("./superFilter");
const events_1 = require("../events");
const log_1 = __importDefault(require("../log"));
function getAll(resource) {
    return async (request, reply) => {
        try {
            const page = parseInt(request.query.page, 10) || 1;
            const pageSize = parseInt(request.query.page_size, 10) || 10;
            const searchTerm = request.query.search;
            const order = request.query.order || 'desc';
            const orderBy = request.query.orderBy || 'updatedAt';
            const offset = (page - 1) * pageSize;
            const searchFilter = resource.search && searchTerm
                ? (0, superFilter_1.superFilter)(resource.search, searchTerm)
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
            (0, events_1.emit)(resource.name, 'list', null, data.rows);
        }
        catch (err) {
            log_1.default.error(err);
            reply.status(500).send({ error: `Failed to fetch ${resource.name}.` });
            (0, events_1.emit)(resource.name, 'list', err);
        }
    };
}
exports.getAll = getAll;
function getOne(resource) {
    return async (request, reply) => {
        try {
            const data = await resource.model.findByPk(request.params.id);
            const values = data?.dataValues;
            if (!values) {
                reply.status(404).send({ error: `${resource.name} not found.` });
                return;
            }
            reply.send(data);
            (0, events_1.emit)(resource.name, 'read', null, values.rows);
        }
        catch (err) {
            log_1.default.error(err);
            reply.status(500).send({ error: `Failed to fetch ${resource.name}.` });
            (0, events_1.emit)(resource.name, 'read', err);
        }
    };
}
exports.getOne = getOne;
function create(resource) {
    return async (request, reply) => {
        try {
            const data = await resource.model.create(request.body);
            reply.status(201).send(data);
            (0, events_1.emit)(resource.name, 'create', null, data);
        }
        catch (err) {
            log_1.default.error(err);
            reply.status(500).send({ error: `Failed to create ${resource.name}.` });
            (0, events_1.emit)(resource.name, 'create', err);
        }
    };
}
exports.create = create;
function update(resource) {
    return async (request, reply) => {
        try {
            const data = await resource.model.findByPk(request.params.id);
            const value = data?.dataValues;
            if (!value) {
                reply.status(404).send({ error: `${resource.name} not found.` });
                return;
            }
            await data.update(request.body);
            reply.send(data);
            (0, events_1.emit)(resource.name, 'update', null, value.rows);
        }
        catch (err) {
            log_1.default.error(err);
            reply.status(500).send({ error: `Failed to update ${resource.name}.` });
            (0, events_1.emit)(resource.name, 'update', err);
        }
    };
}
exports.update = update;
function remove(resource) {
    return async (request, reply) => {
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
            (0, events_1.emit)(resource.name, 'remove', null, value.rows);
        }
        catch (err) {
            log_1.default.error(err);
            reply.status(500).send({ error: `Failed to delete ${resource.name}.` });
            (0, events_1.emit)(resource.name, 'remove', err);
        }
    };
}
exports.remove = remove;
