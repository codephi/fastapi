"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.emit = exports.on = void 0;
var utils_1 = require("./openapi/utils");
var eventsStorage = {};
function on(modelName, action, callback) {
    var event = "".concat((0, utils_1.convertToPlural)(modelName.toLowerCase()), ".").concat(action);
    if (!eventsStorage[event]) {
        eventsStorage[event] = [];
    }
    eventsStorage[event].push(callback);
}
exports.on = on;
function emit(modelName, action, err, data) {
    var event = "".concat((0, utils_1.convertToPlural)(modelName.toLowerCase()), ".").concat(action);
    if (eventsStorage[event]) {
        eventsStorage[event].forEach(function (callback) {
            callback(err, data);
        });
    }
}
exports.emit = emit;
function remove(modelName, action) {
    var event = "".concat(modelName, ".").concat(action);
    if (eventsStorage[event]) {
        delete eventsStorage[event];
    }
}
exports.remove = remove;
