const express = require('express');
const c = require('../controllers/orderController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(optionalAuth, c.createOrder).get(protect, admin, c.getAllOrders);
router.get('/my-orders', protect, c.getMyOrders);
router.put('/:id/cancel', protect, c.cancelMyOrder);
router.put('/:id/status', protect, admin, c.updateOrderStatus);
router.get('/:id', optionalAuth, c.getOrderById);

module.exports = router;
