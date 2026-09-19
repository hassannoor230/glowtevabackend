import mongoose, { ConnectOptions } from 'mongoose';
import { config } from './config/index.js';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

export class DatabaseConnectionError extends Error {
  constructor(message = 'Database connection error', readonly cause?: unknown) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

const sanitizeLogValue = (value: string) =>
  value.replace(/mongodb(?:\+srv)?:\/\/[^\s)]+/gi, 'mongodb://[redacted]');

const getErrorDetails = (error: unknown) => ({
  name: error instanceof Error ? error.name : typeof error,
  message: error instanceof Error ? sanitizeLogValue(error.message) : 'Unknown database connection error',
});

const connectionOptions: ConnectOptions = {
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 30_000,
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
  retryWrites: true,
  w: 'majority',
};

const cached = globalThis.mongooseCache ?? { conn: null, promise: null };
globalThis.mongooseCache = cached;

mongoose.set('strictQuery', true);

export const connectDatabase = async (): Promise<typeof mongoose> => {
  const uri = config.mongodbUri?.trim();

  if (!uri) {
    throw new DatabaseConnectionError('MONGODB_URI is required');
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new DatabaseConnectionError('MONGODB_URI must use mongodb:// or mongodb+srv://');
  }

  if (cached.conn?.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, connectionOptions)
      .then((connection) => {
        cached.conn = connection;
        return connection;
      })
      .catch((error: unknown) => {
        cached.promise = null;
        console.error('MongoDB connection failed:', getErrorDetails(error));
        throw new DatabaseConnectionError(undefined, error);
      });
  }

  return cached.promise;
};

export const pingDatabase = async (): Promise<boolean> => {
  const connection = await connectDatabase();
  const result = await connection.connection.db?.admin().ping();

  if (!result || result.ok !== 1) {
    throw new DatabaseConnectionError();
  }

  return true;
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  cached.conn = null;
  cached.promise = null;
};
