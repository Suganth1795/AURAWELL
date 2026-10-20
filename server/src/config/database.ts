import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDatabase(uri = env.MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(uri, { autoIndex: true });
  logger.info({ db: connection.connection.name }, 'Connected to MongoDB');
  return connection;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
