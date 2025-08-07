import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

// Loading component for authentication checks
const AuthLoading = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1976d215 0%, #dc004e15 100%)'
    }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
        Authenticating...
      </Typography>
    </motion.div>
  </Box>
);

// Protected Route Component - Requires authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Role-based Route Component - Requires specific role
const RoleBasedRoute = ({ children, allowedRoles = [], redirectPath = '/' }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const userRole = user?.role;
  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);

  // Redirect if user doesn't have required role
  if (!hasRequiredRole) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Admin Only Route Component
const AdminRoute = ({ children }) => {
  return (
    <RoleBasedRoute 
      allowedRoles={['admin']} 
      redirectPath="/dashboard"
    >
      {children}
    </RoleBasedRoute>
  );
};

// Customer Only Route Component
const CustomerRoute = ({ children }) => {
  return (
    <RoleBasedRoute 
      allowedRoles={['customer']} 
      redirectPath="/admin/dashboard"
    >
      {children}
    </RoleBasedRoute>
  );
};

// Public Route Component - Redirects authenticated users to their dashboard
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, getRoleBasedRedirectPath } = useAuth();

  // If user is authenticated, redirect to their role-based dashboard
  if (isAuthenticated && user) {
    const redirectPath = getRoleBasedRedirectPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Role-based Redirect Component - Automatically redirects based on user role
const RoleBasedRedirect = () => {
  const { isAuthenticated, user, getRoleBasedRedirectPath } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const redirectPath = getRoleBasedRedirectPath(user.role);
  return <Navigate to={redirectPath} replace />;
};

export { 
  ProtectedRoute, 
  RoleBasedRoute, 
  AdminRoute, 
  CustomerRoute, 
  PublicRoute,
  RoleBasedRedirect,
  AuthLoading 
};
