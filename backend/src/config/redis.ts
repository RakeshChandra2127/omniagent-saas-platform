import { Redis, RedisOptions } from 'ioredis';
import { config } from './index';
import { logger } from './logger';

export const createRedisConnection = (options?: RedisOptions): Redis => {
  const defaultOptions: RedisOptions = {
    retryStrategy: (times) => {
      logger.warn(`Redis connection retrying, attempt ${times}`);
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: null,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const redis = new Redis(config.redisUrl, mergedOptions);

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  redis.on('error', (err) => {
    logger.error('Redis error:', err);
  });

  return redis;
};
