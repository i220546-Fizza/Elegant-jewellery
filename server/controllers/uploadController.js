const cloudinary = require('../config/cloudinary');
const { useCloudinary } = require('../middleware/uploadMiddleware');

const streamUpload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    stream.end(buffer);
  });

// @route   POST /api/uploads/images   (admin)
const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please select at least one image to upload');
  }
  let images;
  if (useCloudinary) {
    const results = await Promise.all(
      req.files.map((file) =>
        streamUpload(file.buffer, { folder: 'nb-classic-scents/products', transformation: [{ width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] })
      )
    );
    images = results.map((r) => r.secure_url);
  } else {
    images = req.files.map((file) => `/uploads/products/${file.filename}`);
  }
  res.status(201).json({ success: true, images });
};

// @route   POST /api/uploads/model   (admin) - a single .glb / .gltf
const uploadModel = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select a .glb or .gltf file');
  }
  let url;
  if (useCloudinary) {
    const result = await streamUpload(req.file.buffer, { folder: 'nb-classic-scents/models', resource_type: 'raw', use_filename: true });
    url = result.secure_url;
  } else {
    url = `/uploads/models/${req.file.filename}`;
  }
  res.status(201).json({ success: true, url });
};

module.exports = { uploadImages, uploadModel };
