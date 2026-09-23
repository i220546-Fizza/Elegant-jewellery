const express = require('express');
const { subscribeNewsletter } = require('../controllers/userController');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/', authLimiter, subscribeNewsletter);

module.exports = router;
