const { validationResult } = require('express-validator');
const BulkJerseyOrder = require('../models/BulkJerseyOrder');
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// @desc    Get bulk jersey orders
// @route   GET /api/bulk-orders
// @access  Private
const getBulkOrders = async (req, res) => {
  try {
    console.log('=== getBulkOrders START ===');
    console.log('User:', req.user?.id, 'Role:', req.user?.role);
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      query.customer = req.user.id;
    }

    console.log('Query:', query);

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Priority filter
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Assigned to filter (admin only)
    if (req.query.assignedTo && req.user.role === 'admin') {
      query.assignedTo = req.query.assignedTo;
    }

    const orders = await BulkJerseyOrder.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate({
        path: 'jerseyDetails.baseProduct',
        select: 'name price images',
        match: { _id: { $ne: null } } // Only populate if baseProduct exists
      })
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BulkJerseyOrder.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bulk orders error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);

    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while fetching bulk orders',
      details: error.message
    });
  }
};

// @desc    Get single bulk jersey order
// @route   GET /api/bulk-orders/:id
// @access  Private
const getBulkOrder = async (req, res) => {
  try {
    console.log('=== getBulkOrder START ===');
    console.log('User:', req.user?.id, 'Role:', req.user?.role);
    console.log('Order ID:', req.params.id);

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Validate ID format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID format'
      });
    }

    const order = await BulkJerseyOrder.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate({
        path: 'jerseyDetails.baseProduct',
        select: 'name price images category',
        match: { _id: { $ne: null } } // Only populate if baseProduct exists
      })
      .populate('assignedTo', 'firstName lastName email')
      .populate('timeline.designApproval.approvedBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Bulk jersey order not found'
      });
    }

    // Check if user owns this order or is admin
    if (req.user.role !== 'admin' && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get bulk order error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);

    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while fetching bulk order',
      details: error.message
    });
  }
};

// @desc    Create bulk jersey order
// @route   POST /api/bulk-orders
// @access  Private
const createBulkOrder = async (req, res) => {
  try {
    console.log('=== createBulkOrder START ===');
    console.log('User:', req.user?.id, 'Role:', req.user?.role);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Full request body:', JSON.stringify(req.body, null, 2));

    // Skip validation for now - just log the data
    console.log('Skipping validation - processing request directly');

    // Extract data with defaults
    const teamName = req.body.teamName || 'Test Team';
    const contactPerson = req.body.contactPerson || {
      name: 'Test Contact',
      email: 'test@example.com',
      phone: '1234567890'
    };
    const jerseyDetails = req.body.jerseyDetails || {
      baseProduct: null,
      material: 'polyester',
      style: 'home'
    };
    const customDesign = req.body.customDesign || {
      hasCustomDesign: false,
      designFiles: [],
      designNotes: ''
    };
    const playerDetails = req.body.playerDetails || [{
      playerName: 'Test Player',
      jerseyNumber: 1,
      size: 'M',
      position: '',
      specialRequests: ''
    }];
    const shippingAddress = req.body.shippingAddress || {
      name: 'Test Address',
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345'
    };
    const notes = req.body.notes || { customer: '' };

    console.log('Processed data:', {
      teamName,
      contactPerson,
      jerseyDetails,
      customDesign,
      playerDetails: playerDetails.length,
      shippingAddress,
      notes
    });

    // Skip base product validation for now - use default product
    let baseProduct = null;
    if (jerseyDetails.baseProduct) {
      try {
        baseProduct = await Product.findById(jerseyDetails.baseProduct);
        console.log('Base product found:', baseProduct?.name || 'Not found');
      } catch (error) {
        console.log('Error finding base product:', error.message);
      }
    }

    // Use default values if no base product
    if (!baseProduct) {
      console.log('Using default product values');
      baseProduct = {
        name: 'Default Jersey',
        price: 50,
        isActive: true
      };
    }

    // Calculate pricing - use player count as quantity since sizes are not specified
    const totalQuantity = playerDetails.length;
    const basePrice = baseProduct.price * totalQuantity;
    
    // Customization fees
    const customizationFee = playerDetails.length * 5; // $5 per player customization
    const designFee = customDesign.hasCustomDesign ? 50 : 0; // $50 design fee
    
    // Bulk discount
    let bulkDiscountPercentage = 0;
    if (totalQuantity >= 50) bulkDiscountPercentage = 15;
    else if (totalQuantity >= 25) bulkDiscountPercentage = 10;
    else if (totalQuantity >= 10) bulkDiscountPercentage = 5;
    
    const bulkDiscountAmount = (basePrice * bulkDiscountPercentage) / 100;
    const subtotal = basePrice + customizationFee + designFee - bulkDiscountAmount;
    const tax = subtotal * 0.08; // 8% tax
    const shipping = totalQuantity > 20 ? 0 : 25; // Free shipping for orders > 20 items
    const total = subtotal + tax + shipping;

    // Set estimated delivery (3-4 weeks for bulk orders)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 25); // 25 days

    // Generate order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `BJO${timestamp.slice(-6)}${random}`;
    console.log('Generated order number:', orderNumber);

    // Create bulk order
    const bulkOrder = new BulkJerseyOrder({
      orderNumber,
      customer: req.user.id,
      teamName,
      contactPerson,
      jerseyDetails: {
        ...jerseyDetails,
        baseProduct: baseProduct?._id || null
      },
      customDesign,
      playerDetails,
      pricing: {
        basePrice,
        customizationFee,
        designFee,
        bulkDiscount: {
          percentage: bulkDiscountPercentage,
          amount: bulkDiscountAmount
        },
        subtotal,
        tax,
        shipping,
        total
      },
      timeline: {
        designApproval: {
          required: customDesign.hasCustomDesign,
          deadline: customDesign.hasCustomDesign ?
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 days for design approval
        },
        production: {
          estimatedCompletion: estimatedDelivery
        },
        delivery: {
          estimatedDate: estimatedDelivery
        }
      },
      shippingAddress,
      notes: {
        customer: notes?.customer
      },
      payment: {
        status: 'pending',
        totalPaid: 0,
        balanceDue: total,
        deposits: []
      },
      estimatedDelivery,
      status: customDesign.hasCustomDesign ? 'design_approval_needed' : 'pending_review'
    });

    // Save the order (this will trigger the pre-save hook)
    await bulkOrder.save();

    // Populate order for response (skip baseProduct if null)
    let populatedOrder = await BulkJerseyOrder.findById(bulkOrder._id)
      .populate('customer', 'firstName lastName email');

    // Only populate baseProduct if it exists
    if (populatedOrder.jerseyDetails.baseProduct) {
      populatedOrder = await BulkJerseyOrder.findById(bulkOrder._id)
        .populate('customer', 'firstName lastName email')
        .populate('jerseyDetails.baseProduct', 'name price images');
    }

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('=== CREATE BULK ORDER ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);

    // Log the full error object for debugging
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyPattern);
      return res.status(400).json({
        success: false,
        error: 'Duplicate order number'
      });
    }

    // Handle cast errors
    if (error.name === 'CastError') {
      console.error('Cast error:', error.path, error.value);
      return res.status(400).json({
        success: false,
        error: 'Invalid data format',
        details: `Invalid ${error.path}: ${error.value}`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while creating bulk order',
      details: error.message
    });
  }
};

// @desc    Update bulk order status
// @route   PUT /api/bulk-orders/:id/status
// @access  Private/Admin
const updateBulkOrderStatus = async (req, res) => {
  try {
    const { status, note, estimatedCompletion, actualCompletion } = req.body;

    const order = await BulkJerseyOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Bulk order not found'
      });
    }

    // Update order status
    order.status = status;
    
    // Update timeline based on status
    switch (status) {
      case 'approved':
        order.timeline.designApproval.approvedAt = new Date();
        order.timeline.designApproval.approvedBy = req.user.id;
        order.timeline.production.startDate = new Date();
        break;
      case 'in_production':
        if (!order.timeline.production.startDate) {
          order.timeline.production.startDate = new Date();
        }
        if (estimatedCompletion) {
          order.timeline.production.estimatedCompletion = new Date(estimatedCompletion);
        }
        break;
      case 'quality_check':
        if (actualCompletion) {
          order.timeline.production.actualCompletion = new Date(actualCompletion);
        }
        break;
      case 'ready_for_delivery':
        order.timeline.delivery.estimatedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
        break;
      case 'completed':
        order.actualDelivery = new Date();
        order.timeline.delivery.actualDate = new Date();
        break;
    }

    // Add admin note if provided
    if (note) {
      order.notes.admin = order.notes.admin ? 
        `${order.notes.admin}\n\n[${new Date().toISOString()}] ${note}` : note;
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update bulk order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating bulk order status'
    });
  }
};

// @desc    Assign bulk order to admin
// @route   PUT /api/bulk-orders/:id/assign
// @access  Private/Admin
const assignBulkOrder = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const order = await BulkJerseyOrder.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate('assignedTo', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Bulk order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Assign bulk order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while assigning bulk order'
    });
  }
};

// @desc    Update bulk order priority
// @route   PUT /api/bulk-orders/:id/priority
// @access  Private/Admin
const updateBulkOrderPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    const order = await BulkJerseyOrder.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Bulk order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update bulk order priority error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating bulk order priority'
    });
  }
};

module.exports = {
  getBulkOrders,
  getBulkOrder,
  createBulkOrder,
  updateBulkOrderStatus,
  assignBulkOrder,
  updateBulkOrderPriority
};
