import { convertToPlural } from './openapi/utils';

export interface EventCallback {
  (err: any, data: any): void;
}

export interface EventsStorage {
  [key: string]: EventCallback[];
}

const eventsStorage: EventsStorage = {};

export function on(
  modelName: string,
  action: string,
  callback: EventCallback
): void {
  const event = `${convertToPlural(modelName.toLowerCase())}.${action}`;

  if (!eventsStorage[event]) {
    eventsStorage[event] = [];
  }

  eventsStorage[event].push(callback);
}

export function emit(
  modelName: string,
  action: string,
  err: any,
  data?: any
): void {
  const event = `${convertToPlural(modelName.toLowerCase())}.${action}`;

  if (eventsStorage[event]) {
    eventsStorage[event].forEach((callback) => {
      callback(err, data);
    });
  }
}

export function remove(modelName: string, action: string): void {
  const event = `${modelName}.${action}`;

  if (eventsStorage[event]) {
    delete eventsStorage[event];
  }
}
