const express = require('express');
const c = require('../controllers/categoryController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(optionalAuth, c.getCategories).post(protect, admin, c.createCategory);
router.route('/:id').put(protect, admin, c.updateCategory).delete(protect, admin, c.deleteCategory);

module.exports = router;
