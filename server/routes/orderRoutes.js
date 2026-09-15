const express = require('express');
const jwt = require('jsonwebtoken');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Attach req.user if a valid token is present, but don't require it (guest checkout)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // invalid/expired token: continue as guest rather than blocking checkout
    }
  }
  next();
};

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', optionalAuth, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
