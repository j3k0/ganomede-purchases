'use strict';

import util from 'util';
const bunyan = require('bunyan');
const pkg = require('./package.json');

const parseLogLevel = (envValue) => {
  const defaultLevel = 'INFO';
  const desiredLevel = envValue ? String(envValue).toUpperCase() : defaultLevel;
  const levels = [
    'FATAL',
    'ERROR',
    'WARN',
    'INFO',
    'DEBUG',
    'TRACE'
  ];

  const hasMatch = levels.includes(desiredLevel);
  const level = hasMatch ? desiredLevel : defaultLevel;

  if (!hasMatch) {
    const available = `Please specify one of ${util.inspect(levels)}.`;
    const message = `Uknown log level "${desiredLevel}". ${available}`;
    throw new Error(message);
  }

  return bunyan[level];
};

const parseApiSecret = () => {
  const valid = process.env.hasOwnProperty('FOVEA_BILLING_SECRET_KEY')
    && (typeof process.env.FOVEA_BILLING_SECRET_KEY === 'string')
    && (process.env.FOVEA_BILLING_SECRET_KEY.length > 0);

  if (!valid)
    throw new Error('FOVEA_BILLING_SECRET_KEY must be non-empty string');

  return process.env.FOVEA_BILLING_SECRET_KEY;
};

export const config = {
  name: 'purchases',
  logLevel: parseLogLevel(process.env.LOG_LEVEL),
  secret: parseApiSecret(),

  purchasesRedisPrefixKey: 'purchases:fovea:user:',

  http: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.hasOwnProperty('PORT')
      ? parseInt(process.env.PORT!, 10)
      : 8000,
    prefix: `/${pkg.api}`
  },

  redisPurchases: {
    host: process.env.REDIS_PURCHASES_PORT_6379_TCP_ADDR || 'localhost',
    port: +(process.env.REDIS_PURCHASES_PORT_6379_TCP_PORT || '6379'),
    ttl: process.env.REDIS_PURCHASES_TTL || 3
  },

  redisAuth: {
    host: process.env.REDIS_AUTH_PORT_6379_TCP_ADDR || 'localhost',
    port: +(process.env.REDIS_AUTH_PORT_6379_TCP_PORT || '6379'),
  }
};
