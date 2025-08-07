const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const BulkJerseyOrder = require('../models/BulkJerseyOrder');
const { sendOrderStatusNotification } = require('../services/notificationService');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    console.log('=== getDashboardStats START ===');
    console.log('User:', req.user?.id, 'Role:', req.user?.role);

    // Return mock data if database is not available
    const mockData = {
      overview: {
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalBulkOrders: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      },
      orders: {
        pending: 0,
        processing: 0,
        shipped: 0
      },
      bulkOrders: {
        pending: 0,
        inProduction: 0
      },
      lowStockProducts: [],
      recentOrders: [],
      topProducts: []
    };

    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      console.log('Fetching basic counts...');

      // Get basic counts with comprehensive error handling
      const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true }).catch(err => {
        console.log('Error counting customers:', err.message);
        return 0;
      });

      const totalProducts = await Product.countDocuments({ isActive: true }).catch(err => {
        console.log('Error counting products:', err.message);
        return 0;
      });

      const totalOrders = await Order.countDocuments().catch(err => {
        console.log('Error counting orders:', err.message);
        return 0;
      });

      const totalBulkOrders = await BulkJerseyOrder.countDocuments().catch(err => {
        console.log('Error counting bulk orders:', err.message);
        return 0;
      });

      console.log('Basic counts:', { totalCustomers, totalProducts, totalOrders, totalBulkOrders });

      // Get revenue stats with error handling
      let totalRevenue = 0;
      let monthlyRevenue = 0;

      try {
        const totalRevenueResult = await Order.aggregate([
          { $match: { 'payment.status': 'completed' } },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);
        totalRevenue = totalRevenueResult[0]?.total || 0;
      } catch (err) {
        console.log('Error calculating total revenue:', err.message);
      }

      try {
        const monthlyRevenueResult = await Order.aggregate([
          {
            $match: {
              'payment.status': 'completed',
              createdAt: { $gte: startOfMonth }
            }
          },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);
        monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
      } catch (err) {
        console.log('Error calculating monthly revenue:', err.message);
      }

      // Get order stats with error handling
      const pendingOrders = await Order.countDocuments({ status: 'pending' }).catch(() => 0);
      const processingOrders = await Order.countDocuments({ status: 'processing' }).catch(() => 0);
      const shippedOrders = await Order.countDocuments({ status: 'shipped' }).catch(() => 0);

      // Get bulk order stats with error handling
      const pendingBulkOrders = await BulkJerseyOrder.countDocuments({
        status: { $in: ['pending_review', 'design_approval_needed'] }
      }).catch(() => 0);

      const inProductionBulkOrders = await BulkJerseyOrder.countDocuments({
        status: 'in_production'
      }).catch(() => 0);

      // Get low stock products with error handling
      let lowStockProducts = [];
      try {
        lowStockProducts = await Product.find({
          isActive: true,
          'inventory.trackQuantity': true,
          $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] }
        }).limit(10);
      } catch (err) {
        console.log('Error fetching low stock products:', err.message);
        // Try simpler query
        try {
          lowStockProducts = await Product.find({ isActive: true }).limit(5);
        } catch (err2) {
          console.log('Error with fallback product query:', err2.message);
        }
      }

      // Get recent orders with error handling
      let recentOrders = [];
      try {
        recentOrders = await Order.find()
          .populate('customer', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .limit(5);
      } catch (err) {
        console.log('Error fetching recent orders:', err.message);
        // Try without populate
        try {
          recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
        } catch (err2) {
          console.log('Error with fallback order query:', err2.message);
        }
      }

      // Get top selling products with error handling
      let topProducts = [];
      try {
        topProducts = await Product.find({ isActive: true })
          .sort({ salesCount: -1 })
          .limit(5)
          .select('name salesCount price images');
      } catch (err) {
        console.log('Error fetching top products:', err.message);
        // Try simpler query
        try {
          topProducts = await Product.find({ isActive: true }).limit(5);
        } catch (err2) {
          console.log('Error with fallback top products query:', err2.message);
        }
      }

      const dashboardData = {
        overview: {
          totalCustomers,
          totalProducts,
          totalOrders,
          totalBulkOrders,
          totalRevenue,
          monthlyRevenue
        },
        orders: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders
        },
        bulkOrders: {
          pending: pendingBulkOrders,
          inProduction: inProductionBulkOrders
        },
        lowStockProducts,
        recentOrders,
        topProducts
      };

      console.log('Dashboard data prepared successfully');

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (dbError) {
      console.error('Database error in dashboard stats:', dbError);
      console.error('Database error stack:', dbError.stack);

      // Return mock data if database operations fail
      res.json({
        success: true,
        data: mockData,
        warning: 'Using mock data due to database connectivity issues'
      });
    }

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      success: false,
      error: 'Server error while fetching dashboard stats',
      details: error.message
    });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { role: 'customer' };

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    // Status filter
    if (req.query.status) {
      query.isActive = req.query.status === 'active';
    }

    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Get additional stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ customer: customer._id });
        const totalSpent = await Order.aggregate([
          { $match: { customer: customer._id, 'payment.status': 'completed' } },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);

        return {
          ...customer.toObject(),
          stats: {
            orderCount,
            totalSpent: totalSpent[0]?.total || 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: customersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching customers'
    });
  }
};

// @desc    Get customer details
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Get customer orders
    const orders = await Order.find({ customer: customer._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get customer bulk orders
    const bulkOrders = await BulkJerseyOrder.find({ customer: customer._id })
      .populate('jerseyDetails.baseProduct', 'name images')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get customer stats
    const totalOrders = await Order.countDocuments({ customer: customer._id });
    const totalSpent = await Order.aggregate([
      { $match: { customer: customer._id, 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    res.json({
      success: true,
      data: {
        customer,
        orders,
        bulkOrders,
        stats: {
          totalOrders,
          totalSpent: totalSpent[0]?.total || 0,
          averageOrderValue: totalOrders > 0 ? (totalSpent[0]?.total || 0) / totalOrders : 0
        }
      }
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching customer details'
    });
  }
};

// @desc    Update customer status
// @route   PUT /api/admin/customers/:id/status
// @access  Private/Admin
const updateCustomerStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating customer status'
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
const getSalesAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Daily sales data
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'payment.status': 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Category sales
    const categorySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'payment.status': 'completed'
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$items.subtotal' },
          quantity: { $sum: '$items.quantity' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        dailySales,
        categorySales
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching sales analytics'
    });
  }
};

// @desc    Get admin orders with advanced filtering
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedTo,
      customer,
      dateFrom,
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (customer) filter.customer = customer;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'notes.customer': { $regex: search, $options: 'i' } },
        { 'notes.admin': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const orders = await Order.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images category price')
      .populate('assignedTo', 'firstName lastName')
      .populate('approvalStatus.approvedBy', 'firstName lastName')
      .populate('approvalStatus.rejectedBy', 'firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(totalCount / parseInt(limit)),
        total: totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching orders'
    });
  }
};

// @desc    Get admin order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getAdminOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('items.product', 'name images category price description')
      .populate('assignedTo', 'firstName lastName email')
      .populate('approvalStatus.approvedBy', 'firstName lastName')
      .populate('approvalStatus.rejectedBy', 'firstName lastName')
      .populate('timeline.updatedBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get admin order details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching order details'
    });
  }
};

// @desc    Approve order
// @route   PUT /api/admin/orders/:id/approve
// @access  Private/Admin
const approveOrder = async (req, res) => {
  try {
    const { note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Order can only be approved when in pending status'
      });
    }

    // Update order approval status
    order.status = 'approved';
    order.approvalStatus.approved = true;
    order.approvalStatus.approvedBy = req.user.id;
    order.approvalStatus.approvedAt = new Date();

    // Add to timeline
    order.timeline.push({
      status: 'approved',
      note: note || 'Order approved by admin',
      updatedBy: req.user.id
    });

    // Add admin note if provided
    if (note) {
      order.notes.admin = order.notes.admin ?
        `${order.notes.admin}\n\n[${new Date().toISOString()}] ${note}` : note;
    }

    await order.save();

    // Send notification to customer
    await sendOrderStatusNotification(order, 'pending', 'approved');

    res.json({
      success: true,
      data: order,
      message: 'Order approved successfully'
    });
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while approving order'
    });
  }
};

// @desc    Reject order
// @route   PUT /api/admin/orders/:id/reject
// @access  Private/Admin
const rejectOrder = async (req, res) => {
  try {
    const { rejectionReason, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Order can only be rejected when in pending status'
      });
    }

    // Update order rejection status
    order.status = 'rejected';
    order.approvalStatus.approved = false;
    order.approvalStatus.rejectedBy = req.user.id;
    order.approvalStatus.rejectedAt = new Date();
    order.approvalStatus.rejectionReason = rejectionReason;

    // Add to timeline
    order.timeline.push({
      status: 'rejected',
      note: note || `Order rejected: ${rejectionReason.code}`,
      updatedBy: req.user.id
    });

    // Add admin note
    const rejectionNote = `Order rejected - Reason: ${rejectionReason.code}${rejectionReason.details ? ` - ${rejectionReason.details}` : ''}${note ? ` - Admin note: ${note}` : ''}`;
    order.notes.admin = order.notes.admin ?
      `${order.notes.admin}\n\n[${new Date().toISOString()}] ${rejectionNote}` : rejectionNote;

    // Restore inventory for rejected orders
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.inventory.trackQuantity) {
        product.inventory.quantity += item.quantity;
        await product.save();
      }
    }

    await order.save();

    // Send notification to customer
    await sendOrderStatusNotification(order, 'pending', 'rejected');

    res.json({
      success: true,
      data: order,
      message: 'Order rejected successfully'
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while rejecting order'
    });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, note, trackingNumber, carrier } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const oldStatus = order.status;
    order.status = status;

    // Handle status-specific updates
    switch (status) {
      case 'packing':
        if (oldStatus !== 'packing') {
          order.packingStartedAt = new Date();
        }
        break;
      case 'shipped':
        if (oldStatus === 'packing') {
          order.packingCompletedAt = new Date();
          if (order.packingStartedAt) {
            order.actualPackingTime = (order.packingCompletedAt - order.packingStartedAt) / (1000 * 60 * 60); // hours
          }
        }
        order.shipping.shippedAt = new Date();
        if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
        if (carrier) order.shipping.carrier = carrier;
        break;
      case 'out_for_delivery':
        // This status indicates the package is with delivery service
        break;
      case 'delivered':
        order.shipping.deliveredAt = new Date();
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        if (note) order.cancelReason = note;
        break;
    }

    // Add to timeline
    order.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user.id
    });

    // Add admin note if provided
    if (note) {
      order.notes.admin = order.notes.admin ?
        `${order.notes.admin}\n\n[${new Date().toISOString()}] ${note}` : note;
    }

    await order.save();

    // Send notification to customer for important status changes
    await sendOrderStatusNotification(order, oldStatus, status);

    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating order status'
    });
  }
};

// @desc    Bulk update orders
// @route   PUT /api/admin/orders/bulk-update
// @access  Private/Admin
const bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, action, data } = req.body;

    const orders = await Order.find({ _id: { $in: orderIds } });
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No orders found'
      });
    }

    const results = [];

    for (const order of orders) {
      try {
        switch (action) {
          case 'approve':
            if (order.status === 'pending') {
              order.status = 'approved';
              order.approvalStatus.approved = true;
              order.approvalStatus.approvedBy = req.user.id;
              order.approvalStatus.approvedAt = new Date();
              order.timeline.push({
                status: 'approved',
                note: data.note || 'Bulk approved by admin',
                updatedBy: req.user.id
              });
            }
            break;
          case 'reject':
            if (order.status === 'pending') {
              order.status = 'rejected';
              order.approvalStatus.approved = false;
              order.approvalStatus.rejectedBy = req.user.id;
              order.approvalStatus.rejectedAt = new Date();
              order.approvalStatus.rejectionReason = data.rejectionReason;
              order.timeline.push({
                status: 'rejected',
                note: data.note || 'Bulk rejected by admin',
                updatedBy: req.user.id
              });
            }
            break;
          case 'update_status':
            order.status = data.status;
            order.timeline.push({
              status: data.status,
              note: data.note || `Bulk status update to ${data.status}`,
              updatedBy: req.user.id
            });
            break;
          case 'assign':
            order.assignedTo = data.assignedTo;
            order.timeline.push({
              status: order.status,
              note: data.note || 'Order assigned',
              updatedBy: req.user.id
            });
            break;
          case 'update_priority':
            order.priority = data.priority;
            break;
        }

        await order.save();
        results.push({ orderId: order._id, success: true });
      } catch (error) {
        results.push({ orderId: order._id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Bulk operation completed. ${results.filter(r => r.success).length}/${results.length} orders updated successfully.`
    });
  } catch (error) {
    console.error('Bulk update orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while performing bulk update'
    });
  }
};

// @desc    Assign order to admin
// @route   PUT /api/admin/orders/:id/assign
// @access  Private/Admin
const assignOrder = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify the assigned user is an admin
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || assignedUser.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Can only assign orders to admin users'
      });
    }

    order.assignedTo = assignedTo;

    // Add to timeline
    order.timeline.push({
      status: order.status,
      note: `Order assigned to ${assignedUser.firstName} ${assignedUser.lastName}`,
      updatedBy: req.user.id
    });

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Order assigned successfully'
    });
  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while assigning order'
    });
  }
};

// @desc    Update order priority
// @route   PUT /api/admin/orders/:id/priority
// @access  Private/Admin
const updateOrderPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const oldPriority = order.priority;
    order.priority = priority;

    // Add to timeline
    order.timeline.push({
      status: order.status,
      note: `Priority updated from ${oldPriority} to ${priority}`,
      updatedBy: req.user.id
    });

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Order priority updated successfully'
    });
  } catch (error) {
    console.error('Update order priority error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating order priority'
    });
  }
};

module.exports = {
  getDashboardStats,
  getCustomers,
  getCustomerDetails,
  updateCustomerStatus,
  getSalesAnalytics,
  getAdminOrders,
  getAdminOrderDetails,
  approveOrder,
  rejectOrder,
  updateOrderStatusAdmin,
  bulkUpdateOrders,
  assignOrder,
  updateOrderPriority
};
