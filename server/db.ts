import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/shop-app';

let cachedConnection: any = null;

export const connectDB = async () => {
  // Prevent multiple connections in serverless
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(MONGO_URI, {
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

    cachedConnection = connection;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
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
