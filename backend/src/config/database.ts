import mongoose from 'mongoose';
import { config } from './index';
import { logger } from './logger';

export const connectDatabase = async (): Promise<void> => {
  const connect = async () => {
    try {
      await mongoose.connect(config.mongodbUri);
    } catch (error) {
      logger.error('Error connecting to database. Retrying in 5 seconds...', error);
      setTimeout(connect, 5000);
    }
  };

  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose disconnected');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('Mongoose disconnected on app termination');
    process.exit(0);
  });

  await connect();
};
