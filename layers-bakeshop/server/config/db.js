import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MONGO_URI is not set. Copy server/.env.example to server/.env and set your MongoDB connection string.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('Check that MONGO_URI in server/.env is correct and that your IP is allow-listed (MongoDB Atlas) or mongod is running (local install).');
    process.exit(1);
  }
}
