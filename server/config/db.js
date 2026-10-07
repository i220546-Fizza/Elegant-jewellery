const mongoose = require('mongoose');

// Hard-pin this app to its own database, regardless of what database name
// (if any) is embedded in MONGO_URI. This is what actually keeps this app's
// data isolated from other apps that might share the same MongoDB cluster -
// a cluster is just a server; two apps pointed at the same cluster but
// different dbName values still have completely separate collections, with
// no possibility of cross-reads even if someone pastes the wrong URI.
const DB_NAME = 'elegant_jewellery';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Copy server/.env.example to server/.env and configure it.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, { dbName: DB_NAME });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
