const { validationResult } = require('express-validator');
const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category.toLowerCase();
    }

    // Subcategory filter
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory.toLowerCase();
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = new RegExp(req.query.brand, 'i');
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search filter
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Build sort
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'name_asc':
        sort.name = 1;
        break;
      case 'name_desc':
        sort.name = -1;
        break;
      case 'rating':
        sort['ratings.average'] = -1;
        break;
      case 'popular':
        sort.salesCount = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    // Execute query
    const products = await Product.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Only show active products to non-admin users
    if (!product.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching product'
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT ===');
    console.log('User:', req.user ? `${req.user.email} (${req.user.role})` : 'No user');
    console.log('Request body keys:', Object.keys(req.body));

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

    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Ensure inventory object has proper structure
    if (req.body.inventory && typeof req.body.inventory === 'object') {
      req.body.inventory = {
        trackQuantity: req.body.inventory.trackQuantity !== false,
        quantity: parseInt(req.body.inventory.quantity) || 0,
        lowStockThreshold: parseInt(req.body.inventory.lowStockThreshold) || 10
      };
    }

    // Ensure images array is properly formatted
    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.images = req.body.images.map(img => ({
        url: img.url || '',
        alt: img.alt || '',
        isPrimary: Boolean(img.isPrimary)
      }));
    }

    console.log('Attempting to create product...');
    const product = await Product.create(req.body);

    console.log('✅ Product created successfully');
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }

    res.status(500).json({
      success: false,
      error: 'Server error while creating product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT ===');
    console.log('Product ID:', req.params.id);
    console.log('User:', req.user ? `${req.user.email} (${req.user.role})` : 'No user');
    console.log('Request body keys:', Object.keys(req.body));

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

    // Add user to req.body
    req.body.updatedBy = req.user.id;

    // Clean and validate data before update
    const updateData = { ...req.body };

    // Ensure inventory object has proper structure if provided
    if (updateData.inventory && typeof updateData.inventory === 'object') {
      updateData.inventory = {
        trackQuantity: updateData.inventory.trackQuantity !== false,
        quantity: Math.max(0, parseInt(updateData.inventory.quantity) || 0),
        lowStockThreshold: Math.max(0, parseInt(updateData.inventory.lowStockThreshold) || 10)
      };
    }

    // Ensure images array is properly formatted if provided
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map(img => ({
        url: img.url || '',
        alt: img.alt || '',
        isPrimary: Boolean(img.isPrimary)
      }));
    }

    // Remove any undefined or null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    console.log('Attempting to update product...');
    console.log('Update data keys:', Object.keys(updateData));

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    console.log('✅ Product updated successfully');
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }

    res.status(500).json({
      success: false,
      error: 'Server error while updating product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    product.updatedBy = req.user.id;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting product'
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching categories'
    });
  }
};

// @desc    Get product brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true, brand: { $ne: null } });
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching brands'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands
};
