function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return(g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g);
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
import { superFiler } from "./superFilter";
import { emit } from "../events";
import log from "../log";
export function getAll(resource) {
    return function() {
        var _ref = _async_to_generator(function(request, reply) {
            var page, pageSize, searchTerm, order, orderBy, offset, searchFilter, data, totalPages, err;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _state.trys.push([
                            0,
                            2,
                            ,
                            3
                        ]);
                        page = parseInt(request.query.page, 10) || 1;
                        pageSize = parseInt(request.query.page_size, 10) || 10;
                        searchTerm = request.query.search;
                        order = request.query.order || "desc";
                        orderBy = request.query.orderBy || "updatedAt";
                        offset = (page - 1) * pageSize;
                        searchFilter = resource.search && searchTerm ? superFiler(resource.search, searchTerm) : {};
                        return [
                            4,
                            resource.model.findAndCountAll({
                                where: searchFilter,
                                offset: offset,
                                limit: pageSize,
                                order: [
                                    [
                                        orderBy,
                                        order
                                    ]
                                ]
                            })
                        ];
                    case 1:
                        data = _state.sent();
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
                        emit(resource.name, "list", null, data.rows);
                        return [
                            3,
                            3
                        ];
                    case 2:
                        err = _state.sent();
                        log.error(err);
                        reply.status(500).send({
                            error: "Failed to fetch ".concat(resource.name, ".")
                        });
                        emit(resource.name, "list", err);
                        return [
                            3,
                            3
                        ];
                    case 3:
                        return [
                            2
                        ];
                }
            });
        });
        return function(request, reply) {
            return _ref.apply(this, arguments);
        };
    }();
}
export function getOne(resource) {
    return function() {
        var _ref = _async_to_generator(function(request, reply) {
            var _data, data, values, err;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _state.trys.push([
                            0,
                            2,
                            ,
                            3
                        ]);
                        return [
                            4,
                            resource.model.findByPk(request.params.id)
                        ];
                    case 1:
                        data = _state.sent();
                        values = (_data = data) === null || _data === void 0 ? void 0 : _data.dataValues;
                        if (!values) {
                            reply.status(404).send({
                                error: "".concat(resource.name, " not found.")
                            });
                            return [
                                2
                            ];
                        }
                        reply.send(data);
                        emit(resource.name, "read", null, values.rows);
                        return [
                            3,
                            3
                        ];
                    case 2:
                        err = _state.sent();
                        log.error(err);
                        reply.status(500).send({
                            error: "Failed to fetch ".concat(resource.name, ".")
                        });
                        emit(resource.name, "read", err);
                        return [
                            3,
                            3
                        ];
                    case 3:
                        return [
                            2
                        ];
                }
            });
        });
        return function(request, reply) {
            return _ref.apply(this, arguments);
        };
    }();
}
export function create(resource) {
    return function() {
        var _ref = _async_to_generator(function(request, reply) {
            var data, err;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _state.trys.push([
                            0,
                            2,
                            ,
                            3
                        ]);
                        return [
                            4,
                            resource.model.create(request.body)
                        ];
                    case 1:
                        data = _state.sent();
                        reply.status(201).send(data);
                        emit(resource.name, "create", null, data);
                        return [
                            3,
                            3
                        ];
                    case 2:
                        err = _state.sent();
                        log.error(err);
                        reply.status(500).send({
                            error: "Failed to create ".concat(resource.name, ".")
                        });
                        emit(resource.name, "create", err);
                        return [
                            3,
                            3
                        ];
                    case 3:
                        return [
                            2
                        ];
                }
            });
        });
        return function(request, reply) {
            return _ref.apply(this, arguments);
        };
    }();
}
export function update(resource) {
    return function() {
        var _ref = _async_to_generator(function(request, reply) {
            var _data, data, value, err;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _state.trys.push([
                            0,
                            3,
                            ,
                            4
                        ]);
                        return [
                            4,
                            resource.model.findByPk(request.params.id)
                        ];
                    case 1:
                        data = _state.sent();
                        value = (_data = data) === null || _data === void 0 ? void 0 : _data.dataValues;
                        if (!value) {
                            reply.status(404).send({
                                error: "".concat(resource.name, " not found.")
                            });
                            return [
                                2
                            ];
                        }
                        return [
                            4,
                            data.update(request.body)
                        ];
                    case 2:
                        _state.sent();
                        reply.send(data);
                        emit(resource.name, "update", null, value.rows);
                        return [
                            3,
                            4
                        ];
                    case 3:
                        err = _state.sent();
                        log.error(err);
                        reply.status(500).send({
                            error: "Failed to update ".concat(resource.name, ".")
                        });
                        emit(resource.name, "update", err);
                        return [
                            3,
                            4
                        ];
                    case 4:
                        return [
                            2
                        ];
                }
            });
        });
        return function(request, reply) {
            return _ref.apply(this, arguments);
        };
    }();
}
export function remove(resource) {
    return function() {
        var _ref = _async_to_generator(function(request, reply) {
            var _data, data, value, err;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _state.trys.push([
                            0,
                            3,
                            ,
                            4
                        ]);
                        return [
                            4,
                            resource.model.findByPk(request.params.id)
                        ];
                    case 1:
                        data = _state.sent();
                        value = (_data = data) === null || _data === void 0 ? void 0 : _data.dataValues;
                        if (!data) {
                            reply.status(404).send({
                                error: "".concat(resource.name, " not found.")
                            });
                            return [
                                2
                            ];
                        }
                        return [
                            4,
                            data.destroy()
                        ];
                    case 2:
                        _state.sent();
                        reply.status(204).send({
                            message: "".concat(resource.name, " deleted successfully.")
                        });
                        emit(resource.name, "remove", null, value.rows);
                        return [
                            3,
                            4
                        ];
                    case 3:
                        err = _state.sent();
                        log.error(err);
                        reply.status(500).send({
                            error: "Failed to delete ".concat(resource.name, ".")
                        });
                        emit(resource.name, "remove", err);
                        return [
                            3,
                            4
                        ];
                    case 4:
                        return [
                            2
                        ];
                }
            });
        });
        return function(request, reply) {
            return _ref.apply(this, arguments);
        };
    }();
}
