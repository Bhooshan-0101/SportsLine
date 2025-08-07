import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: [],
  subtotal: 0,
  totalItems: 0,
  loading: false,
  error: null
};

// Action types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOAD_CART: 'LOAD_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  CART_ERROR: 'CART_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items,
        subtotal: action.payload.subtotal,
        totalItems: action.payload.totalItems,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.ADD_ITEM:
    case CART_ACTIONS.UPDATE_ITEM:
    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: action.payload,
        subtotal: calculateSubtotal(action.payload),
        totalItems: calculateTotalItems(action.payload),
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        subtotal: 0,
        totalItems: 0,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.CART_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Helper functions
const calculateSubtotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

const calculateTotalItems = (items) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Safely get auth context - handle case where it might not be available
  let isAuthenticated = false;
  let user = null;

  try {
    const authContext = useAuth();
    isAuthenticated = authContext?.isAuthenticated || false;
    user = authContext?.user || null;
  } catch (error) {
    // AuthContext not available, use defaults
    console.warn('AuthContext not available in CartProvider, using defaults');
  }

  // Load cart
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({
        type: CART_ACTIONS.CLEAR_CART
      });
      return;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const res = await api.get('/orders/cart');
      dispatch({
        type: CART_ACTIONS.LOAD_CART,
        payload: res.data.data
      });
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.CART_ERROR,
        payload: error.response?.data?.error || 'Failed to load cart'
      });
    }
  }, [isAuthenticated]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1, variants = {}, customization = '') => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      // Extract size and color from variants object, or use empty strings if not provided
      const size = variants.size || '';
      const color = variants.color || '';

      const res = await api.post('/orders/cart', {
        productId,
        quantity,
        size: size || undefined, // Send undefined instead of empty string
        color: color || undefined // Send undefined instead of empty string
      });
      
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: res.data.data
      });
      
      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to add item to cart';
      dispatch({
        type: CART_ACTIONS.CART_ERROR,
        payload: errorMsg
      });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Update cart item
  const updateCartItem = async (itemId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const res = await api.put(`/orders/cart/${itemId}`, { quantity });
      
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM,
        payload: res.data.data
      });
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update cart item';
      dispatch({
        type: CART_ACTIONS.CART_ERROR,
        payload: errorMsg
      });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const res = await api.delete(`/orders/cart/${itemId}`);
      
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: res.data.data
      });
      
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to remove item from cart';
      dispatch({
        type: CART_ACTIONS.CART_ERROR,
        payload: errorMsg
      });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      await api.delete('/orders/cart');
      
      dispatch({
        type: CART_ACTIONS.CLEAR_CART
      });
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to clear cart';
      dispatch({
        type: CART_ACTIONS.CART_ERROR,
        payload: errorMsg
      });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  // Load cart when user authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated, user, loadCart]);

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearError,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
