const { resolvePlural } = require('./openapi/utils');
const eventsStorage = {};

const on = (modelName, action, callback) => {
  const event = `${resolvePlural(modelName.toLowerCase())}.${action}`;

  if (!eventsStorage[event]) {
    eventsStorage[event] = [];
  }

  eventsStorage[event].push(callback);
};

const emit = (modelName, action, err, data) => {
  const event = `${resolvePlural(modelName.toLowerCase())}.${action}`;

  if (eventsStorage[event]) {
    eventsStorage[event].forEach((callback) => {
      callback(err, data);
    });
  }
};

const remove = (modelName, action) => {
  const event = `${modelName}.${action}`;

  if (eventsStorage[event]) {
    delete eventsStorage[event];
  }
};

module.exports = {
  on,
  emit,
  remove
};
