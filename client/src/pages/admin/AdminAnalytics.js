import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  AttachMoney,
  Inventory,
  SportsSoccer,
  Assessment
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { adminAPI } from '../../services/api';
import { formatCurrency as formatCurrencyUtil } from '../../utils/currency';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    salesChart: [],
    categoryBreakdown: [],
    topProducts: [],
    customerMetrics: {},
    recentOrders: []
  });

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSalesAnalytics({ period: timeRange });
      setAnalyticsData(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getPercentageChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const MetricCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {change >= 0 ? (
                  <TrendingUp color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDown color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  color={change >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(change)}% vs previous period
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Analytics Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRangeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Overview Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(analyticsData.overview.totalRevenue || 0)}
            change={getPercentageChange(
              analyticsData.overview.totalRevenue,
              analyticsData.overview.previousRevenue
            )}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={formatNumber(analyticsData.overview.totalOrders || 0)}
            change={getPercentageChange(
              analyticsData.overview.totalOrders,
              analyticsData.overview.previousOrders
            )}
            icon={<ShoppingCart />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="New Customers"
            value={formatNumber(analyticsData.overview.newCustomers || 0)}
            change={getPercentageChange(
              analyticsData.overview.newCustomers,
              analyticsData.overview.previousCustomers
            )}
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Bulk Orders"
            value={formatNumber(analyticsData.overview.bulkOrders || 0)}
            change={getPercentageChange(
              analyticsData.overview.bulkOrders,
              analyticsData.overview.previousBulkOrders
            )}
            icon={<SportsSoccer />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.salesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.topProducts.map((product, index) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            #{index + 1}
                          </Typography>
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body2">
                              {product.name}
                            </Typography>
                            <Chip
                              label={product.category}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(product.salesCount)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Customer Metrics */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Insights
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Average Order Value</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(analyticsData.customerMetrics.avgOrderValue || 0)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((analyticsData.customerMetrics.avgOrderValue || 0) / 200 * 100, 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Customer Retention Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {(analyticsData.customerMetrics.retentionRate || 0).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={analyticsData.customerMetrics.retentionRate || 0}
                sx={{ height: 8, borderRadius: 4 }}
                color="success"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Conversion Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {(analyticsData.customerMetrics.conversionRate || 0).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={analyticsData.customerMetrics.conversionRate || 0}
                sx={{ height: 8, borderRadius: 4 }}
                color="warning"
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(analyticsData.customerMetrics.totalCustomers || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(analyticsData.customerMetrics.activeCustomers || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Customers
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          #{order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {order.items?.length || 0} items
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(order.pricing?.total || 0)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'error' :
                            order.status === 'shipped' ? 'info' : 'warning'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminAnalytics;
