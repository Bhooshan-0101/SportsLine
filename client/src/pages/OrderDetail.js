import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,

  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,

  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '../components/common/Timeline';
import {
  ArrowBack,
  LocalShipping,
  CheckCircle,
  Cancel,
  Receipt,
  ShoppingBag,
  LocationOn,

  NavigateNext
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

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
    processing: <ShoppingBag />,
    shipped: <LocalShipping />,
    delivered: <CheckCircle />,
    cancelled: <Cancel />,
    returned: <Cancel />
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrder(id);
      setOrder(response.data.data);
      setError('');
    } catch (err) {
      setError('Order not found');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    try {
      await ordersAPI.cancelOrder(id, cancelReason);
      
      toast.success('Order cancelled successfully');
      setCancelDialogOpen(false);
      fetchOrder(); // Refresh order data
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTimeline = () => {
    if (!order?.timeline) return null;

    return (
      <Timeline>
        {order.timeline.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={statusColors[event.status] || 'grey'}>
                {statusIcons[event.status] || <Receipt />}
              </TimelineDot>
              {index < order.timeline.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6" component="span">
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Typography>
              <Typography color="text.secondary">
                {formatDate(event.timestamp || event.createdAt)}
              </Typography>
              {event.note && (
                <Typography variant="body2" color="text.secondary">
                  {event.note}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
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

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Order not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover">
          Home
        </Link>
        <Link component={RouterLink} to="/orders" underline="hover">
          Orders
        </Link>
        <Typography color="text.primary">Order #{order.orderNumber}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ mr: 2 }}
        >
          Back to Orders
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Order #{order.orderNumber}
        </Typography>
        <Chip
          icon={statusIcons[order.status]}
          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          color={statusColors[order.status]}
          size="large"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={8}>
          {/* Order Items */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Items ({order.items?.length || 0})
            </Typography>
            <List>
              {order.items?.map((item, index) => (
                <ListItem key={index} sx={{ px: 0, py: 2 }}>
                  <ListItemAvatar>
                    <Avatar
                      src={item.product?.images?.[0]?.url}
                      alt={item.name}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ ml: 2 }}
                    primary={
                      <Typography variant="h6">
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity} × ₹{item.price} = ₹{item.subtotal?.toFixed(2)}
                        </Typography>
                        {(item.size || item.color) && (
                          <Typography variant="body2" color="text.secondary">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' • '}
                            {item.color && `Color: ${item.color}`}
                          </Typography>
                        )}
                        {item.customization && (
                          <Box sx={{ mt: 1 }}>
                            {item.customization.playerName && (
                              <Chip
                                label={`Name: ${item.customization.playerName}`}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1, mb: 0.5 }}
                              />
                            )}
                            {item.customization.playerNumber && (
                              <Chip
                                label={`Number: ${item.customization.playerNumber}`}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1, mb: 0.5 }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Shipping Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2">Shipping Address</Typography>
                </Box>
                <Typography variant="body2">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
                  {order.shippingAddress?.street}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalShipping sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2">Shipping Method</Typography>
                </Box>
                <Typography variant="body2">
                  {order.shipping?.method?.charAt(0).toUpperCase() + order.shipping?.method?.slice(1)} Shipping
                </Typography>
                {order.shipping?.trackingNumber && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Tracking Number: {order.shipping.trackingNumber}
                    </Typography>
                    {order.shipping.carrier && (
                      <Typography variant="body2" color="text.secondary">
                        Carrier: {order.shipping.carrier}
                      </Typography>
                    )}
                  </Box>
                )}
                {order.shipping?.estimatedDelivery && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Estimated Delivery: {formatDate(order.shipping.estimatedDelivery)}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Order Timeline */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Timeline
            </Typography>
            {renderTimeline()}
          </Paper>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>₹{order.pricing?.subtotal?.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax (GST):</Typography>
              <Typography>₹{order.pricing?.tax?.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Shipping:</Typography>
              <Typography>
                {order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing?.shipping?.toFixed(2)}`}
              </Typography>
            </Box>
            {order.pricing?.discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="success.main">Discount:</Typography>
                <Typography color="success.main">-₹{order.pricing.discount.toFixed(2)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ₹{order.pricing?.total?.toFixed(2)}
              </Typography>
            </Box>
          </Paper>

          {/* Payment Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Typography variant="body2">
              Method: {order.payment?.method?.replace('_', ' ').toUpperCase()}
            </Typography>
            <Typography variant="body2">
              Status: {order.payment?.status?.charAt(0).toUpperCase() + order.payment?.status?.slice(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Order Date: {formatDate(order.createdAt)}
            </Typography>
          </Paper>

          {/* Order Actions */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {order.status === 'pending' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  fullWidth
                >
                  Cancel Order
                </Button>
              )}
              
              {order.status === 'delivered' && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Handle reorder
                    console.log('Reorder:', order._id);
                  }}
                  fullWidth
                >
                  Reorder Items
                </Button>
              )}
              
              <Button
                variant="outlined"
                onClick={() => window.print()}
                fullWidth
              >
                Print Order
              </Button>
              
              <Button
                variant="outlined"
                component={RouterLink}
                to="/orders"
                fullWidth
              >
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this order? This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            label="Reason for cancellation"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Please provide a reason for cancelling this order..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Order
          </Button>
          <Button
            onClick={handleCancelOrder}
            color="error"
            variant="contained"
            disabled={cancelling || !cancelReason.trim()}
          >
            {cancelling ? <CircularProgress size={20} /> : 'Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetail;
