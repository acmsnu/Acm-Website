const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Use memory storage so we can process with sharp before saving to disk
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// Middleware to optimize image and save it
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const uploadPath = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '.webp';
    const filepath = path.join(uploadPath, filename);

    // Use sharp to resize and compress
    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true }) // Max width 1200px
      .webp({ quality: 80 }) // Compress to WebP
      .toFile(filepath);

    // Update req.file to mock multer.diskStorage behavior so routes don't break
    req.file.filename = filename;
    req.file.path = filepath;
    
    next();
  } catch (error) {
    console.error('Image optimization failed:', error);
    next(new Error('Failed to process image'));
  }
};

module.exports = { upload, optimizeImage };
