const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    // The storefront loads Google Fonts and renders WebGL; the SPA is served
    // from this origin so a tailored CSP is defined below instead of the default.
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'wasm-unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
        'connect-src': ["'self'", 'blob:', 'data:', 'https://res.cloudinary.com', 'https://www.gstatic.com'],
        'worker-src': ["'self'", 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '30d', immutable: false }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'NB Classic Scents API is running' }));

app.use('/api', apiLimiter);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// If the frontend has been built (client/dist), serve it from this same server
// so the deployed site is a single origin (the auth cookie then just works).
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use('/assets', express.static(path.join(clientDistPath, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(clientDistPath, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
