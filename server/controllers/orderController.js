const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      query.customer = req.user.id;
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images category')
      .populate('timeline.updatedBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
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
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching order'
    });
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
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

    const { items, shippingAddress, billingAddress, payment, shipping, notes } = req.body;

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product} not found or inactive`
        });
      }

      // Check inventory
      if (product.inventory.trackQuantity && product.inventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient inventory for ${product.name}`
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        customization: item.customization,
        subtotal: itemSubtotal
      });

      // Update product inventory and sales count
      if (product.inventory.trackQuantity) {
        product.inventory.quantity -= item.quantity;
      }
      product.salesCount += item.quantity;
      await product.save();
    }

    // Calculate totals
    const tax = subtotal * 0.08; // 8% tax rate
    const shippingCost = shipping.method === 'standard' ? 9.99 :
                        shipping.method === 'express' ? 19.99 :
                        shipping.method === 'overnight' ? 39.99 : 0;
    const total = subtotal + tax + shippingCost;

    // Generate order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `SL${timestamp.slice(-6)}${random}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customer: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress,
      pricing: {
        subtotal,
        tax,
        shipping: shippingCost,
        discount: 0,
        total
      },
      payment: {
        method: payment.method,
        status: 'pending'
      },
      shipping: {
        method: shipping.method,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      notes: {
        customer: notes?.customer
      },
      timeline: [{
        status: 'pending',
        note: 'Order created',
        updatedBy: req.user.id
      }]
    });

    // Clear user's cart
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating order'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    
    // Add to timeline
    order.timeline.push({
      status,
      note,
      updatedBy: req.user.id
    });

    // Update specific timestamps based on status
    switch (status) {
      case 'shipped':
        order.shipping.shippedAt = new Date();
        if (req.body.trackingNumber) {
          order.shipping.trackingNumber = req.body.trackingNumber;
        }
        if (req.body.carrier) {
          order.shipping.carrier = req.body.carrier;
        }
        break;
      case 'delivered':
        order.shipping.deliveredAt = new Date();
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        if (req.body.cancelReason) {
          order.cancelReason = req.body.cancelReason;
        }
        break;
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating order status'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (req.user.role !== 'admin' && order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    
    // Add to timeline
    order.timeline.push({
      status: 'cancelled',
      note: `Order cancelled: ${reason}`,
      updatedBy: req.user.id
    });

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.inventory.trackQuantity) {
        product.inventory.quantity += item.quantity;
        product.salesCount -= item.quantity;
        await product.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while cancelling order'
    });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
};
