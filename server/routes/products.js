const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands
} = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['jerseys', 'sports-kits', 'trophies', 'equipment', 'accessories'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('inventory.lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer')
];

const productUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['jerseys', 'sports-kits', 'trophies', 'equipment', 'accessories'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .custom(value => {
      if (value === undefined || value === null || value === '') return true;
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) throw new Error('Price must be a positive number');
      return true;
    }),
  body('comparePrice')
    .optional()
    .custom(value => {
      if (value === undefined || value === null || value === '') return true;
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) throw new Error('Compare price must be a positive number');
      return true;
    }),
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('inventory.lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer')
];

// Routes
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/', getProducts);
router.get('/:id', optionalAuth, getProduct);
router.post('/', protect, adminOnly, productValidation, createProduct);
router.put('/:id', protect, adminOnly, productUpdateValidation, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
