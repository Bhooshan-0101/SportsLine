// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Application Routes
export const ROUTES = {
  // Public Routes
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Customer Routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  BULK_JERSEY_ORDER: '/bulk-jersey-order',
  BULK_ORDERS: '/bulk-orders',
  BULK_ORDER_DETAIL: '/bulk-orders/:id',
  WISHLIST: '/wishlist',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_NEW: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id/edit',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_BULK_ORDERS: '/admin/bulk-orders',
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  { value: 'jerseys', label: 'Jerseys', icon: '👕' },
  { value: 'sports-kits', label: 'Sports Kits', icon: '🏃' },
  { value: 'trophies', label: 'Trophies', icon: '🏆' },
  { value: 'equipment', label: 'Equipment', icon: '⚽' },
  { value: 'accessories', label: 'Accessories', icon: '🎽' },
];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.RETURNED]: 'Returned',
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.CONFIRMED]: 'info',
  [ORDER_STATUS.PROCESSING]: 'primary',
  [ORDER_STATUS.SHIPPED]: 'secondary',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'error',
  [ORDER_STATUS.RETURNED]: 'default',
};

// Bulk Order Status
export const BULK_ORDER_STATUS = {
  PENDING_REVIEW: 'pending_review',
  DESIGN_APPROVAL_NEEDED: 'design_approval_needed',
  APPROVED: 'approved',
  IN_PRODUCTION: 'in_production',
  QUALITY_CHECK: 'quality_check',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold',
};

export const BULK_ORDER_STATUS_LABELS = {
  [BULK_ORDER_STATUS.PENDING_REVIEW]: 'Pending Review',
  [BULK_ORDER_STATUS.DESIGN_APPROVAL_NEEDED]: 'Design Approval Needed',
  [BULK_ORDER_STATUS.APPROVED]: 'Approved',
  [BULK_ORDER_STATUS.IN_PRODUCTION]: 'In Production',
  [BULK_ORDER_STATUS.QUALITY_CHECK]: 'Quality Check',
  [BULK_ORDER_STATUS.READY_FOR_DELIVERY]: 'Ready for Delivery',
  [BULK_ORDER_STATUS.COMPLETED]: 'Completed',
  [BULK_ORDER_STATUS.CANCELLED]: 'Cancelled',
  [BULK_ORDER_STATUS.ON_HOLD]: 'On Hold',
};

export const BULK_ORDER_STATUS_COLORS = {
  [BULK_ORDER_STATUS.PENDING_REVIEW]: 'warning',
  [BULK_ORDER_STATUS.DESIGN_APPROVAL_NEEDED]: 'info',
  [BULK_ORDER_STATUS.APPROVED]: 'success',
  [BULK_ORDER_STATUS.IN_PRODUCTION]: 'primary',
  [BULK_ORDER_STATUS.QUALITY_CHECK]: 'secondary',
  [BULK_ORDER_STATUS.READY_FOR_DELIVERY]: 'success',
  [BULK_ORDER_STATUS.COMPLETED]: 'success',
  [BULK_ORDER_STATUS.CANCELLED]: 'error',
  [BULK_ORDER_STATUS.ON_HOLD]: 'default',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf'],
    ALL: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  },
  UPLOAD_PATHS: {
    PRODUCTS: '/uploads/products',
    JERSEYS: '/uploads/jerseys',
    AVATARS: '/uploads/avatars',
  },
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
  LIMITS: [6, 12, 24, 48],
};

// Sort Options
export const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'price_asc', label: 'Price Low to High' },
  { value: 'price_desc', label: 'Price High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
];

// Jersey Sizes
export const JERSEY_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Jersey Materials
export const JERSEY_MATERIALS = [
  { value: 'polyester', label: 'Polyester' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'cotton-polyester', label: 'Cotton-Polyester Blend' },
  { value: 'dri-fit', label: 'Dri-FIT' },
  { value: 'mesh', label: 'Mesh' },
];

// Jersey Styles
export const JERSEY_STYLES = [
  { value: 'home', label: 'Home' },
  { value: 'away', label: 'Away' },
  { value: 'third', label: 'Third' },
  { value: 'training', label: 'Training' },
  { value: 'goalkeeper', label: 'Goalkeeper' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
];

// Shipping Methods
export const SHIPPING_METHODS = [
  {
    value: 'standard',
    label: 'Standard Shipping',
    description: '5-7 business days',
    price: 99,
    freeThreshold: 2000
  },
  {
    value: 'express',
    label: 'Express Shipping',
    description: '2-3 business days',
    price: 199
  },
  {
    value: 'overnight',
    label: 'Overnight Shipping',
    description: 'Next business day',
    price: 399
  },
];

// Tax Configuration (GST for India)
export const TAX_CONFIG = {
  DEFAULT_RATE: 0.18, // 18% GST
  RATES_BY_STATE: {
    // GST rates in India
    'Andhra Pradesh': 0.18,
    'Karnataka': 0.18,
    'Tamil Nadu': 0.18,
    'Kerala': 0.18,
    'Maharashtra': 0.18,
    // All states have same GST rate for sports goods
  },
};

// Currency
export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  DESCRIPTION: {
    MAX_LENGTH: 2000,
  },
  SHORT_DESCRIPTION: {
    MAX_LENGTH: 200,
  },
  PHONE: {
    PATTERN: /^\+?[\d\s-()]+$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches',
  WISHLIST: 'wishlist',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  REGISTER: 'Registration successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  ITEM_ADDED_TO_CART: 'Item added to cart!',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart!',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled successfully!',
  BULK_ORDER_SUBMITTED: 'Bulk order submitted successfully!',
  PRODUCT_CREATED: 'Product created successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
};

// Feature Flags
export const FEATURES = {
  WISHLIST: true,
  REVIEWS: true,
  RECOMMENDATIONS: true,
  LIVE_CHAT: false,
  SOCIAL_LOGIN: false,
  MULTI_CURRENCY: false,
  MULTI_LANGUAGE: false,
};

export default {
  API_CONFIG,
  ROUTES,
  PRODUCT_CATEGORIES,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  BULK_ORDER_STATUS,
  BULK_ORDER_STATUS_LABELS,
  BULK_ORDER_STATUS_COLORS,
  USER_ROLES,
  FILE_UPLOAD,
  PAGINATION,
  SORT_OPTIONS,
  JERSEY_SIZES,
  JERSEY_MATERIALS,
  JERSEY_STYLES,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  TAX_CONFIG,
  CURRENCY,
  DATE_FORMATS,
  VALIDATION,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
};
