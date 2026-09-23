const path = require('path');
const fs = require('fs');
const multer = require('multer');

const imageTypes = /jpe?g|png|webp|avif|gif/;
const modelExt = /\.(glb|gltf)$/i;

// When Cloudinary credentials are configured, uploads are streamed straight to
// Cloudinary (see uploadController.js) so they survive host restarts/redeploys.
// Without it, files are saved to local disk under server/uploads/.
const useCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

const diskStorage = (folder) => {
  const dir = path.join(__dirname, '..', 'uploads', folder);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
};

const imageUpload = multer({
  storage: useCloudinary ? multer.memoryStorage() : diskStorage('products'),
  fileFilter: (req, file, cb) => {
    const extOk = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = imageTypes.test(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error('Only image files (jpg, png, webp, avif, gif) are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const modelUpload = multer({
  storage: useCloudinary ? multer.memoryStorage() : diskStorage('models'),
  fileFilter: (req, file, cb) => {
    if (modelExt.test(file.originalname)) cb(null, true);
    else cb(new Error('Only 3D model files (.glb, .gltf) are allowed'));
  },
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = { imageUpload, modelUpload, useCloudinary };
