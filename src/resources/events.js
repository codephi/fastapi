const eventsStorage = {};

const on = (modelName, action, callback) => {
  const event = `${modelName}.${action}`;

  if (!eventsStorage[event]) {
    eventsStorage[event] = [];
  }

  eventsStorage[event].push(callback);
};

const emit = (modelName, action, data) => {
  const event = `${modelName}.${action}`;

  if (eventsStorage[event]) {
    eventsStorage[event].forEach((callback) => {
      callback(data);
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
