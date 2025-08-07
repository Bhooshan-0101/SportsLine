import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  Search,
  LocalShipping,
  CheckCircle,
  Cancel,
  Receipt,
  Schedule,
  Inventory,
  PriorityHigh
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { toast } from '../../utils/toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Bulk actions
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkActionData, setBulkActionData] = useState({});

  // Filter dialog


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

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter, priorityFilter, dateFromFilter, dateToFilter, searchFilter, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder
      };

      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (dateFromFilter) params.dateFrom = dateFromFilter;
      if (dateToFilter) params.dateTo = dateToFilter;
      if (searchFilter) params.search = searchFilter;

      const response = await adminAPI.getAdminOrders(params);
      setOrders(response.data.data);
      setTotalCount(response.data.pagination.total);
      setError('');
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedOrders((orders || []).map(order => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkAction = async () => {
    try {
      setLoading(true);
      await adminAPI.bulkUpdateOrders({
        orderIds: selectedOrders,
        action: bulkAction,
        data: bulkActionData
      });
      toast.success('Bulk action completed successfully');
      setBulkActionDialog(false);
      setSelectedOrders([]);
      setBulkAction('');
      setBulkActionData({});
      fetchOrders();
    } catch (err) {
      toast.error('Failed to perform bulk action');
      console.error('Error performing bulk action:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setSearchFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Receipt sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Order Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h6">
                    {(orders || []).filter(o => o?.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approval
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
                <Inventory sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h6">
                    {(orders || []).filter(o => o?.status === 'packing').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Being Packed
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
                <LocalShipping sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">
                    {(orders || []).filter(o => ['shipped', 'out_for_delivery'].includes(o?.status)).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Transit
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
                <PriorityHigh sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography variant="h6">
                    {(orders || []).filter(o => o?.priority === 'urgent').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Urgent Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search orders..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="packing">Packing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From Date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To Date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                size="small"
              >
                Clear
              </Button>
            </Grid>
          </Grid>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {selectedOrders.length} order(s) selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setBulkAction('approve');
                    setBulkActionDialog(true);
                  }}
                >
                  Bulk Approve
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setBulkAction('reject');
                    setBulkActionDialog(true);
                  }}
                >
                  Bulk Reject
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setBulkAction('update_status');
                    setBulkActionDialog(true);
                  }}
                >
                  Update Status
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedOrders([])}
                >
                  Clear Selection
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Orders Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < (orders || []).length}
                    checked={(orders || []).length > 0 && selectedOrders.length === (orders || []).length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !orders || orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary">
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (orders || []).map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleSelectOrder(order._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        #{order.orderNumber}
                      </Typography>
                      {order.assignedTo && (
                        <Typography variant="caption" color="text.secondary">
                          Assigned to: {order.assignedTo.firstName} {order.assignedTo.lastName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: 14 }}>
                          {order.customer?.firstName?.[0]}{order.customer?.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {order.customer?.firstName} {order.customer?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.customer?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.items?.length || 0} items
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(order.pricing?.total || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusIcons[order.status] || <Schedule />}
                        label={order.status ? order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                        color={statusColors[order.status] || 'default'}
                        size="small"
                      />
                      {order.approvalStatus?.approved === false && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                          Rejected: {order.approvalStatus.rejectionReason?.code}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<PriorityHigh />}
                        label={order.priority?.toUpperCase() || 'NORMAL'}
                        color={priorityColors[order.priority] || 'primary'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/admin/orders/${order._id}`}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk Action: {bulkAction.replace('_', ' ').toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This action will be applied to {selectedOrders.length} selected order(s).
          </Typography>

          {bulkAction === 'reject' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rejection Reason</InputLabel>
              <Select
                value={bulkActionData.rejectionReason?.code || ''}
                onChange={(e) => setBulkActionData({
                  ...bulkActionData,
                  rejectionReason: { code: e.target.value, details: '' }
                })}
                label="Rejection Reason"
              >
                <MenuItem value="insufficient_stock">Insufficient Stock</MenuItem>
                <MenuItem value="payment_failed">Payment Failed</MenuItem>
                <MenuItem value="invalid_address">Invalid Address</MenuItem>
                <MenuItem value="policy_violation">Policy Violation</MenuItem>
                <MenuItem value="fraud_suspected">Fraud Suspected</MenuItem>
                <MenuItem value="customer_request">Customer Request</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          )}

          {bulkAction === 'update_status' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={bulkActionData.status || ''}
                onChange={(e) => setBulkActionData({ ...bulkActionData, status: e.target.value })}
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
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Note (Optional)"
            value={bulkActionData.note || ''}
            onChange={(e) => setBulkActionData({ ...bulkActionData, note: e.target.value })}
            placeholder="Add any notes about this bulk action..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleBulkAction}
            variant="contained"
            disabled={loading || (bulkAction === 'reject' && !bulkActionData.rejectionReason?.code) || (bulkAction === 'update_status' && !bulkActionData.status)}
          >
            {loading ? <CircularProgress size={20} /> : 'Apply Action'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrders;
