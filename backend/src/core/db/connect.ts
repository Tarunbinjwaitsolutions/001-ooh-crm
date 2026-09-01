import mongoose from 'mongoose';

import { config } from '../../config/index.js';

/**
 * Connect to MongoDB. Run Mongo as a single-node replica set locally — multi-document
 * transactions (payments, bookings, payroll) do not work on a standalone `mongod`.
 * See the README for the one-time `rs.initiate()` setup.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
    retryWrites: false,
  });

  console.log(`[db] connected to ${connection.connection.name}`);
  return connection;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('[db] disconnected');
}
