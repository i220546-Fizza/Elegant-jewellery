const dotenv = require('dotenv');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy server/.env.example to server/.env and configure it.');
  process.exit(1);
}

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`NB Classic Scents API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
