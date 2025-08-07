import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatPriceWithDiscount } from '../../utils/currency';
import { getImageUrl } from '../../utils/helpers';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  Button,
  IconButton,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Rating,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Badge
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Share,
  Add,
  Remove,
  NavigateNext,
  Star,
  Verified
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { productsAPI, wishlistAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CustomerProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [customization, setCustomization] = useState({
    playerName: '',
    playerNumber: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Define callback functions first
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(id);
      setProduct(response.data.data);

      // Initialize selected variants
      const initialVariants = {};
      response.data.data.variants?.forEach(variant => {
        if (variant.options?.length > 0) {
          initialVariants[variant.name] = variant.options[0];
        }
      });
      setSelectedVariants(initialVariants);

      setError('');
    } catch (err) {
      setError('Product not found');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRelatedProducts = useCallback(async () => {
    try {
      if (product && product.category) {
        const response = await productsAPI.getProducts({ category: product.category, limit: 4 });
        setRelatedProducts(response.data.data.filter(p => p._id !== product._id));
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  }, [product]);

  const checkWishlistStatus = useCallback(async () => {
    try {
      if (!user || !user._id) {
        console.log('User not authenticated for wishlist check:', user);
        return;
      }
      console.log('Checking wishlist status for user:', user._id);
      const response = await wishlistAPI.getWishlist(user._id);
      const wishlistIds = response.data.data.map(item => item._id);
      setIsInWishlist(wishlistIds.includes(id));
    } catch (err) {
      console.error('Error checking wishlist:', err);
    }
  }, [user, id]);

  useEffect(() => {
    fetchProduct();
    // Only check wishlist status after auth loading is complete and user is authenticated
    if (!authLoading && user && user._id) {
      checkWishlistStatus();
    } else if (!authLoading && !user) {
      // User is not authenticated, set wishlist status to false
      setIsInWishlist(false);
    }
  }, [id, authLoading, user, fetchProduct, checkWishlistStatus]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product, fetchRelatedProducts]);

  const handleAddToCart = async () => {
    const cartItem = {
      productId: product._id,
      quantity,
      variants: selectedVariants,
      customization: product.isCustomizable ? customization : undefined
    };

    const result = await addToCart(cartItem.productId, cartItem.quantity, cartItem.variants, cartItem.customization);
    if (result.success) {
      toast.success('Product added to cart!');
    }
  };

  const toggleWishlist = async () => {
    // Check if authentication is still loading
    if (authLoading) {
      toast.info('Please wait...');
      return;
    }

    if (!user || !user._id) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(user._id, product._id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.addToWishlist(user._id, product._id);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const formatPrice = (price) => {
    return formatCurrency(price);
  };

  const getDiscountPercentage = () => {
    if (!product.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const getStockStatus = () => {
    if (!product.inventory?.trackQuantity) return 'unlimited';
    if (product.inventory.quantity === 0) return 'out-of-stock';
    if (product.inventory.quantity <= product.inventory.lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockMessage = () => {
    const status = getStockStatus();
    switch (status) {
      case 'out-of-stock':
        return { message: 'Out of stock', color: 'error' };
      case 'low-stock':
        return { message: `Only ${product.inventory.quantity} left in stock`, color: 'warning' };
      case 'in-stock':
        return { message: `${product.inventory.quantity} in stock`, color: 'success' };
      default:
        return { message: 'In stock', color: 'success' };
    }
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

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
      </Container>
    );
  }

  const stockInfo = getStockMessage();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover">
          Home
        </Link>
        <Link component={RouterLink} to="/products" underline="hover">
          Products
        </Link>
        <Link component={RouterLink} to={`/products?category=${product.category}`} underline="hover">
          {product.category.replace('-', ' ').toUpperCase()}
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardMedia
              component="img"
              height="400"
              image={getImageUrl(product.images?.[selectedImage]?.url)}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
          
          {/* Image Thumbnails */}
          {product.images?.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
              {product.images.map((image, index) => (
                <Card
                  key={index}
                  elevation={selectedImage === index ? 4 : 1}
                  sx={{
                    minWidth: 80,
                    cursor: 'pointer',
                    border: selectedImage === index ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => setSelectedImage(index)}
                >
                  <CardMedia
                    component="img"
                    height="80"
                    image={getImageUrl(image.url)}
                    alt={`${product.name} ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            {/* Product Title and Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                {product.name}
              </Typography>
              <Box>
                <IconButton onClick={toggleWishlist} color={isInWishlist ? 'error' : 'default'}>
                  {isInWishlist ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            {/* Brand and Category */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {product.brand && (
                <Chip label={product.brand} variant="outlined" />
              )}
              <Chip 
                label={product.category.replace('-', ' ').toUpperCase()} 
                variant="outlined" 
              />
              {product.isCustomizable && (
                <Chip label="Customizable" color="primary" variant="outlined" />
              )}
            </Box>

            {/* Rating */}
            {product.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={product.rating} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({product.reviewCount || 0} reviews)
                </Typography>
              </Box>
            )}

            {/* Price */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {formatPrice(product.price)}
                </Typography>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <Typography
                      variant="h6"
                      sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                    >
                      {formatPrice(product.comparePrice)}
                    </Typography>
                    <Chip
                      label={`${getDiscountPercentage()}% OFF`}
                      color="secondary"
                      size="small"
                    />
                  </>
                )}
              </Box>
              
              {/* Stock Status */}
              <Chip
                label={stockInfo.message}
                color={stockInfo.color}
                size="small"
                icon={stockInfo.color === 'success' ? <Verified /> : undefined}
              />
            </Box>

            {/* Short Description */}
            {product.shortDescription && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {product.shortDescription}
              </Typography>
            )}

            {/* Variants */}
            {product.variants?.map((variant) => (
              <FormControl key={variant.name} fullWidth sx={{ mb: 2 }}>
                <InputLabel>{variant.name}</InputLabel>
                <Select
                  value={selectedVariants[variant.name] || ''}
                  label={variant.name}
                  onChange={(e) => setSelectedVariants(prev => ({
                    ...prev,
                    [variant.name]: e.target.value
                  }))}
                >
                  {variant.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}

            {/* Customization Options */}
            {product.isCustomizable && product.customizationOptions && (
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Customization Options
                </Typography>
                
                {product.customizationOptions.allowNamePrint && (
                  <TextField
                    fullWidth
                    label="Player Name"
                    value={customization.playerName}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      playerName: e.target.value.toUpperCase()
                    }))}
                    inputProps={{ 
                      maxLength: product.customizationOptions.maxNameLength || 15 
                    }}
                    helperText={`Max ${product.customizationOptions.maxNameLength || 15} characters`}
                    sx={{ mb: 2 }}
                  />
                )}
                
                {product.customizationOptions.allowNumberPrint && (
                  <TextField
                    fullWidth
                    label="Player Number"
                    type="number"
                    value={customization.playerNumber}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      playerNumber: e.target.value
                    }))}
                    inputProps={{
                      min: product.customizationOptions.numberRange?.min || 1,
                      max: product.customizationOptions.numberRange?.max || 99
                    }}
                    helperText={`Number between ${product.customizationOptions.numberRange?.min || 1} and ${product.customizationOptions.numberRange?.max || 99}`}
                  />
                )}
              </Paper>
            )}

            {/* Quantity and Add to Cart */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.inventory?.trackQuantity && quantity >= product.inventory.quantity}
                >
                  <Add />
                </IconButton>
              </Box>
              
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!product.isActive || getStockStatus() === 'out-of-stock'}
                sx={{ flexGrow: 1 }}
              >
                Add to Cart
              </Button>
            </Box>

            {/* SKU and Additional Info */}
            {product.sku && (
              <Typography variant="body2" color="text.secondary">
                SKU: {product.sku}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Description" />
          <Tab label="Specifications" />
          {product.reviews?.length > 0 && <Tab label="Reviews" />}
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {tabValue === 0 && (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {product.description}
            </Typography>
          )}
          
          {tabValue === 1 && (
            <List>
              {product.specifications?.map((spec, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={spec.name}
                    secondary={spec.value}
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          {tabValue === 2 && product.reviews?.length > 0 && (
            <Box>
              {product.reviews.map((review, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 2 }}>{review.user.firstName[0]}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">
                        {review.user.firstName} {review.user.lastName}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {review.comment}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((relatedProduct) => (
              <Grid item xs={12} sm={6} md={3} key={relatedProduct._id}>
                <Card
                  component={RouterLink}
                  to={`/products/${relatedProduct._id}`}
                  sx={{
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(relatedProduct.images?.[0]?.url)}
                    alt={relatedProduct.name}
                  />
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {relatedProduct.name}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatPrice(relatedProduct.price)}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default CustomerProductDetail;
