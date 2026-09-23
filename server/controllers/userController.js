const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const { assertStrongPassword } = require('./authController');
const { sendAuthCookie } = require('../utils/generateToken');

// @route   PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.name !== undefined) user.name = String(req.body.name).trim() || user.name;
  if (req.body.phone !== undefined) user.phone = String(req.body.phone).trim();
  if (req.body.newsletter !== undefined) user.newsletter = !!req.body.newsletter;
  await user.save();
  res.json({ success: true, user: user.toPublic() });
});

// @route   PUT /api/users/password   body: { currentPassword, newPassword }
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!currentPassword || !(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Your current password is incorrect');
  }
  assertStrongPassword(res, newPassword);
  user.password = newPassword;
  await user.save();
  // Issue a fresh cookie - tokens issued before the change are now invalid.
  sendAuthCookie(res, user._id);
  res.json({ success: true, message: 'Password updated' });
});

const ADDRESS_FIELDS = ['label', 'fullName', 'phone', 'address', 'city', 'postalCode', 'country', 'isDefault'];
const pickAddress = (body) => Object.fromEntries(ADDRESS_FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

const normaliseDefault = (user, preferredId) => {
  if (!user.addresses.length) return;
  const target = preferredId || (user.addresses.find((a) => a.isDefault) || user.addresses[0])._id;
  user.addresses.forEach((a) => {
    a.isDefault = a._id.toString() === target.toString();
  });
};

// @route   GET /api/users/addresses
const getAddresses = asyncHandler(async (req, res) => {
  res.json({ success: true, addresses: req.user.addresses });
});

// @route   POST /api/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.addresses.length >= 10) {
    res.status(400);
    throw new Error('You can save up to 10 addresses');
  }
  user.addresses.push(pickAddress(req.body));
  const added = user.addresses[user.addresses.length - 1];
  normaliseDefault(user, req.body.isDefault || user.addresses.length === 1 ? added._id : null);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @route   PUT /api/users/addresses/:addressId
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }
  Object.assign(address, pickAddress(req.body));
  normaliseDefault(user, req.body.isDefault ? address._id : null);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @route   DELETE /api/users/addresses/:addressId
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }
  address.deleteOne();
  normaliseDefault(user);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @route   POST /api/newsletter   body: { email }
const subscribeNewsletter = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  await User.updateOne({ email }, { newsletter: true });
  res.json({ success: true, message: 'Welcome to the world of NB Classic Scents.' });
});

module.exports = {
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  subscribeNewsletter,
};
