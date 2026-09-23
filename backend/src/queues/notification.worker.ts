import { Worker } from 'bullmq';
import { redisConfig } from './queue.config';

export const notificationWorker = new Worker('notification', async job => {
  console.log(`[NotificationWorker] Processing job ${job.id}`);
  try {
    const { type, to, content } = job.data;
    console.log(`Sending ${type} to ${to}: ${content}`);
    // Simulate email/SMS delivery
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Notification sent to ${to}`);
  } catch (error) {
    console.error(`[NotificationWorker] Failed job ${job.id}`, error);
    throw error;
  }
}, { connection: redisConfig });
