import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Divider
} from '@mui/material';
import {
  ShoppingCart,
  Receipt,
  SportsSoccer,
  TrendingUp,
  LocalShipping,
  CheckCircle
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ordersAPI, bulkOrdersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, bulkOrdersRes] = await Promise.all([
        ordersAPI.getOrders({ limit: 5 }),
        bulkOrdersAPI.getBulkOrders({ limit: 3 }),
        console.log('getting')
      ]);

      setDashboardData({
        recentOrders: ordersRes.data.data,
        recentBulkOrders: bulkOrdersRes.data.data,
        orderStats: ordersRes.data.pagination,
        bulkOrderStats: bulkOrdersRes.data.pagination
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your orders and account
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Cart Items
                  </Typography>
                  <Typography variant="h4">
                    {totalItems}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Receipt sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.orderStats?.total || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SportsSoccer sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Bulk Orders
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.bulkOrderStats?.total || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Wishlist Items
                  </Typography>
                  <Typography variant="h4">
                    {user?.wishlist?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  component={Link}
                  to="/products"
                  startIcon={<ShoppingCart />}
                >
                  Browse Products
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/bulk-jersey-order"
                  startIcon={<SportsSoccer />}
                >
                  Bulk Jersey Order
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/orders"
                  startIcon={<Receipt />}
                >
                  View All Orders
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/profile"
                  startIcon={<Avatar sx={{ width: 20, height: 20 }} />}
                >
                  Edit Profile
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Orders
              </Typography>
              <Button
                component={Link}
                to="/orders"
                size="small"
              >
                View All
              </Button>
            </Box>
            
            {dashboardData?.recentOrders?.length > 0 ? (
              <List>
                {dashboardData.recentOrders.map((order, index) => (
                  <React.Fragment key={order._id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Receipt />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              Order #{order.orderNumber}
                            </Typography>
                            <Chip
                              label={order.status}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {order.items?.length} items • ₹{order.pricing?.total?.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(order.createdAt)}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                    {index < dashboardData.recentOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">
                  No orders yet
                </Typography>
                <Button
                  component={Link}
                  to="/products"
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Start Shopping
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Bulk Orders */}
        {dashboardData?.recentBulkOrders?.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Bulk Jersey Orders
                </Typography>
                <Button
                  component={Link}
                  to="/bulk-orders"
                  size="small"
                >
                  View All
                </Button>
              </Box>
              
              <List>
                {dashboardData.recentBulkOrders.map((order, index) => (
                  <React.Fragment key={order._id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <SportsSoccer />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              {order.teamName}
                            </Typography>
                            <Chip
                              label={order.status.replace('_', ' ').toUpperCase()}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {order.playerDetails?.length} players
                              {order.pricing?.total && ` • ₹${order.pricing.total.toFixed(2)}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(order.createdAt)}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                    {index < dashboardData.recentBulkOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default CustomerDashboard;
