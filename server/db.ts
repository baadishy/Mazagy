import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/shop-app';

let cachedConnection: any = null;
let cachedConnectionPromise: Promise<any> | null = null;

export const connectDB = async () => {
  // Reuse active connection in warm serverless instances
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // Reuse in-flight connection promise to prevent race conditions
  if (cachedConnectionPromise) {
    return cachedConnectionPromise;
  }

  try {
    cachedConnectionPromise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,     // 5 seconds
      socketTimeoutMS: 45000,              // 45 seconds
      maxPoolSize: 10,                     // Connection pool
      minPoolSize: 2,
      maxIdleTimeMS: 60000,               // Close idle connections
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000,
      family: 4,                          // Force IPv4
    });

    const connection = await cachedConnectionPromise;
    cachedConnection = connection;
    cachedConnectionPromise = null;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    cachedConnectionPromise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (cachedConnection) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
});
