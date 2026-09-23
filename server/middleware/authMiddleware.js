const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
};

const resolveUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('+tokenVersion');
  if (!user || !user.isActive) return null;
  // Sessions issued before the latest password change are no longer valid.
  if ((decoded.v || 0) !== (user.tokenVersion || 0)) return null;
  return user;
};

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401);
    throw new Error('Please sign in to continue');
  }

  let user = null;
  try {
    user = await resolveUser(token);
  } catch {
    user = null;
  }
  if (!user) {
    res.status(401);
    throw new Error('Your session has expired. Please sign in again');
  }
  req.user = user;
  next();
});

// Attaches req.user when a valid token is present, but never blocks (guest checkout, etc).
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = (await resolveUser(token)) || undefined;
    } catch {
      req.user = undefined;
    }
  }
  next();
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, optionalAuth, admin };
