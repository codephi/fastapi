"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    on: function() {
        return on;
    },
    emit: function() {
        return emit;
    },
    remove: function() {
        return remove;
    }
});
const _utils = require("./openapi/utils");
const eventsStorage = {};
function on(modelName, action, callback) {
    const event = `${(0, _utils.convertToPlural)(modelName.toLowerCase())}.${action}`;
    if (!eventsStorage[event]) {
        eventsStorage[event] = [];
    }
    eventsStorage[event].push(callback);
}
function emit(modelName, action, err, data) {
    const event = `${(0, _utils.convertToPlural)(modelName.toLowerCase())}.${action}`;
    if (eventsStorage[event]) {
        eventsStorage[event].forEach((callback)=>{
            callback(err, data);
        });
    }
}
function remove(modelName, action) {
    const event = `${modelName}.${action}`;
    if (eventsStorage[event]) {
        delete eventsStorage[event];
    }
}
{
        delete eventsStorage[event];
    }
}
