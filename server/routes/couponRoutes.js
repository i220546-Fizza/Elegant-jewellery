const express = require('express');
const c = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, admin);
router.route('/').get(c.listCoupons).post(c.createCoupon);
router.route('/:id').put(c.updateCoupon).delete(c.deleteCoupon);

module.exports = router;
