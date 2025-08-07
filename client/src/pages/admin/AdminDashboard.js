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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  ShoppingCart,
  TrendingUp,
  Warning,
  AccountBalance,
  LocalShipping,
  SportsSoccer
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatCurrency as formatCurrencyUtil } from '../../utils/currency';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const { overview, orders, bulkOrders, lowStockProducts, recentOrders, topProducts } = dashboardData;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Dashboard sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4">
                    {overview?.totalCustomers || 0}
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
                <Inventory sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {overview?.totalProducts || 0}
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
                <ShoppingCart sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4">
                    {overview?.totalOrders || 0}
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
                <AccountBalance sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(overview?.totalRevenue || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This month: {formatCurrency(overview?.monthlyRevenue || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Order Status Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Status Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {orders?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Orders
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary.main">
                    {orders?.processing || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Processing
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="info.main">
                    {orders?.shipped || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Shipped
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="secondary.main">
                    {bulkOrders?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bulk Orders
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  component={Link}
                  to="/admin/products"
                  startIcon={<Inventory />}
                  sx={{ mb: 1 }}
                >
                  Manage Products
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  component={Link}
                  to="/admin/orders"
                  startIcon={<ShoppingCart />}
                  sx={{ mb: 1 }}
                >
                  View Orders
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  component={Link}
                  to="/admin/customers"
                  startIcon={<People />}
                  sx={{ mb: 1 }}
                >
                  Manage Customers
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  component={Link}
                  to="/admin/bulk-orders"
                  startIcon={<SportsSoccer />}
                  sx={{ mb: 1 }}
                >
                  Bulk Orders
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Low Stock Alert */}
        {lowStockProducts?.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6">
                  Low Stock Alert ({lowStockProducts.length})
                </Typography>
              </Box>
              <List dense>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <ListItem key={product._id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        src={product.images?.[0]?.url}
                        alt={product.name}
                        variant="rounded"
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={product.name}
                      secondary={`Stock: ${product.inventory?.quantity || 0} units`}
                    />
                    <Chip
                      label="Low Stock"
                      color="warning"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
              {lowStockProducts.length > 5 && (
                <Button
                  component={Link}
                  to="/admin/products?filter=low-stock"
                  size="small"
                >
                  View All ({lowStockProducts.length})
                </Button>
              )}
            </Paper>
          </Grid>
        )}

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders?.slice(0, 5).map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>#{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </TableCell>
                      <TableCell>{formatCurrency(order.pricing?.total || 0)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'shipped' ? 'info' :
                            order.status === 'processing' ? 'primary' : 'warning'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              component={Link}
              to="/admin/orders"
              size="small"
              sx={{ mt: 1 }}
            >
              View All Orders
            </Button>
          </Paper>
        </Grid>

        {/* Top Selling Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <List dense>
              {topProducts?.slice(0, 5).map((product, index) => (
                <ListItem key={product._id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={`${product.salesCount || 0} sold • ${formatCurrency(product.price)}`}
                  />
                  <Avatar
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              component={Link}
              to="/admin/products?sort=popular"
              size="small"
            >
              View All Products
            </Button>
          </Paper>
        </Grid>

        {/* Bulk Orders Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bulk Jersey Orders
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="warning.dark">
                    {bulkOrders?.pending || 0}
                  </Typography>
                  <Typography variant="body2">
                    Pending Review
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.dark">
                    {bulkOrders?.inProduction || 0}
                  </Typography>
                  <Typography variant="body2">
                    In Production
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Button
              component={Link}
              to="/admin/bulk-orders"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<SportsSoccer />}
            >
              Manage Bulk Orders
            </Button>
          </Paper>
        </Grid>

        {/* Order Management Widget */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Management Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="warning.dark">
                    {orders?.pending || 0}
                  </Typography>
                  <Typography variant="body2">
                    Pending Approval
                  </Typography>
                  <Button
                    component={Link}
                    to="/admin/orders?status=pending"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Review
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="info.dark">
                    {orders?.processing || 0}
                  </Typography>
                  <Typography variant="body2">
                    Being Packed
                  </Typography>
                  <Button
                    component={Link}
                    to="/admin/orders?status=packing"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    View
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.dark">
                    {orders?.shipped || 0}
                  </Typography>
                  <Typography variant="body2">
                    In Transit
                  </Typography>
                  <Button
                    component={Link}
                    to="/admin/orders?status=shipped"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Track
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="error.dark">
                    {recentOrders?.filter(order => order.priority === 'urgent').length || 0}
                  </Typography>
                  <Typography variant="body2">
                    Urgent Orders
                  </Typography>
                  <Button
                    component={Link}
                    to="/admin/orders?priority=urgent"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Handle
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                component={Link}
                to="/admin/orders"
                variant="contained"
                startIcon={<ShoppingCart />}
              >
                Manage All Orders
              </Button>
              <Button
                component={Link}
                to="/admin/orders?status=pending"
                variant="outlined"
                color="warning"
              >
                Review Pending ({orders?.pending || 0})
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
