import axios from 'axios';

// Create axios instance with base configuration
// Use direct connection to avoid proxy issues
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug logging
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Base URL:', config.baseURL);
    console.log('Full URL will be:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Debug logging
    console.error('API Error:', error.message, error.config?.url, error.response?.status);

    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access denied. You do not have permission to perform this action.');
          break;
        case 404:
          console.error('Resource not found.');
          break;
        case 422:
          // Validation errors
          if (response.data.errors) {
            const errorMessages = Object.values(response.data.errors).flat();
            console.error('Validation errors:', errorMessages);
          } else {
            console.error('Validation error:', response.data.error);
          }
          break;
        case 429:
          console.error('Too many requests. Please try again later.');
          break;
        case 500:
          console.error('Server error. Please try again later.');
          break;
        default:
          console.error('API Error:', response.data.error || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error. Please check your connection.');
    } else {
      console.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password, isAdmin = false) => {
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
    return api.post(endpoint, { email, password });
  },
  
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  
  getProfile: () => {
    return api.get('/auth/me');
  },
  
  updateProfile: (userData) => {
    return api.put('/auth/profile', userData);
  },
  
  changePassword: (currentPassword, newPassword) => {
    return api.put('/auth/change-password', { currentPassword, newPassword });
  },
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => {
    return api.get('/products', { params });
  },
  
  getProduct: (id) => {
    return api.get(`/products/${id}`);
  },
  
  createProduct: (productData) => {
    return api.post('/products', productData);
  },
  
  updateProduct: (id, productData) => {
    return api.put(`/products/${id}`, productData);
  },
  
  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },
  
  getCategories: () => {
    return api.get('/products/categories');
  },
  
  getBrands: () => {
    return api.get('/products/brands');
  },
};

// Cart API
export const cartAPI = {
  getCart: () => {
    return api.get('/orders/cart');
  },
  
  addToCart: (productId, quantity, size, color, customization) => {
    return api.post('/orders/cart', {
      productId,
      quantity,
      size,
      color,
      customization
    });
  },
  
  updateCartItem: (itemId, quantity) => {
    return api.put(`/orders/cart/${itemId}`, { quantity });
  },
  
  removeFromCart: (itemId) => {
    return api.delete(`/orders/cart/${itemId}`);
  },
  
  clearCart: () => {
    return api.delete('/orders/cart');
  },
};

// Orders API
export const ordersAPI = {
  getOrders: (params = {}) => {
    return api.get('/orders', { params });
  },
  
  getOrder: (id) => {
    return api.get(`/orders/${id}`);
  },
  
  createOrder: (orderData) => {
    return api.post('/orders', orderData);
  },
  
  updateOrderStatus: (id, status) => {
    return api.put(`/orders/${id}/status`, { status });
  },
  
  cancelOrder: (id, reason) => {
    return api.put(`/orders/${id}/cancel`, { reason });
  },
};

// Bulk Orders API
export const bulkOrdersAPI = {
  getBulkOrders: (params = {}) => {
    return api.get('/bulk-orders', { params });
  },
  
  getBulkOrder: (id) => {
    return api.get(`/bulk-orders/${id}`);
  },
  
  createBulkOrder: (orderData) => {
    return api.post('/bulk-orders', orderData);
  },
  
  updateBulkOrderStatus: (id, status, note) => {
    return api.put(`/bulk-orders/${id}/status`, { status, note });
  },
  
  assignBulkOrder: (id, adminId) => {
    return api.put(`/bulk-orders/${id}/assign`, { adminId });
  },
  
  updateBulkOrderPriority: (id, priority) => {
    return api.put(`/bulk-orders/${id}/priority`, { priority });
  },
};

// Admin API
export const adminAPI = {
  getDashboard: () => {
    return api.get('/admin/dashboard');
  },

  getCustomers: (params = {}) => {
    return api.get('/admin/customers', { params });
  },

  getCustomer: (id) => {
    return api.get(`/admin/customers/${id}`);
  },

  updateCustomerStatus: (id, isActive) => {
    return api.put(`/admin/customers/${id}/status`, { isActive });
  },

  getSalesAnalytics: (params = {}) => {
    return api.get('/admin/analytics/sales', { params });
  },

  exportInventory: () => {
    return api.get('/admin/inventory/export', { responseType: 'blob' });
  },

  // Admin Order Management
  getAdminOrders: (params = {}) => {
    return api.get('/admin/orders', { params });
  },

  getAdminOrderDetails: (id) => {
    return api.get(`/admin/orders/${id}`);
  },

  approveOrder: (id, data = {}) => {
    return api.put(`/admin/orders/${id}/approve`, data);
  },

  rejectOrder: (id, data) => {
    return api.put(`/admin/orders/${id}/reject`, data);
  },

  updateOrderStatusAdmin: (id, data) => {
    return api.put(`/admin/orders/${id}/status`, data);
  },

  assignOrder: (id, assignedTo) => {
    return api.put(`/admin/orders/${id}/assign`, { assignedTo });
  },

  updateOrderPriority: (id, priority) => {
    return api.put(`/admin/orders/${id}/priority`, { priority });
  },

  bulkUpdateOrders: (data) => {
    return api.put('/admin/orders/bulk-update', data);
  },
};

// Notification API
export const notificationAPI = {
  getUserNotifications: (userId, params = {}) => {
    return api.get(`/users/${userId}/notifications`, { params });
  },

  markAsRead: (userId, notificationId) => {
    return api.put(`/users/${userId}/notifications/${notificationId}/read`);
  },

  markAllAsRead: (userId) => {
    return api.put(`/users/${userId}/notifications/read-all`);
  },

  getUnreadCount: (userId) => {
    return api.get(`/users/${userId}/notifications/unread-count`);
  },
};

// Upload API
export const uploadAPI = {
  uploadJerseyDesign: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('designs', file));
    
    return api.post('/upload/jersey-design', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadProductImages: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    return api.post('/upload/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteFile: (type, filename) => {
    return api.delete(`/upload/${type}/${filename}`);
  },
  
  getFileInfo: (type, filename) => {
    return api.get(`/upload/${type}/${filename}/info`);
  },
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: (userId) => {
    return api.get(`/users/${userId}/wishlist`);
  },
  
  addToWishlist: (userId, productId) => {
    return api.post(`/users/${userId}/wishlist`, { productId });
  },
  
  removeFromWishlist: (userId, productId) => {
    return api.delete(`/users/${userId}/wishlist/${productId}`);
  },
};

// Health check
export const healthAPI = {
  check: () => {
    return api.get('/health');
  },
};

export default api;
