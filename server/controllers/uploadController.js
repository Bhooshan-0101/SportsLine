const path = require('path');
const fs = require('fs');
const BulkJerseyOrder = require('../models/BulkJerseyOrder');
const { deleteFile, getFileUrl } = require('../middleware/upload');

// @desc    Upload jersey design files
// @route   POST /api/upload/jersey-design
// @access  Private
const uploadJerseyDesign = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: getFileUrl(req, file.filename, 'jersey-designs'),
      uploadedAt: new Date()
    }));

    res.json({
      success: true,
      message: 'Jersey design files uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload jersey design error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        deleteFile(file.path);
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error during file upload'
    });
  }
};

// @desc    Upload product images
// @route   POST /api/upload/product-images
// @access  Private/Admin
const uploadProductImages = async (req, res) => {
  try {
    console.log('=== PRODUCT IMAGE UPLOAD ===');
    console.log('User:', req.user ? `${req.user.email} (${req.user.role})` : 'No user');
    console.log('Files received:', req.files ? req.files.length : 0);

    if (!req.files || req.files.length === 0) {
      console.log('❌ No files uploaded');
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    console.log('Files details:', req.files.map(f => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      filename: f.filename
    })));

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: getFileUrl(req, file.filename, 'products'),
      uploadedAt: new Date()
    }));

    console.log('✅ Upload successful, files:', uploadedFiles.length);

    res.json({
      success: true,
      message: 'Product images uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('❌ Upload product images error:', error);

    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        deleteFile(file.path);
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during file upload',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/upload/avatar
// @access  Private
const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const uploadedFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: getFileUrl(req, req.file.filename, 'avatars'),
      uploadedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: uploadedFile
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error during file upload'
    });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:type/:filename
// @access  Private
const deleteUploadedFile = async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Validate file type
    const allowedTypes = ['jersey-designs', 'products', 'avatars'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type'
      });
    }

    const filePath = path.join(__dirname, `../uploads/${type}/${filename}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // For jersey designs, check if file is associated with any bulk orders
    if (type === 'jersey-designs') {
      const bulkOrder = await BulkJerseyOrder.findOne({
        'customDesign.designFiles.filename': filename
      });

      if (bulkOrder) {
        // Only allow deletion by order owner or admin
        if (req.user.role !== 'admin' && bulkOrder.customer.toString() !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }

        // Remove file from bulk order
        bulkOrder.customDesign.designFiles = bulkOrder.customDesign.designFiles.filter(
          file => file.filename !== filename
        );
        await bulkOrder.save();
      }
    }

    // Delete the file
    const deleted = deleteFile(filePath);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete file'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during file deletion'
    });
  }
};

// @desc    Get file info
// @route   GET /api/upload/:type/:filename/info
// @access  Private
const getFileInfo = async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Validate file type
    const allowedTypes = ['jersey-designs', 'products', 'avatars'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type'
      });
    }

    const filePath = path.join(__dirname, `../uploads/${type}/${filename}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    
    const fileInfo = {
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      url: getFileUrl(req, filename, type),
      type
    };

    res.json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while getting file info'
    });
  }
};

module.exports = {
  uploadJerseyDesign,
  uploadProductImages,
  uploadUserAvatar,
  deleteUploadedFile,
  getFileInfo
};
