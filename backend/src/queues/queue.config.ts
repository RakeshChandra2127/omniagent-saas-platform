import { Queue } from 'bullmq';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
};

export const webhookQueue = new Queue('webhook-processing', { connection: redisConfig });
export const messageQueue = new Queue('message-processing', { connection: redisConfig });
export const notificationQueue = new Queue('notification', { connection: redisConfig });
