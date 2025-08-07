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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Visibility,
  SportsSoccer,
  Assignment,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { bulkOrdersAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const AdminBulkOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const statusColors = {
    'pending_review': 'warning',
    'design_approval_needed': 'info',
    'approved': 'success',
    'in_production': 'primary',
    'quality_check': 'secondary',
    'ready_for_delivery': 'success',
    'completed': 'success',
    'cancelled': 'error',
    'on_hold': 'default'
  };

  const statusIcons = {
    'pending_review': <Schedule />,
    'design_approval_needed': <Assignment />,
    'approved': <CheckCircle />,
    'in_production': <SportsSoccer />,
    'quality_check': <CheckCircle />,
    'ready_for_delivery': <CheckCircle />,
    'completed': <CheckCircle />,
    'cancelled': <CheckCircle />,
    'on_hold': <Schedule />
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });

      if (statusFilter) params.append('status', statusFilter);

      const response = await bulkOrdersAPI.getBulkOrders(Object.fromEntries(params));
      setOrders(response.data.data);
      setTotalCount(response.data.pagination.total);
      setError('');
    } catch (err) {
      setError('Failed to fetch bulk orders');
      console.error('Error fetching bulk orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Bulk Jersey Orders
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Orders</MenuItem>
              <MenuItem value="pending_review">Pending Review</MenuItem>
              <MenuItem value="design_approval_needed">Design Approval Needed</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="in_production">In Production</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => {
              setStatusFilter('');
              setPage(0);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Orders Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      No bulk orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                          <SportsSoccer />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {order.teamName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.contactPerson?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.contactPerson?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.playerDetails?.length || 0} jerseys
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {order.pricing?.total ? formatCurrency(order.pricing.total) : 'TBD'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusIcons[order.status]}
                        label={order.status.replace('_', ' ').toUpperCase()}
                        color={statusColors[order.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/bulk-orders/${order._id}`}
                      >
                        <Visibility />
                      </IconButton>
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
    </Container>
  );
};

export default AdminBulkOrders;
