const express = require('express');
const asyncHandler = require('express-async-handler');
const { uploadImages, uploadModel } = require('../controllers/uploadController');
const { imageUpload, modelUpload } = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/images', protect, admin, imageUpload.array('images', 8), asyncHandler(uploadImages));
router.post('/model', protect, admin, modelUpload.single('model'), asyncHandler(uploadModel));

module.exports = router;
