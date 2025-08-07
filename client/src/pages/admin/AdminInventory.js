import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
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
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning,
  CheckCircle,
  Error,
  Edit,
  Search,
  Download,
  Refresh
} from '@mui/icons-material';
import { productsAPI, adminAPI } from '../../services/api';
import { formatCurrency as formatCurrencyUtil } from '../../utils/currency';
import { toast } from 'react-toastify';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const stockFilters = [
    { value: '', label: 'All Products' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
    { value: 'unlimited', label: 'Unlimited Stock' }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'jerseys', label: 'Jerseys' },
    { value: 'sports-kits', label: 'Sports Kits' },
    { value: 'trophies', label: 'Trophies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'accessories', label: 'Accessories' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, searchTerm, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        includeInactive: 'true'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (stockFilter) params.append('stockStatus', stockFilter);

      const response = await productsAPI.getProducts(Object.fromEntries(params));
      setProducts(response.data.data);
      setTotalCount(response.data.pagination.total);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product) => {
    if (!product.inventory?.trackQuantity) return 'unlimited';
    if (product.inventory.quantity === 0) return 'out-of-stock';
    if (product.inventory.quantity <= product.inventory.lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockChip = (product) => {
    const status = getStockStatus(product);
    const colors = {
      'in-stock': 'success',
      'low-stock': 'warning',
      'out-of-stock': 'error',
      'unlimited': 'info'
    };
    const labels = {
      'in-stock': `${product.inventory?.quantity} in stock`,
      'low-stock': `${product.inventory?.quantity} left`,
      'out-of-stock': 'Out of stock',
      'unlimited': 'Unlimited'
    };

    return (
      <Chip
        label={labels[status]}
        color={colors[status]}
        size="small"
        icon={
          status === 'out-of-stock' ? <Error /> :
          status === 'low-stock' ? <Warning /> :
          status === 'in-stock' ? <CheckCircle /> :
          <InventoryIcon />
        }
      />
    );
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !newQuantity) return;

    try {
      await productsAPI.updateProduct(selectedProduct._id, {
        inventory: {
          ...selectedProduct.inventory,
          quantity: parseInt(newQuantity)
        }
      });

      toast.success('Stock updated successfully');
      setUpdateDialogOpen(false);
      setSelectedProduct(null);
      setNewQuantity('');
      setAdjustmentReason('');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const openUpdateDialog = (product) => {
    setSelectedProduct(product);
    setNewQuantity(product.inventory?.quantity?.toString() || '0');
    setUpdateDialogOpen(true);
  };

  const exportInventory = async () => {
    try {
      const response = await adminAPI.exportInventory();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Inventory exported successfully');
    } catch (error) {
      toast.error('Failed to export inventory');
    }
  };

  const getInventoryValue = () => {
    return products.reduce((total, product) => {
      const quantity = product.inventory?.quantity || 0;
      return total + (quantity * product.price);
    }, 0);
  };

  const getLowStockCount = () => {
    return products.filter(product => getStockStatus(product) === 'low-stock').length;
  };

  const getOutOfStockCount = () => {
    return products.filter(product => getStockStatus(product) === 'out-of-stock').length;
  };

  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Inventory Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchProducts}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportInventory}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Products
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {totalCount}
                  </Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Inventory Value
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(getInventoryValue())}
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {getLowStockCount()}
                  </Typography>
                </Box>
                <Warning color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Out of Stock
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {getOutOfStockCount()}
                  </Typography>
                </Box>
                <Error color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Stock Status</InputLabel>
            <Select
              value={stockFilter}
              label="Stock Status"
              onChange={(e) => setStockFilter(e.target.value)}
            >
              {stockFilters.map((filter) => (
                <MenuItem key={filter.value} value={filter.value}>
                  {filter.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setStockFilter('');
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

      {/* Inventory Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Low Stock Threshold</TableCell>
                <TableCell>Stock Value</TableCell>
                <TableCell>Status</TableCell>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const stockValue = (product.inventory?.quantity || 0) * product.price;
                  
                  return (
                    <TableRow key={product._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={product.images?.[0]?.url}
                            alt={product.name}
                            variant="rounded"
                            sx={{ width: 50, height: 50, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.brand || 'No brand'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={product.category.replace('-', ' ').toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {product.sku || 'N/A'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(product.price)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        {product.inventory?.trackQuantity ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {product.inventory.quantity}
                            </Typography>
                            {stockStatus === 'low-stock' && (
                              <LinearProgress
                                variant="determinate"
                                value={(product.inventory.quantity / product.inventory.lowStockThreshold) * 100}
                                color="warning"
                                sx={{ mt: 0.5, height: 4 }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Unlimited
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {product.inventory?.lowStockThreshold || 'N/A'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(stockValue)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        {getStockChip(product)}
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title="Update Stock">
                          <IconButton
                            size="small"
                            onClick={() => openUpdateDialog(product)}
                            disabled={!product.inventory?.trackQuantity}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
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
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* Update Stock Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Stock - {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="New Quantity"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              inputProps={{ min: 0 }}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Adjustment Reason"
              multiline
              rows={3}
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              placeholder="Enter reason for stock adjustment..."
            />
            
            {selectedProduct && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Stock: {selectedProduct.inventory?.quantity || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Change: {newQuantity ? (parseInt(newQuantity) - (selectedProduct.inventory?.quantity || 0)) : 0}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateStock} 
            variant="contained"
            disabled={!newQuantity}
          >
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminInventory;
