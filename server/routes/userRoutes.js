const express = require('express');
const { updateProfile, getWishlist, toggleWishlist, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/', protect, admin, getUsers);

module.exports = router;
