const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');
  console.log('URL:', req.method, req.originalUrl);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? 'Token present' : 'No token');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found:', req.user ? `${req.user.email} (${req.user.role})` : 'User not found');

      if (!req.user) {
        console.log('❌ User not found in database');
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found'
        });
      }

      if (!req.user.isActive) {
        console.log('❌ User account is deactivated');
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      console.log('✅ Authentication successful');
      next();
    } catch (error) {
      console.error('❌ Auth middleware error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed',
        details: error.message
      });
    }
  } else {
    console.log('❌ No authorization header or invalid format');
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Admin only access
const adminOnly = (req, res, next) => {
  console.log('=== ADMIN MIDDLEWARE ===');
  console.log('User:', req.user ? `${req.user.email} (${req.user.role})` : 'No user');

  if (req.user && req.user.role === 'admin') {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied - user role:', req.user?.role || 'No user');
    res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.',
      userRole: req.user?.role || 'No user'
    });
  }
};

// Customer only access
const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied. Customer account required.'
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid, but continue without user
      req.user = null;
    }
  }

  next();
};

// Check if user owns resource or is admin
const ownerOrAdmin = (req, res, next) => {
  console.log('=== OWNER OR ADMIN CHECK ===');
  console.log('Request user:', req.user ? `${req.user.email} (${req.user._id})` : 'No user');
  console.log('Request params userId:', req.params.userId);
  console.log('User role:', req.user?.role);

  if (req.user && (req.user.role === 'admin' || req.user._id.toString() === req.params.userId)) {
    console.log('✅ Access granted');
    next();
  } else {
    console.log('❌ Access denied');
    res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own resources.'
    });
  }
};

module.exports = {
  protect,
  adminOnly,
  customerOnly,
  optionalAuth,
  ownerOrAdmin
};
