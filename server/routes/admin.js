const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes
router.use(protect, adminOnly);

// Validation rules
const updateCustomerStatusValidation = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

const approveOrderValidation = [
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters')
];

const rejectOrderValidation = [
  body('rejectionReason.code')
    .isIn(['insufficient_stock', 'payment_failed', 'invalid_address', 'policy_violation', 'fraud_suspected', 'customer_request', 'other'])
    .withMessage('Invalid rejection reason code'),
  body('rejectionReason.details')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection details cannot exceed 500 characters'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'packing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tracking number must be between 1 and 50 characters'),
  body('carrier')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Carrier must be between 1 and 50 characters')
];

const bulkUpdateValidation = [
  body('orderIds')
    .isArray({ min: 1 })
    .withMessage('Order IDs array is required'),
  body('orderIds.*')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('action')
    .isIn(['approve', 'reject', 'update_status', 'assign', 'update_priority'])
    .withMessage('Invalid bulk action'),
  body('data')
    .isObject()
    .withMessage('Action data is required')
];

const assignOrderValidation = [
  body('assignedTo')
    .isMongoId()
    .withMessage('Valid admin ID is required')
];

const updatePriorityValidation = [
  body('priority')
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level')
];

// Dashboard routes
router.get('/dashboard', getDashboardStats);
router.get('/analytics/sales', getSalesAnalytics);

// Customer management routes
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerDetails);
router.put('/customers/:id/status', updateCustomerStatusValidation, updateCustomerStatus);

// Admin order management routes
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderDetails);
router.put('/orders/:id/approve', approveOrderValidation, approveOrder);
router.put('/orders/:id/reject', rejectOrderValidation, rejectOrder);
router.put('/orders/:id/status', updateOrderStatusValidation, updateOrderStatusAdmin);
router.put('/orders/:id/assign', assignOrderValidation, assignOrder);
router.put('/orders/:id/priority', updatePriorityValidation, updateOrderPriority);
router.put('/orders/bulk-update', bulkUpdateValidation, bulkUpdateOrders);

module.exports = router;
