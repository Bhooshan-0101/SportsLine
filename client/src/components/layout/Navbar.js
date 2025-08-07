import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
  Home,
  Store,
  SportsSoccer,
  Dashboard,
  ExitToApp,
  Person,
  Receipt,
  Favorite
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const isMenuOpen = Boolean(anchorEl);

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { text: 'Home', path: '/', icon: <Home /> },
      { text: 'Products', path: '/products', icon: <Store /> }
    ];

    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        return [
          { text: 'Admin Dashboard', path: '/admin/dashboard', icon: <Dashboard /> },
          { text: 'Products', path: '/admin/products', icon: <Store /> },
          { text: 'Orders', path: '/admin/orders', icon: <Receipt /> },
          { text: 'Customers', path: '/admin/customers', icon: <Person /> }
        ];
      } else if (user.role === 'customer') {
        return [
          { text: 'Home', path: '/customer-home', icon: <Home /> },
          { text: 'Products', path: '/products', icon: <Store /> },
          { text: 'Profile', path: '/dashboard', icon: <Dashboard /> }
        ];
      }
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {isAuthenticated ? (
        [
          <MenuItem key="dashboard" onClick={() => {
            const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
            navigate(dashboardPath);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Dashboard fontSize="small" />
            </ListItemIcon>
            {user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
          </MenuItem>,
          user?.role === 'customer' && (
            <MenuItem key="profile" onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
          ),
          <Divider key="divider" />,
          <MenuItem key="logout" onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        ]
      ) : (
        [
          <MenuItem key="login" onClick={() => { navigate('/login'); handleMenuClose(); }}>
            Login
          </MenuItem>,
          <MenuItem key="register" onClick={() => { navigate('/register'); handleMenuClose(); }}>
            Register
          </MenuItem>
        ]
      )}
    </Menu>
  );

  const drawer = (
    <Box sx={{ width: { xs: 280, sm: 250 } }} role="presentation">
      <List>
        <ListItem sx={{ py: 2 }}>
          <Typography variant="h6" sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FDD835, #FFEB3B)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            SportsLine
          </Typography>
        </ListItem>
        <Divider />
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            selected={location.pathname === item.path}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(253, 216, 53, 0.2)',
                '& .MuiListItemText-primary': {
                  color: '#000000',
                  fontWeight: 'bold'
                },
                '& .MuiListItemIcon-root': {
                  color: '#000000'
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(253, 216, 53, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
            />
          </ListItem>
        ))}
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            {user?.role === 'customer' && (
              <ListItem
                button
                component={Link}
                to="/customer-home"
                onClick={handleDrawerToggle}
                sx={{ py: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}><Home /></ListItemIcon>
                <ListItemText
                  primary="Customer Home"
                  primaryTypographyProps={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                />
              </ListItem>
            )}
            <ListItem
              button
              component={Link}
              to="/profile"
              onClick={handleDrawerToggle}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><Person /></ListItemIcon>
              <ListItemText
                primary="Profile"
                primaryTypographyProps={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
              />
            </ListItem>
            {user?.role === 'admin' && (
              <ListItem
                button
                component={Link}
                to="/admin"
                onClick={handleDrawerToggle}
                sx={{ py: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}><Dashboard /></ListItemIcon>
                <ListItemText
                  primary="Admin Dashboard"
                  primaryTypographyProps={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                />
              </ListItem>
            )}
            <Divider sx={{ my: 1 }} />
            <ListItem
              button
              onClick={() => { handleLogout(); handleDrawerToggle(); }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><ExitToApp /></ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
              />
            </ListItem>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem
              button
              component={Link}
              to="/login"
              onClick={handleDrawerToggle}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><Person /></ListItemIcon>
              <ListItemText
                primary="Login"
                primaryTypographyProps={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
              />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/register"
              onClick={handleDrawerToggle}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><Person /></ListItemIcon>
              <ListItemText
                primary="Register"
                primaryTypographyProps={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FDD835, #FFEB3B)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SportsLine
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  sx={{
                    textTransform: 'none',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    color: location.pathname === item.path ? '#000000' : '#000000',
                    '&:hover': {
                      color: '#000000',
                      backgroundColor: 'rgba(253, 216, 53, 0.2)'
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated && (
              <>
                {/* Cart Icon */}
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  aria-label="shopping cart"
                >
                  <Badge badgeContent={totalItems} color="secondary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                {/* Wishlist Icon */}
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/wishlist"
                  aria-label="wishlist"
                >
                  <Badge badgeContent={user?.wishlist?.length || 0} color="error">
                    <Favorite />
                  </Badge>
                </IconButton>
              </>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {renderMenu}
    </>
  );
};

export default Navbar;
