const express = require('express');
const { body } = require('express-validator');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  body('size')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Size must be between 1 and 10 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Color must be between 1 and 20 characters')
];

const updateCartValidation = [
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10')
];

const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be at least 1'),
  body('shippingAddress.firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required'),
  body('shippingAddress.lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Valid zip code is required'),
  body('payment.method')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'])
    .withMessage('Invalid payment method'),
  body('shipping.method')
    .isIn(['standard', 'express', 'overnight', 'pickup'])
    .withMessage('Invalid shipping method')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters')
];

// Cart routes
router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCartValidation, addToCart);
router.put('/cart/:itemId', protect, updateCartValidation, updateCartItem);
router.delete('/cart/:itemId', protect, removeFromCart);
router.delete('/cart', protect, clearCart);

// Order routes
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrderValidation, createOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatusValidation, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
