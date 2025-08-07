const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, ownerOrAdmin } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../services/notificationService');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/:userId
// @access  Private (Owner or Admin)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Private (Owner or Admin)
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        firstName,
        lastName,
        phone,
        address
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating user profile'
    });
  }
};

// @desc    Add item to wishlist
// @route   POST /api/users/:userId/wishlist
// @access  Private (Owner or Admin)
const addToWishlist = async (req, res) => {
  try {
    console.log('=== ADD TO WISHLIST ===');
    console.log('User ID:', req.params.userId);
    console.log('Product ID:', req.body.productId);
    console.log('Request user:', req.user ? `${req.user.email} (${req.user.id})` : 'No user');

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { productId } = req.body;

    console.log('Finding user...');
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('User found:', user.email);
    console.log('Current wishlist:', user.wishlist);

    // Check if product exists
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    console.log('Product found:', product.name);

    // Check if product already in wishlist
    if (user.wishlist.includes(productId)) {
      console.log('❌ Product already in wishlist');
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      });
    }

    console.log('Adding product to wishlist...');
    user.wishlist.push(productId);
    await user.save();

    console.log('✅ Product added to wishlist successfully');

    // Populate wishlist for response
    const updatedUser = await User.findById(req.params.userId)
      .populate('wishlist', 'name price images')
      .select('-password');

    res.json({
      success: true,
      data: updatedUser.wishlist
    });
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error while adding to wishlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/users/:userId/wishlist/:productId
// @access  Private (Owner or Admin)
const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    // Populate wishlist for response
    const updatedUser = await User.findById(userId)
      .populate('wishlist', 'name price images')
      .select('-password');

    res.json({
      success: true,
      data: updatedUser.wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while removing from wishlist'
    });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/:userId/wishlist
// @access  Private (Owner or Admin)
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('wishlist', 'name price images category isActive')
      .select('wishlist');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Filter out inactive products
    const activeWishlistItems = user.wishlist.filter(item => item.isActive);

    res.json({
      success: true,
      data: activeWishlistItems
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching wishlist'
    });
  }
};

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number')
];

const addToWishlistValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// @desc    Get user notifications
// @route   GET /api/users/:userId/notifications
// @access  Private (Owner or Admin)
const getNotifications = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const notifications = getUserNotifications(req.params.userId, parseInt(limit));

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notifications'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/:userId/notifications/:notificationId/read
// @access  Private (Owner or Admin)
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = markAsRead(req.params.userId, req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/:userId/notifications/read-all
// @access  Private (Owner or Admin)
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const count = markAllAsRead(req.params.userId);

    res.json({
      success: true,
      message: `${count} notifications marked as read`
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking notifications as read'
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/users/:userId/notifications/unread-count
// @access  Private (Owner or Admin)
const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = getUnreadCount(req.params.userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching unread count'
    });
  }
};

// Routes
router.get('/:userId', protect, ownerOrAdmin, getUserProfile);
router.put('/:userId', protect, ownerOrAdmin, updateProfileValidation, updateUserProfile);
router.get('/:userId/wishlist', protect, ownerOrAdmin, getWishlist);
router.post('/:userId/wishlist', protect, ownerOrAdmin, addToWishlistValidation, addToWishlist);
router.delete('/:userId/wishlist/:productId', protect, ownerOrAdmin, removeFromWishlist);

// Notification routes
router.get('/:userId/notifications', protect, getNotifications);
router.put('/:userId/notifications/:notificationId/read', protect, markNotificationAsRead);
router.put('/:userId/notifications/read-all', protect, markAllNotificationsAsRead);
router.get('/:userId/notifications/unread-count', protect, getUnreadNotificationCount);

module.exports = router;
