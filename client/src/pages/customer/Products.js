import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../../utils/currency';
import { getImageUrl } from '../../utils/helpers';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  InputAdornment,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Rating
} from '@mui/material';
import {
  Search,
  FilterList,
  GridView,
  ViewList,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  ExpandMore,
  Clear
} from '@mui/icons-material';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI, wishlistAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CustomerProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const [brands, setBrands] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'price_asc', label: 'Price Low to High' },
    { value: 'price_desc', label: 'Price High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const categoryOptions = [
    { value: 'jerseys', label: 'Jerseys', icon: '👕' },
    { value: 'sports-kits', label: 'Sports Kits', icon: '🏃' },
    { value: 'trophies', label: 'Trophies', icon: '🏆' },
    { value: 'equipment', label: 'Equipment', icon: '⚽' },
    { value: 'accessories', label: 'Accessories', icon: '🎽' }
  ];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);

      if (searchTerm) params.set('search', searchTerm);
      if (category) params.set('category', category);
      if (sortBy) params.set('sort', sortBy);
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0]);
      if (priceRange[1] < 10000) params.set('maxPrice', priceRange[1]);
      if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
      if (inStockOnly) params.set('inStock', 'true');

      const response = await productsAPI.getProducts(Object.fromEntries(params));
      setProducts(response.data.data);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, searchTerm, category, sortBy, priceRange, selectedBrands, inStockOnly]);



  const fetchBrands = useCallback(async () => {
    try {
      const response = await productsAPI.getBrands();
      setBrands(response.data.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      if (!user || !user._id) {
        console.log('User not authenticated for wishlist fetch:', user);
        return;
      }
      console.log('Fetching wishlist for user:', user._id);
      const response = await wishlistAPI.getWishlist(user._id);
      setWishlist(response.data.data.map(item => item._id));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setWishlist([]); // Set empty array on error
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, [fetchProducts, fetchBrands]);

  useEffect(() => {
    // Only fetch wishlist after auth loading is complete and user is authenticated
    if (!authLoading && user && user._id) {
      fetchWishlist();
    } else if (!authLoading && !user) {
      // User is not authenticated, clear wishlist
      setWishlist([]);
    }
  }, [fetchWishlist, authLoading, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchTerm, page: 1 });
  };

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortBy('');
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setSearchParams({});
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      toast.success('Product added to cart!');
    }
  };

  const toggleWishlist = async (productId) => {
    console.log('=== TOGGLE WISHLIST ===');
    console.log('Product ID:', productId);
    console.log('User:', user);
    console.log('Auth Loading:', authLoading);
    console.log('Current wishlist:', wishlist);

    // Check if authentication is still loading
    if (authLoading) {
      toast.info('Please wait...');
      return;
    }

    if (!user || !user._id) {
      console.log('❌ User not authenticated');
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    try {
      if (wishlist.includes(productId)) {
        console.log('Removing from wishlist...');
        const response = await wishlistAPI.removeFromWishlist(user._id, productId);
        console.log('Remove response:', response);
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        console.log('Adding to wishlist...');
        console.log('API call: addToWishlist(', user._id, ',', productId, ')');
        const response = await wishlistAPI.addToWishlist(user._id, productId);
        console.log('Add response:', response);
        setWishlist(prev => [...prev, productId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('❌ Wishlist toggle error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      let errorMessage = 'Failed to update wishlist';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      }

      toast.error(errorMessage);
    }
  };

  const formatPrice = (price) => {
    return formatCurrency(price);
  };

  const getDiscountPercentage = (price, comparePrice) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Sports Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover our wide range of sports equipment, jerseys, and accessories
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterList sx={{ mr: 1 }} />
                Filters
              </Typography>
              <Button size="small" onClick={clearFilters} startIcon={<Clear />}>
                Clear
              </Button>
            </Box>

            {/* Search */}
            <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Category Filter */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Category</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth size="small">
                  <Select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      updateFilters({ category: e.target.value, page: 1 });
                    }}
                    displayEmpty
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categoryOptions.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Price Range */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Price Range</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={priceRange}
                    onChange={(e, newValue) => setPriceRange(newValue)}
                    onChangeCommitted={(e, newValue) => {
                      updateFilters({ 
                        minPrice: newValue[0] > 0 ? newValue[0] : undefined,
                        maxPrice: newValue[1] < 10000 ? newValue[1] : undefined,
                        page: 1 
                      });
                    }}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `₹${value}`}
                    min={0}
                    max={10000}
                    step={100}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption">₹{priceRange[0]}</Typography>
                    <Typography variant="caption">₹{priceRange[1]}</Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Brand Filter */}
            {brands.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">Brands</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {brands.slice(0, 10).map((brand) => (
                    <FormControlLabel
                      key={brand}
                      control={
                        <Checkbox
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...selectedBrands, brand]
                              : selectedBrands.filter(b => b !== brand);
                            setSelectedBrands(newBrands);
                            updateFilters({ brands: newBrands.join(','), page: 1 });
                          }}
                          size="small"
                        />
                      }
                      label={brand}
                      sx={{ display: 'block' }}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            )}

            {/* Stock Filter */}
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      updateFilters({ inStock: e.target.checked || undefined, page: 1 });
                    }}
                  />
                }
                label="In Stock Only"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {pagination.total || 0} products found
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Sort */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateFilters({ sort: e.target.value, page: 1 });
                  }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* View Mode */}
              <Box>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <GridView />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewList />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            /* Empty State */
            <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your filters or search terms
              </Typography>
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Paper>
          ) : (
            /* Products Grid */
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={viewMode === 'grid' ? 6 : 12} 
                    md={viewMode === 'grid' ? 4 : 12} 
                    lg={viewMode === 'grid' ? 3 : 12}
                    key={product._id}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: viewMode === 'list' ? 'row' : 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', width: viewMode === 'list' ? 200 : '100%' }}>
                        <CardMedia
                          component={Link}
                          to={`/products/${product._id}`}
                          sx={{ textDecoration: 'none' }}
                        >
                          <Box
                            component="img"
                            height={viewMode === 'list' ? 150 : 200}
                            width="100%"
                            src={getImageUrl(product.images?.[0]?.url)}
                            alt={product.name}
                            sx={{ objectFit: 'cover' }}
                          />
                        </CardMedia>
                        
                        {/* Wishlist Button */}
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' }
                          }}
                          onClick={() => toggleWishlist(product._id)}
                        >
                          {wishlist.includes(product._id) ? (
                            <Favorite color="error" />
                          ) : (
                            <FavoriteBorder />
                          )}
                        </IconButton>

                        {/* Discount Badge */}
                        {product.comparePrice && product.comparePrice > product.price && (
                          <Chip
                            label={`${getDiscountPercentage(product.price, product.comparePrice)}% OFF`}
                            color="secondary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8
                            }}
                          />
                        )}
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          gutterBottom
                          variant="h6"
                          component={Link}
                          to={`/products/${product._id}`}
                          sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': { color: 'primary.main' },
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {product.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {formatPrice(product.price)}
                          </Typography>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <Typography
                              variant="body2"
                              sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                            >
                              {formatPrice(product.comparePrice)}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            label={product.category.replace('-', ' ').toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                          {product.brand && (
                            <Chip
                              label={product.brand}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {product.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={product.rating} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              ({product.reviewCount || 0})
                            </Typography>
                          </Box>
                        )}
                        
                        {viewMode === 'list' && product.shortDescription && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {product.shortDescription}
                          </Typography>
                        )}
                      </CardContent>
                      
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleAddToCart(product._id)}
                          disabled={!product.isActive}
                        >
                          Add to Cart
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.pages}
                    page={pagination.page}
                    onChange={(event, value) => updateFilters({ page: value })}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerProducts;
