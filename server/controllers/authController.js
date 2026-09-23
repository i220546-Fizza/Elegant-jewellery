const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { sendAuthCookie, clearAuthCookie } = require('../utils/generateToken');
const { sendEmail, isEmailConfigured } = require('../utils/sendEmail');

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PASSWORD_MESSAGE = 'Password must be at least 8 characters and include a letter and a number';

const assertStrongPassword = (res, password) => {
  if (!password || !PASSWORD_RULE.test(password)) {
    res.status(400);
    throw new Error(PASSWORD_MESSAGE);
  }
};

// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, newsletter } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide your name, email and a password');
  }
  assertStrongPassword(res, password);

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, newsletter: !!newsletter });
  sendAuthCookie(res, user._id);
  res.status(201).json({ success: true, user: user.toPublic() });
});

// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide your email and password');
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Please contact us for help');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendAuthCookie(res, user._id);
  res.json({ success: true, user: user.toPublic() });
});

// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
};

// @route   GET /api/auth/me   (returns user: null for guests rather than a 401)
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user ? req.user.toPublic() : null });
});

// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const genericMessage = 'If an account exists for that email, we have sent a link to reset your password.';
  const user = email ? await User.findOne({ email }) : null;

  if (!user) {
    res.json({ success: true, message: genericMessage });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const origin = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
  const resetUrl = `${origin}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your NB Classic Scents password',
    text: `Hello ${user.name},\n\nUse the link below to choose a new password. It expires in 30 minutes.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n\nNB Classic Scents`,
    html: `<p>Hello ${user.name},</p><p>Use the link below to choose a new password. It expires in 30 minutes.</p><p><a href="${resetUrl}">Reset my password</a></p><p>If you did not request this, you can ignore this email.</p><p>NB Classic Scents</p>`,
  });

  const payload = { success: true, message: genericMessage };
  // Without an email provider (local development), hand the token back so the
  // flow can still be completed. Never do this in production.
  if (!isEmailConfigured() && process.env.NODE_ENV !== 'production') {
    payload.devResetToken = resetToken;
  }
  res.json(payload);
});

// @route   PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    res.status(400);
    throw new Error('This reset link is invalid or has expired');
  }
  assertStrongPassword(res, req.body.password);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendAuthCookie(res, user._id);
  res.json({ success: true, user: user.toPublic() });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
  assertStrongPassword,
};
