import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const allowedTypes = /jpe?g|png|webp|gif|svg/;

function fileFilter(req, file, cb) {
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp, gif, svg) are allowed'));
  }
}

// When Cloudinary credentials are configured, uploads are streamed straight to
// Cloudinary (see productController.js) so they survive host restarts/redeploys
// — keep files in memory rather than writing to local disk first. Without
// Cloudinary configured, fall back to local disk so `npm run dev` works with
// zero extra setup.
export const useCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

let storage;
if (useCloudinary) {
  storage = multer.memoryStorage();
} else {
  const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
  fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
