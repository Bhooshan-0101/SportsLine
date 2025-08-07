const express = require('express');
const { body } = require('express-validator');
const {
  getBulkOrders,
  getBulkOrder,
  createBulkOrder,
  updateBulkOrderStatus,
  assignBulkOrder,
  updateBulkOrderPriority
} = require('../controllers/bulkOrderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Simplified validation rules - only validate essential fields
const createBulkOrderValidation = [
  body('teamName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Team name must be between 1 and 100 characters'),
  body('contactPerson.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact person name is required'),
  body('contactPerson.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid contact email is required'),
  body('contactPerson.phone')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Valid contact phone is required')
];

const updateStatusValidation = [
  body('status')
    .isIn([
      'pending_review',
      'design_approval_needed',
      'approved',
      'in_production',
      'quality_check',
      'ready_for_delivery',
      'completed',
      'cancelled',
      'on_hold'
    ])
    .withMessage('Invalid status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note cannot exceed 1000 characters')
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

// Routes
router.get('/', protect, getBulkOrders);
router.get('/:id', protect, getBulkOrder);
router.post('/', protect, createBulkOrder);
router.put('/:id/status', protect, adminOnly, updateStatusValidation, updateBulkOrderStatus);
router.put('/:id/assign', protect, adminOnly, assignOrderValidation, assignBulkOrder);
router.put('/:id/priority', protect, adminOnly, updatePriorityValidation, updateBulkOrderPriority);

module.exports = router;
