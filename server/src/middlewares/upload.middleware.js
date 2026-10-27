import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

// On Vercel (/var/task) and AWS Lambda, the root filesystem is strictly read-only.
// The only writable directory provided by the serverless runtime is /tmp (os.tmpdir()).
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  (process.env.NODE_ENV === 'production' && process.cwd().startsWith('/var/task'))
);

export const uploadDir = isServerless
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

// Safely ensure directory exists without throwing unhandled EROFS on read-only environments
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn(`[Upload Directory]: Read-only filesystem detected, skipping mkdir: ${err.message}`);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch {
      // Ignored if folder cannot be created synchronously
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `atelier-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only high-resolution image formats (JPEG, JPG, PNG, WEBP) are accepted for atelier sketches.'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
  fileFilter,
});
