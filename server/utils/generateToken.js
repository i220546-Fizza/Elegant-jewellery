const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// The JWT lives in an httpOnly cookie so page scripts can never read it (XSS),
// and SameSite=Lax keeps it off cross-site form posts (CSRF).
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

const sendAuthCookie = (res, userId) => {
  res.cookie('token', generateToken(userId), { ...cookieOptions(), maxAge: COOKIE_MAX_AGE });
};

const clearAuthCookie = (res) => {
  res.clearCookie('token', cookieOptions());
};

module.exports = { generateToken, sendAuthCookie, clearAuthCookie };
