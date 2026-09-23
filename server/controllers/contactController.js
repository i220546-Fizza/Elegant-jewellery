const asyncHandler = require('express-async-handler');
const ContactMessage = require('../models/ContactMessage');
const { sendEmail } = require('../utils/sendEmail');

// @route   POST /api/contact
const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(String(email))) {
    res.status(400);
    throw new Error('Please provide your name, a valid email and a message');
  }
  const doc = await ContactMessage.create({ name, email, subject, message });
  if (process.env.STORE_EMAIL) {
    sendEmail({
      to: process.env.STORE_EMAIL,
      subject: `New enquiry: ${subject || 'Contact form'}`,
      text: `${name} <${email}>\n\n${message}`,
    }).catch((err) => console.error(`Contact email failed: ${err.message}`));
  }
  res.status(201).json({ success: true, message: 'Thank you. Our client care team will reply within one working day.', id: doc._id });
});

// @route   GET /api/contact   (admin)
const listMessages = asyncHandler(async (req, res) => {
  res.json({ success: true, messages: await ContactMessage.find().sort({ createdAt: -1 }).limit(200) });
});

// @route   PUT /api/contact/:id   (admin) body: { isRead }
const updateMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: !!req.body.isRead }, { new: true });
  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }
  res.json({ success: true, message: msg });
});

// @route   DELETE /api/contact/:id   (admin)
const deleteMessage = asyncHandler(async (req, res) => {
  await ContactMessage.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = { createMessage, listMessages, updateMessage, deleteMessage };
