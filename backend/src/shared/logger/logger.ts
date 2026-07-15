import winston from 'winston';

import { env } from '../../config/env.js';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const developmentFormat = combine(colorize(), timestamp(), errors({ stack: true }), simple());

const productionFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,

  format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,

  transports: [new winston.transports.Console()],

  exitOnError: false,
});
