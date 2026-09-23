const express = require('express');
const c = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, c.getWishlist);
router.post('/merge', protect, c.mergeWishlist);
router.post('/:productId', protect, c.toggleWishlist);

module.exports = router;
