import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../../utils/currency';
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
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import {
  Favorite,
  ShoppingCart,
  Delete,
  ArrowBack
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingItems, setRemovingItems] = useState({});

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      if (!user || !user._id) {
        console.log('User not authenticated or missing ID:', user);
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      console.log('Fetching wishlist for user:', user._id);
      const response = await wishlistAPI.getWishlist(user._id);
      setWishlistItems(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch wishlist');
      console.error('Error fetching wishlist:', err);
      setWishlistItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch wishlist after auth loading is complete and user is authenticated
    if (!authLoading && user && user._id) {
      fetchWishlist();
    } else if (!authLoading && !user) {
      // User is not authenticated, clear wishlist
      setWishlistItems([]);
      setLoading(false);
    }
  }, [authLoading, user, fetchWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    // Check if authentication is still loading
    if (authLoading) {
      toast.info('Please wait...');
      return;
    }

    if (!user || !user._id) {
      toast.error('User not authenticated');
      navigate('/login');
      return;
    }

    setRemovingItems(prev => ({ ...prev, [productId]: true }));

    try {
      await wishlistAPI.removeFromWishlist(user._id, productId);
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove item from wishlist');
    } finally {
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      toast.success('Item added to cart!');
    }
  };

  const handleAddAllToCart = async () => {
    const promises = wishlistItems.map(item => addToCart(item._id, 1));
    
    try {
      await Promise.all(promises);
      toast.success('All items added to cart!');
    } catch (error) {
      toast.error('Some items could not be added to cart');
    }
  };

  if (loading || authLoading) {
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{ mr: 2 }}
        >
          Continue Shopping
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          My Wishlist
        </Typography>
        {wishlistItems.length > 0 && (
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleAddAllToCart}
          >
            Add All to Cart
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {wishlistItems.length === 0 ? (
        /* Empty Wishlist */
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Save items you love to your wishlist for easy access later
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            size="large"
          >
            Browse Products
          </Button>
        </Paper>
      ) : (
        /* Wishlist Items */
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
          </Typography>
          
          <Grid container spacing={3}>
            {wishlistItems.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component={Link}
                      to={`/products/${product._id}`}
                      sx={{ textDecoration: 'none' }}
                    >
                      <Box
                        component="img"
                        height="200"
                        width="100%"
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    </CardMedia>
                    
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      disabled={removingItems[product._id]}
                    >
                      {removingItems[product._id] ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Delete color="error" />
                      )}
                    </IconButton>
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
                        {formatCurrency(product.price)}
                      </Typography>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                          >
                            {formatCurrency(product.comparePrice)}
                          </Typography>
                          <Chip
                            label={`${product.discountPercentage}% OFF`}
                            size="small"
                            color="secondary"
                          />
                        </>
                      )}
                    </Box>
                    
                    <Chip
                      label={product.category.replace('-', ' ').toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                    
                    {!product.isActive && (
                      <Chip
                        label="Unavailable"
                        size="small"
                        color="error"
                        sx={{ ml: 1 }}
                      />
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
        </>
      )}
    </Container>
  );
};

export default Wishlist;
