import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/omniagent',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'supersecretkey_change_me_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  logLevel: process.env.LOG_LEVEL || 'info',
};
