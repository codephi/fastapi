import { convertToPlural } from "./openapi/utils";
var eventsStorage = {};
export function on(modelName, action, callback) {
    var event = "".concat(convertToPlural(modelName.toLowerCase()), ".").concat(action);
    if (!eventsStorage[event]) {
        eventsStorage[event] = [];
    }
    eventsStorage[event].push(callback);
}
export function emit(modelName, action, err, data) {
    var event = "".concat(convertToPlural(modelName.toLowerCase()), ".").concat(action);
    if (eventsStorage[event]) {
        eventsStorage[event].forEach(function(callback) {
            callback(err, data);
        });
    }
}
export function remove(modelName, action) {
    var event = "".concat(modelName, ".").concat(action);
    if (eventsStorage[event]) {
        delete eventsStorage[event];
    }
}
