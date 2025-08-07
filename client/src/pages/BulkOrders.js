import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import {
  SportsSoccer,
  Visibility,
  Add
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { bulkOrdersAPI } from '../services/api';


const BulkOrders = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const statusColors = {
    'pending_review': 'warning',
    'design_approval_needed': 'info',
    'approved': 'success',
    'in_production': 'primary',
    'completed': 'success',
    'cancelled': 'error'
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bulkOrdersAPI.getBulkOrders({ page, limit: 6 });
      setOrders(response.data.data);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to fetch bulk orders');
      console.error('Error fetching bulk orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          My Bulk Jersey Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/bulk-jersey-order"
        >
          New Bulk Order
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 && !loading ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <SportsSoccer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bulk orders found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start your first bulk jersey order for your team
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/bulk-jersey-order"
            size="large"
            startIcon={<SportsSoccer />}
          >
            Create Bulk Order
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} md={6} key={order._id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {order.teamName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created on {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status.replace('_', ' ').toUpperCase()}
                        color={statusColors[order.status]}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Players:</strong> {order.playerDetails?.length || 0}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Contact:</strong> {order.contactPerson?.name}
                    </Typography>

                    {order.pricing?.total && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Total:</strong> ₹{order.pricing.total.toFixed(2)}
                      </Typography>
                    )}

                    {order.estimatedDelivery && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Est. Delivery: {formatDate(order.estimatedDelivery)}
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      fullWidth
                      component={Link}
                      to={`/bulk-orders/${order._id}`}
                      startIcon={<Visibility />}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

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

export default BulkOrders;
