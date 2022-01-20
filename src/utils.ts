
import { logger } from './logger';

declare global {
  interface Array<T> {
    firstOrDefault(func?: any): T | null;
  }
}

Array.prototype.firstOrDefault = function (func?) {
  if (this.length == 0) {
    return null;
  }//from  ww w .  j  av  a2 s .c o  m
  if (func == undefined || func == null) {
    return this[0];
  }
  this.forEach(element => {
    if (func.call(this)) {
      return element;
    }
  });
  return null;
};

// Callbacks
export const loggingCallback = (callback: (e: Error, m: string) => void, error: Error, message: string) => {
  error && logger['error'](error);
  typeof callback === 'function' && callback(error, message);
};

export const messageCallback = (callback: (e: Error, m: string) => void, error: Error, message: string) =>
  callback && callback(error, message);

export const customCallback = (callback: (e: Error, m: string) => void, custom: string, error: Error) => {
  typeof callback === 'function' && callback(error, custom);
};

// Transforms
export const stringToObject = (data: any) => {
  return typeof data === 'string' ? JSON.parse(data) : data;
};

export const objectToString = (data: any) => {
  return typeof data === 'object' ? JSON.stringify(data) : data;
};

export const zeroIfNaN = (data: any) => {
  const intdata = parseInt(data);
  return isNaN(intdata) ? 0 : intdata;
};

export const defaultIfNotFunction = (data: any, def: any) => {
  return typeof data === 'function' ? data : def;
};

export const nopIfNotFunction = (data: any) => {
  return defaultIfNotFunction(data, () => undefined);
};

export const addOne = (data: any) => {
  return data !== undefined ? zeroIfNaN(data) + 1 : 1;
};

export const debug = (func: any, label: string) => (...args: any) => {
  /* eslint-disable no-console */
  console.log('calling ' + (label || func.name) + ' with arguments:');
  console.log(args);
  /* eslint-enable no-console */
  return func.apply(this, args);
};

export const isoDateToTimestamp = (dt?: string) => {
  return dt ? (new Date(dt)).getTime() : 0;
};
