"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getOne = exports.getAll = void 0;
var superFilter_1 = require("./superFilter");
var events_1 = require("../events");
var log_1 = require("../log");
function getAll(resource) {
    var _this = this;
    return function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var page, pageSize, searchTerm, order, orderBy, offset, searchFilter, data, totalPages, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    page = parseInt(request.query.page, 10) || 1;
                    pageSize = parseInt(request.query.page_size, 10) || 10;
                    searchTerm = request.query.search;
                    order = request.query.order || 'desc';
                    orderBy = request.query.orderBy || 'updatedAt';
                    offset = (page - 1) * pageSize;
                    searchFilter = resource.search && searchTerm
                        ? (0, superFilter_1.superFilter)(resource.search, searchTerm)
                        : {};
                    return [4 /*yield*/, resource.model.findAndCountAll({
                            where: searchFilter,
                            offset: offset,
                            limit: pageSize,
                            order: [[orderBy, order]]
                        })];
                case 1:
                    data = _a.sent();
                    totalPages = Math.ceil(data.count / pageSize);
                    reply.send({
                        data: data.rows,
                        meta: {
                            page: page,
                            pageSize: pageSize,
                            totalPages: totalPages,
                            totalItems: data.count
                        }
                    });
                    (0, events_1.emit)(resource.name, 'list', null, data.rows);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    log_1.default.error(err_1);
                    reply.status(500).send({ error: "Failed to fetch ".concat(resource.name, ".") });
                    (0, events_1.emit)(resource.name, 'list', err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
}
exports.getAll = getAll;
function getOne(resource) {
    var _this = this;
    return function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var data, values, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, resource.model.findByPk(request.params.id)];
                case 1:
                    data = _a.sent();
                    values = data === null || data === void 0 ? void 0 : data.dataValues;
                    if (!values) {
                        reply.status(404).send({ error: "".concat(resource.name, " not found.") });
                        return [2 /*return*/];
                    }
                    reply.send(data);
                    (0, events_1.emit)(resource.name, 'read', null, values.rows);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    log_1.default.error(err_2);
                    reply.status(500).send({ error: "Failed to fetch ".concat(resource.name, ".") });
                    (0, events_1.emit)(resource.name, 'read', err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
}
exports.getOne = getOne;
function create(resource) {
    var _this = this;
    return function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, resource.model.create(request.body)];
                case 1:
                    data = _a.sent();
                    reply.status(201).send(data);
                    (0, events_1.emit)(resource.name, 'create', null, data);
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    log_1.default.error(err_3);
                    reply.status(500).send({ error: "Failed to create ".concat(resource.name, ".") });
                    (0, events_1.emit)(resource.name, 'create', err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
}
exports.create = create;
function update(resource) {
    var _this = this;
    return function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var data, value, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, resource.model.findByPk(request.params.id)];
                case 1:
                    data = _a.sent();
                    value = data === null || data === void 0 ? void 0 : data.dataValues;
                    if (!value) {
                        reply.status(404).send({ error: "".concat(resource.name, " not found.") });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, data.update(request.body)];
                case 2:
                    _a.sent();
                    reply.send(data);
                    (0, events_1.emit)(resource.name, 'update', null, value.rows);
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _a.sent();
                    log_1.default.error(err_4);
                    reply.status(500).send({ error: "Failed to update ".concat(resource.name, ".") });
                    (0, events_1.emit)(resource.name, 'update', err_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
}
exports.update = update;
function remove(resource) {
    var _this = this;
    return function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var data, value, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, resource.model.findByPk(request.params.id)];
                case 1:
                    data = _a.sent();
                    value = data === null || data === void 0 ? void 0 : data.dataValues;
                    if (!data) {
                        reply.status(404).send({ error: "".concat(resource.name, " not found.") });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, data.destroy()];
                case 2:
                    _a.sent();
                    reply
                        .status(204)
                        .send({ message: "".concat(resource.name, " deleted successfully.") });
                    (0, events_1.emit)(resource.name, 'remove', null, value.rows);
                    return [3 /*break*/, 4];
                case 3:
                    err_5 = _a.sent();
                    log_1.default.error(err_5);
                    reply.status(500).send({ error: "Failed to delete ".concat(resource.name, ".") });
                    (0, events_1.emit)(resource.name, 'remove', err_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
}
exports.remove = remove;
