import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAIL: 'REGISTER_FAIL',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  LOAD_USER_FAIL: 'LOAD_USER_FAIL',
  AUTH_ERROR: 'AUTH_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOAD_USER:
    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER_FAIL:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAIL:
    case AUTH_ACTIONS.REGISTER_FAIL:
    case AUTH_ACTIONS.AUTH_ERROR:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in localStorage (API service will pick it up via interceptor)
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = useCallback(async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
      try {
        const res = await api.get('/auth/me');
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: res.data.data
        });
      } catch (error) {
        // Clear invalid token
        localStorage.removeItem('token');
        dispatch({
          type: AUTH_ACTIONS.AUTH_ERROR,
          payload: error.response?.data?.error || 'Authentication failed'
        });
      }
    } else {
      // No token found - just set loading to false without error
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAIL
      });
    }
  }, []);

  // Get redirect path based on user role
  const getRoleBasedRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'customer':
        return '/dashboard';
      default:
        return '/';
    }
  };

  // Login user with automatic role detection
  const login = async (email, password) => {
    try {
      // Use unified login endpoint that automatically detects user role
      const res = await api.post('/auth/login', { email, password });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: res.data.data
      });

      setAuthToken(res.data.data.token);

      // Get user role and redirect path
      const userRole = res.data.data.user?.role || res.data.data.role;
      const redirectPath = getRoleBasedRedirectPath(userRole);

      toast.success(`Welcome back! Logged in as ${userRole}`);

      return {
        success: true,
        user: res.data.data.user || res.data.data,
        role: userRole,
        redirectPath: redirectPath
      };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAIL,
        payload: errorMsg
      });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: res.data.data
      });

      setAuthToken(res.data.data.token);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAIL,
        payload: errorMsg
      });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      const res = await api.put('/auth/profile', userData);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: res.data.data
      });

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Profile update failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Password change failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    setAuthToken(null);
    toast.success('Logged out successfully!');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Set auth token on state change
  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    loadUser,
    getRoleBasedRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
