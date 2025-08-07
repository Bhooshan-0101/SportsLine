const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration for jersey design PDFs
const jerseyDesignStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/jersey-designs');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `jersey-design-${uniqueSuffix}${extension}`);
  }
});

// Storage configuration for product images
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/products');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${extension}`);
  }
});

// Storage configuration for user avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/avatars');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${extension}`);
  }
});

// File filter for PDFs only
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for jersey designs'), false);
  }
};

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// Upload configurations
const uploadJerseyDesign = multer({
  storage: jerseyDesignStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per upload
  }
});

const uploadProductImages = multer({
  storage: productImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
    files: 10 // Maximum 10 images per upload
  }
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB for avatars
    files: 1 // Single file only
  }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  console.log('=== UPLOAD ERROR HANDLER ===');
  console.log('Error type:', error.constructor.name);
  console.log('Error message:', error.message);
  console.log('Error code:', error.code);

  if (error instanceof multer.MulterError) {
    console.log('❌ Multer error:', error.code);
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size allowed is 10MB for images.',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files. Maximum 10 images allowed per upload.',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field. Use "images" field name.',
          code: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error: ' + error.message,
          code: 'UPLOAD_ERROR'
        });
    }
  }

  if (error.message.includes('Only')) {
    console.log('❌ File type error:', error.message);
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  console.log('❌ Unhandled upload error, passing to next middleware');
  next(error);
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to get file URL
const getFileUrl = (req, filename, type = 'jersey-designs') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

module.exports = {
  uploadJerseyDesign,
  uploadProductImages,
  uploadAvatar,
  handleUploadError,
  deleteFile,
  getFileUrl
};
