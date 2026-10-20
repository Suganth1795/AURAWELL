import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../../src/config/database.js';

export async function connectTestDb(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI);
}

export async function cleanTestDb(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function closeTestDb(): Promise<void> {
  await disconnectDatabase();
}
