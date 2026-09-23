import winston from 'winston';
import { config } from './index';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return `${timestamp} ${level}: ${stack || message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

export const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp(),
    config.nodeEnv === 'production' ? json() : combine(colorize(), logFormat)
  ),
  defaultMeta: { service: 'omniagent-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});
