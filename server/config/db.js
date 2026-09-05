import mongoose from 'mongoose';

export const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civiclens';
  try {
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.warn(`[MongoDB Warning] Database connection failed (${err.message}). Application will continue in memory/fallback mode for offline testing.`);
  }
};
