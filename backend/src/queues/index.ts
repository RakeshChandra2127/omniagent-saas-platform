import { webhookWorker } from './webhook.worker';
import { notificationWorker } from './notification.worker';

export const startWorkers = () => {
  console.log('Starting Queue Workers...');
  // Workers are instantiated and running upon import
};

export const stopWorkers = async () => {
  console.log('Stopping Queue Workers...');
  await Promise.all([
    webhookWorker.close(),
    notificationWorker.close()
  ]);
};
