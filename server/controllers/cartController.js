const { validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.product', 'name price images inventory category isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Filter out inactive products
    const activeCartItems = user.cart.filter(item => 
      item.product && item.product.isActive
    );

    // Update cart if any items were filtered out
    if (activeCartItems.length !== user.cart.length) {
      user.cart = activeCartItems;
      await user.save();
    }

    // Calculate cart totals
    const subtotal = activeCartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    const totalItems = activeCartItems.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    res.json({
      success: true,
      data: {
        items: activeCartItems,
        subtotal,
        totalItems
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { productId, quantity, size, color } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or inactive'
      });
    }

    // Check inventory
    if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient inventory'
      });
    }

    const user = await User.findById(req.user._id);

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      
      // Check inventory for new quantity
      if (product.inventory.trackQuantity && product.inventory.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient inventory for requested quantity'
        });
      }

      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      user.cart.push({
        product: productId,
        quantity,
        size,
        color
      });
    }

    await user.save();

    // Get updated cart with populated products
    const updatedUser = await User.findById(req.user._id)
      .populate('cart.product', 'name price images inventory category');

    res.json({
      success: true,
      data: updatedUser.cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding to cart'
    });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    const cartItem = user.cart.id(req.params.itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    // Check product inventory
    const product = await Product.findById(cartItem.product);
    if (product && product.inventory.trackQuantity && product.inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient inventory'
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    // Get updated cart with populated products
    const updatedUser = await User.findById(req.user._id)
      .populate('cart.product', 'name price images inventory category');

    res.json({
      success: true,
      data: updatedUser.cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating cart item'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const cartItem = user.cart.id(req.params.itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    cartItem.remove();
    await user.save();

    // Get updated cart with populated products
    const updatedUser = await User.findById(req.user._id)
      .populate('cart.product', 'name price images inventory category');

    res.json({
      success: true,
      data: updatedUser.cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while removing from cart'
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while clearing cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
