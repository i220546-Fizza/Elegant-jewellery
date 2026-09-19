const cloudinary = require('../config/cloudinary');

const useCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

const streamUpload = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'elegant-jewellery/products' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });

// @desc    Upload one or more product images
// @route   POST /api/uploads
// @access  Private/Admin
const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please select at least one image to upload');
  }

  let images;
  if (useCloudinary) {
    const results = await Promise.all(req.files.map((file) => streamUpload(file.buffer)));
    images = results.map((result) => result.secure_url);
  } else {
    images = req.files.map((file) => `/uploads/products/${file.filename}`);
  }

  res.status(201).json({ success: true, images });
};

module.exports = { uploadImages };
