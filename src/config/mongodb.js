import mongoose from 'mongoose';
import env from '~/config/environment.js';

export const CONNECT_DB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME,
      autoIndex: true
    });

    console.log('MongoDB connected (Mongoose)');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export const CLOSE_DB = async () => {
  await mongoose.connection.close();
  console.log('MongoDB disconnected');
};
