const express = require('express');
const c = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.route('/').post(authLimiter, c.createMessage).get(protect, admin, c.listMessages);
router.route('/:id').put(protect, admin, c.updateMessage).delete(protect, admin, c.deleteMessage);

module.exports = router;
