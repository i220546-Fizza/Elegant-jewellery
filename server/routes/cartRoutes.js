const express = require('express');
const c = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/quote', c.quoteCart);
router.route('/').get(protect, c.getCart).put(protect, c.saveCart);
router.post('/merge', protect, c.mergeCart);

module.exports = router;
