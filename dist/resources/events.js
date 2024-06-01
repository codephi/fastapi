"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.emit = exports.on = void 0;
const utils_1 = require("./openapi/utils");
const eventsStorage = {};
function on(modelName, action, callback) {
    const event = `${(0, utils_1.convertToPlural)(modelName.toLowerCase())}.${action}`;
    if (!eventsStorage[event]) {
        eventsStorage[event] = [];
    }
    eventsStorage[event].push(callback);
}
exports.on = on;
function emit(modelName, action, err, data) {
    const event = `${(0, utils_1.convertToPlural)(modelName.toLowerCase())}.${action}`;
    if (eventsStorage[event]) {
        eventsStorage[event].forEach((callback) => {
            callback(err, data);
        });
    }
}
exports.emit = emit;
function remove(modelName, action) {
    const event = `${modelName}.${action}`;
    if (eventsStorage[event]) {
        delete eventsStorage[event];
    }
}
exports.remove = remove;
