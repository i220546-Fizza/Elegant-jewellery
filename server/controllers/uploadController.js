// @desc    Upload one or more product images
// @route   POST /api/uploads
// @access  Private/Admin
const uploadImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please select at least one image to upload');
  }

  const paths = req.files.map((file) => `/uploads/products/${file.filename}`);
  res.status(201).json({ success: true, images: paths });
};

module.exports = { uploadImages };
