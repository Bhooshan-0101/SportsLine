import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Console filter removed to prevent errors

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Route Protection Components
import {
  ProtectedRoute,
  AdminRoute,
  CustomerRoute,
  PublicRoute,
  RoleBasedRedirect
} from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import CustomerProducts from './pages/customer/Products';
import CustomerProductDetail from './pages/customer/ProductDetail';
import CustomerCart from './pages/customer/Cart';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerOrders from './pages/customer/Orders';
import Wishlist from './pages/customer/Wishlist';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import BulkJerseyOrder from './pages/BulkJerseyOrder';
import BulkOrders from './pages/BulkOrders';
import BulkOrderDetail from './pages/BulkOrderDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminBulkOrders from './pages/admin/AdminBulkOrders';
import ProductForm from './pages/admin/ProductForm';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminInventory from './pages/admin/AdminInventory';

// Utility function to safely handle gradients with MUI color functions
const createSafeGradient = (gradient) => {
  // Return the gradient as-is for background properties
  // For MUI color functions, use the first color from the gradient
  const firstColor = gradient.match(/#[A-Fa-f0-9]{6}/)?.[0] || '#FDD835';
  return {
    gradient: gradient,
    color: firstColor
  };
};

// Define gradient constants
const GRADIENTS = {
  primary: createSafeGradient('linear-gradient(45deg, #FDD835, #FFEB3B)'),
  secondary: createSafeGradient('linear-gradient(45deg, #FDD835, #FFEB3B)'),
  light: createSafeGradient('linear-gradient(45deg, #FFEB3B, #FFF176)'),
  dark: createSafeGradient('linear-gradient(45deg, #F57F17, #FDD835)'),
};

// Create theme with clean white background and yellow gradients
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FDD835', // Yellow
      light: '#FFEB3B',
      dark: '#F57F17',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FDD835', // Also yellow for consistency
      light: '#FFEB3B',
      dark: '#F57F17',
      contrastText: '#000000',
    },
    background: {
      default: '#FFFFFF', // Pure white background
      paper: '#FFFFFF', // Pure white for cards
    },
    text: {
      primary: '#000000', // Pure black text
      secondary: '#424242', // Dark gray for secondary text
    },
    grey: {
      50: '#F5F5F5',
      100: '#EEEEEE',
      200: '#E0E0E0',
      300: '#BDBDBD',
      400: '#9E9E9E',
      500: '#757575',
      600: '#616161',
      700: '#424242',
      800: '#303030',
      900: '#212121',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FDD835', // Yellow for warnings
      light: '#FFEB3B',
      dark: '#F57F17',
    },
    error: {
      main: '#F44336', // Red for errors
      light: '#EF5350',
      dark: '#C62828',
    },
    // Custom gradient colors - SAFE for MUI color functions
    gradient: {
      main: GRADIENTS.primary.color, // Use solid color for MUI functions
      light: GRADIENTS.light.color,
      dark: GRADIENTS.dark.color,
    },
  },
  // Add gradient utilities to theme
  gradients: GRADIENTS,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: GRADIENTS.primary.gradient,
          color: '#000000',
          fontWeight: 'bold',
          '&:hover': {
            background: GRADIENTS.dark.gradient,
            boxShadow: '0 6px 20px rgba(253, 216, 53, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        containedSecondary: {
          background: GRADIENTS.secondary.gradient,
          color: '#000000',
          fontWeight: 'bold',
          '&:hover': {
            background: GRADIENTS.dark.gradient,
            boxShadow: '0 6px 20px rgba(253, 216, 53, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#FDD835',
          color: '#000000',
          '&:hover': {
            borderWidth: 2,
            borderColor: '#F57F17',
            backgroundColor: 'rgba(253, 216, 53, 0.1)',
            boxShadow: '0 4px 12px rgba(253, 216, 53, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          boxShadow: '0 4px 6px -1px rgba(253, 216, 53, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(253, 216, 53, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(253, 216, 53, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-4px)',
            borderColor: 'rgba(253, 216, 53, 0.6)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          color: '#000000',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: 'rgba(253, 216, 53, 0.5)',
            },
            '&:hover fieldset': {
              borderColor: '#FDD835',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#F57F17',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#424242',
            '&.Mui-focused': {
              color: '#F57F17',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#000000',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            background: GRADIENTS.primary.gradient,
            color: '#000000',
          },
          '&.MuiChip-colorSecondary': {
            background: GRADIENTS.secondary.gradient,
            color: '#000000',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: GRADIENTS.primary.gradient,
          color: '#000000',
          boxShadow: '0 4px 6px rgba(253, 216, 53, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          borderRight: '1px solid rgba(253, 216, 53, 0.3)',
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
              <Navbar />
              <main style={{ minHeight: 'calc(100vh - 140px)' }}>
                <Routes>
                  {/* Public Routes - Redirect authenticated users to their dashboard */}
                  <Route path="/" element={
                    <PublicRoute>
                      <Home />
                    </PublicRoute>
                  } />
                  <Route path="/products" element={<CustomerProducts />} />
                  <Route path="/products/:id" element={<CustomerProductDetail />} />
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />

                  {/* Role-based Redirect Route */}
                  <Route path="/redirect" element={<RoleBasedRedirect />} />
                  
                  {/* Customer Protected Routes */}
                  <Route path="/dashboard" element={
                    <CustomerRoute>
                      <CustomerDashboard />
                    </CustomerRoute>
                  } />
                  <Route path="/customer-home" element={
                    <CustomerRoute>
                      <CustomerHome />
                    </CustomerRoute>
                  } />
                  <Route path="/profile" element={
                    <CustomerRoute>
                      <Profile />
                    </CustomerRoute>
                  } />
                  <Route path="/wishlist" element={
                    <CustomerRoute>
                      <Wishlist />
                    </CustomerRoute>
                  } />
                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <CustomerCart />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <CustomerRoute>
                      <Checkout />
                    </CustomerRoute>
                  } />
                  <Route path="/orders" element={
                    <CustomerRoute>
                      <CustomerOrders />
                    </CustomerRoute>
                  } />
                  <Route path="/orders/:id" element={
                    <CustomerRoute>
                      <OrderDetail />
                    </CustomerRoute>
                  } />
                  <Route path="/bulk-jersey-order" element={
                    <CustomerRoute>
                      <BulkJerseyOrder />
                    </CustomerRoute>
                  } />
                  <Route path="/bulk-orders" element={
                    <CustomerRoute>
                      <BulkOrders />
                    </CustomerRoute>
                  } />
                  <Route path="/bulk-orders/:id" element={
                    <CustomerRoute>
                      <BulkOrderDetail />
                    </CustomerRoute>
                  } />
                  
                  {/* Admin Protected Routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/dashboard" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products" element={
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products/new" element={
                    <AdminRoute>
                      <ProductForm />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products/:id/edit" element={
                    <AdminRoute>
                      <ProductForm />
                    </AdminRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  } />
                  <Route path="/admin/orders/:id" element={
                    <AdminRoute>
                      <AdminOrderDetail />
                    </AdminRoute>
                  } />
                  <Route path="/admin/customers" element={
                    <AdminRoute>
                      <AdminCustomers />
                    </AdminRoute>
                  } />
                  <Route path="/admin/bulk-orders" element={
                    <AdminRoute>
                      <AdminBulkOrders />
                    </AdminRoute>
                  } />

                  {/* Admin Analytics & Inventory Routes */}
                  <Route path="/admin/analytics" element={
                    <AdminRoute>
                      <AdminAnalytics />
                    </AdminRoute>
                  } />
                  <Route path="/admin/inventory" element={
                    <AdminRoute>
                      <AdminInventory />
                    </AdminRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss={true}
                draggable={false}
                pauseOnHover={true}
                theme="light"
                enableMultiContainer={false}
                containerId="default"
                style={{
                  zIndex: 9999
                }}
                toastStyle={{
                  borderRadius: '12px',
                  fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
                }}
                bodyStyle={{
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                progressStyle={{
                  background: 'linear-gradient(45deg, #FDD835, #FFEB3B)'
                }}
              />
            </div>
          </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
