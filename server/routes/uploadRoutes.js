const express = require('express');
const asyncHandler = require('express-async-handler');
const { uploadImages } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, admin, upload.array('images', 6), asyncHandler(uploadImages));

module.exports = router;
