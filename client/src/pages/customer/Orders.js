import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Receipt,
  LocalShipping,
  CheckCircle,
  Cancel,
  Visibility,
  ExpandMore,
  ExpandLess,
  ShoppingBag,
  CalendarToday
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { formatCurrency as formatCurrencyUtil } from '../../utils/currency';
const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);

  const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'primary',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'error',
    returned: 'default'
  };

  const statusIcons = {
    pending: <Receipt />,
    confirmed: <CheckCircle />,
    processing: <Receipt />,
    shipped: <LocalShipping />,
    delivered: <CheckCircle />,
    cancelled: <Cancel />,
    returned: <Cancel />
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '10'
      };

      if (statusFilter) params.status = statusFilter;

      const response = await ordersAPI.getOrders(params);
      setOrders(response.data.data);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount);
  };

  const getOrderProgress = (status) => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading && orders.length === 0) {
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          My Orders
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 && !loading ? (
        /* Empty State */
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {statusFilter ? 
              `No orders with status "${statusFilter}"` : 
              "You haven't placed any orders yet"
            }
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            size="large"
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <>
          {/* Orders List */}
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card elevation={2}>
                  <CardContent>
                    {/* Order Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Order #{order.orderNumber}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Placed on {formatDate(order.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          icon={statusIcons[order.status]}
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          color={statusColors[order.status]}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(order.pricing?.total || 0)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Order Summary */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {order.items?.length || 0} items • {order.shippingMethod || 'Standard'} shipping
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          component={Link}
                          to={`/orders/${order._id}`}
                          startIcon={<Visibility />}
                        >
                          View Details
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => toggleOrderExpansion(order._id)}
                        >
                          {expandedOrder === order._id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Order Progress */}
                    {order.status !== 'cancelled' && order.status !== 'returned' && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Order Progress
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(getOrderProgress(order.status))}%
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 6 }}>
                          <Box
                            sx={{
                              width: `${getOrderProgress(order.status)}%`,
                              bgcolor: statusColors[order.status] + '.main',
                              height: '100%',
                              borderRadius: 1,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Expanded Order Details */}
                    <Collapse in={expandedOrder === order._id}>
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Order Items */}
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Order Items
                      </Typography>
                      <List dense>
                        {order.items?.map((item, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar
                                src={item.product?.images?.[0]?.url}
                                alt={item.product?.name}
                                variant="rounded"
                                sx={{ width: 50, height: 50 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {item.product?.name}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Quantity: {item.quantity} • {formatCurrency(item.price)} each
                                  </Typography>
                                  {item.variants && Object.keys(item.variants).length > 0 && (
                                    <Box sx={{ mt: 0.5 }}>
                                      {Object.entries(item.variants).map(([key, value]) => (
                                        <Chip
                                          key={key}
                                          label={`${key}: ${value}`}
                                          size="small"
                                          variant="outlined"
                                          sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                  {item.customization && (
                                    <Box sx={{ mt: 0.5 }}>
                                      {item.customization.playerName && (
                                        <Chip
                                          label={`Name: ${item.customization.playerName}`}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                          sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                      )}
                                      {item.customization.playerNumber && (
                                        <Chip
                                          label={`Number: ${item.customization.playerNumber}`}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                          sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              }
                            />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(item.price * item.quantity)}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Shipping Address
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {order.shippingAddress.name}<br />
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </Typography>
                        </Box>
                      )}

                      {/* Tracking Information */}
                      {order.trackingNumber && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Tracking Information
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tracking Number: {order.trackingNumber}
                          </Typography>
                        </Box>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CustomerOrders;
