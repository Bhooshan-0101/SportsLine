const express = require('express');
const {
  uploadJerseyDesign,
  uploadProductImages,
  uploadUserAvatar,
  deleteUploadedFile,
  getFileInfo
} = require('../controllers/uploadController');
const {
  uploadJerseyDesign: uploadJerseyDesignMiddleware,
  uploadProductImages: uploadProductImagesMiddleware,
  uploadAvatar: uploadAvatarMiddleware,
  handleUploadError
} = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Jersey design upload routes
router.post(
  '/jersey-design',
  protect,
  uploadJerseyDesignMiddleware.array('designs', 5),
  handleUploadError,
  uploadJerseyDesign
);

// Product image upload routes (admin only)
router.post(
  '/product-images',
  protect,
  adminOnly,
  uploadProductImagesMiddleware.array('images', 10),
  handleUploadError,
  uploadProductImages
);

// User avatar upload routes
router.post(
  '/avatar',
  protect,
  uploadAvatarMiddleware.single('avatar'),
  handleUploadError,
  uploadUserAvatar
);

// File management routes
router.delete('/:type/:filename', protect, deleteUploadedFile);
router.get('/:type/:filename/info', protect, getFileInfo);

module.exports = router;
