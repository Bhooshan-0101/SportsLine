import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  LocalShipping,
  Person,
  Schedule,
  Edit,
  Receipt,
  Inventory,
  PriorityHigh,
  AssignmentInd
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { toast } from '../../utils/toast';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);

  
  // Form states
  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState({ code: '', details: '' });
  const [rejectNote, setRejectNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  
  const [submitting, setSubmitting] = useState(false);

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    packing: 'info',
    shipped: 'primary',
    out_for_delivery: 'secondary',
    delivered: 'success',
    cancelled: 'error',
    returned: 'warning'
  };

  const statusIcons = {
    pending: <Schedule />,
    approved: <CheckCircle />,
    rejected: <Cancel />,
    packing: <Inventory />,
    shipped: <LocalShipping />,
    out_for_delivery: <LocalShipping />,
    delivered: <CheckCircle />,
    cancelled: <Cancel />,
    returned: <Cancel />
  };

  const priorityColors = {
    low: 'default',
    normal: 'primary',
    high: 'warning',
    urgent: 'error'
  };

  const rejectionReasons = [
    { code: 'insufficient_stock', label: 'Insufficient Stock' },
    { code: 'payment_failed', label: 'Payment Failed' },
    { code: 'invalid_address', label: 'Invalid Address' },
    { code: 'policy_violation', label: 'Policy Violation' },
    { code: 'fraud_suspected', label: 'Fraud Suspected' },
    { code: 'customer_request', label: 'Customer Request' },
    { code: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminOrderDetails(id);
      setOrder(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await adminAPI.approveOrder(id, { note: approveNote });
      toast.success('Order approved successfully');
      setApproveDialog(false);
      setApproveNote('');
      fetchOrderDetails();
    } catch (err) {
      toast.error('Failed to approve order');
      console.error('Error approving order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      await adminAPI.rejectOrder(id, {
        rejectionReason: rejectReason,
        note: rejectNote
      });
      toast.success('Order rejected successfully');
      setRejectDialog(false);
      setRejectReason({ code: '', details: '' });
      setRejectNote('');
      fetchOrderDetails();
    } catch (err) {
      toast.error('Failed to reject order');
      console.error('Error rejecting order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setSubmitting(true);
      const data = {
        status: newStatus,
        note: statusNote
      };
      
      if (newStatus === 'shipped') {
        if (trackingNumber) data.trackingNumber = trackingNumber;
        if (carrier) data.carrier = carrier;
      }

      await adminAPI.updateOrderStatusAdmin(id, data);
      toast.success('Order status updated successfully');
      setStatusDialog(false);
      resetStatusForm();
      fetchOrderDetails();
    } catch (err) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetStatusForm = () => {
    setNewStatus('');
    setStatusNote('');
    setTrackingNumber('');
    setCarrier('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Order not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/admin/orders')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Receipt sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Order #{order.orderNumber}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Placed on {formatDate(order.createdAt)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={statusIcons[order.status] || <Schedule />}
            label={order.status ? order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
            color={statusColors[order.status] || 'default'}
            size="medium"
          />
          <Chip
            icon={<PriorityHigh />}
            label={order.priority ? order.priority.toUpperCase() : 'NORMAL'}
            color={priorityColors[order.priority] || 'default'}
            size="small"
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {order.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => setApproveDialog(true)}
                  >
                    Approve Order
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setRejectDialog(true)}
                  >
                    Reject Order
                  </Button>
                </>
              )}
              {order.status !== 'rejected' && order.status !== 'cancelled' && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setStatusDialog(true)}
                >
                  Update Status
                </Button>
              )}

            </Box>
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {order.customer?.firstName || 'N/A'} {order.customer?.lastName || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customer?.email || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customer?.phone || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress?.name || 'N/A'}
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress?.street || 'N/A'}
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'} {order.shippingAddress?.zipCode || 'N/A'}
            </Typography>

            {order.shippingAddress?.phone && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Phone: {order.shippingAddress.phone}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Order Number: {order.orderNumber || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order Date: {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment Method: {order.payment?.method ? order.payment.method.replace('_', ' ').toUpperCase() : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shipping Method: {order.shipping?.method ? order.shipping.method.replace('_', ' ').toUpperCase() : 'N/A'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">{formatCurrency(order.pricing?.subtotal || 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Tax:</Typography>
              <Typography variant="body2">{formatCurrency(order.pricing?.tax || 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Shipping:</Typography>
              <Typography variant="body2">{formatCurrency(order.pricing?.shipping || 0)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(order.pricing?.total || 0)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            {(order.items || []).map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      {item.product?.images && item.product.images.length > 0 && (
                        <img
                          src={item.product.images[0].url}
                          alt={item.name || 'Product'}
                          style={{
                            width: '100%',
                            maxWidth: '80px',
                            height: 'auto',
                            borderRadius: '8px'
                          }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {item.name || 'Unknown Product'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: {item.product?.category || 'N/A'}
                      </Typography>
                      {item.size && (
                        <Typography variant="body2" color="text.secondary">
                          Size: {item.size}
                        </Typography>
                      )}
                      {item.color && (
                        <Typography variant="body2" color="text.secondary">
                          Color: {item.color}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2">
                        Qty: {item.quantity || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2">
                        {formatCurrency(item.price || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(item.subtotal || 0)}
                      </Typography>
                    </Grid>
                  </Grid>

                  {item.customization && (item.customization.playerName || item.customization.playerNumber) && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Customization:
                      </Typography>
                      {item.customization.playerName && (
                        <Typography variant="body2">
                          Player Name: {item.customization.playerName}
                        </Typography>
                      )}
                      {item.customization.playerNumber && (
                        <Typography variant="body2">
                          Player Number: {item.customization.playerNumber}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Order Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Timeline
            </Typography>
            <List>
              {(order.timeline || []).map((event, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: statusColors[event.status] ? `${statusColors[event.status]}.main` : 'grey.main', width: 32, height: 32 }}>
                      {statusIcons[event.status] || <Schedule />}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {event.status ? event.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.timestamp ? formatDate(event.timestamp) : 'N/A'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        {event.note && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {event.note}
                          </Typography>
                        )}
                        {event.updatedBy && (
                          <Typography variant="caption" color="text.secondary">
                            Updated by: {event.updatedBy.firstName || 'N/A'} {event.updatedBy.lastName || ''}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Admin Notes */}
        {(order.notes?.customer || order.notes?.admin) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              {order.notes?.customer && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Customer Notes:
                  </Typography>
                  <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {order.notes.customer}
                  </Typography>
                </Box>
              )}
              {order.notes?.admin && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Admin Notes:
                  </Typography>
                  <Typography variant="body2" sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    {order.notes.admin}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Approve Order Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to approve order #{order.orderNumber || 'N/A'}?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Approval Note (Optional)"
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            placeholder="Add any notes about the approval..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Approve Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting order #{order.orderNumber || 'N/A'}:
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Rejection Reason</InputLabel>
            <Select
              value={rejectReason.code}
              onChange={(e) => setRejectReason({ ...rejectReason, code: e.target.value })}
              label="Rejection Reason"
            >
              {rejectionReasons.map((reason) => (
                <MenuItem key={reason.code} value={reason.code}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Additional Details (Optional)"
            value={rejectReason.details}
            onChange={(e) => setRejectReason({ ...rejectReason, details: e.target.value })}
            placeholder="Provide additional details about the rejection..."
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Admin Note (Optional)"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Add any internal notes..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={submitting || !rejectReason.code}
          >
            {submitting ? <CircularProgress size={20} /> : 'Reject Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="packing">Packing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          {newStatus === 'shipped' && (
            <>
              <TextField
                fullWidth
                label="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                sx={{ mb: 2 }}
              />
            </>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Status Update Note (Optional)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            placeholder="Add any notes about this status update..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={submitting || !newStatus}
          >
            {submitting ? <CircularProgress size={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrderDetail;
