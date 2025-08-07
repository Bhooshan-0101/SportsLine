import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import { getImageUrl } from '../../utils/helpers';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Divider,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  ArrowBack,
  LocalShipping,
  Security,
  CreditCard
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom'; // Will be used for checkout navigation
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CustomerCart = () => {
  // const navigate = useNavigate(); // Will be used for checkout navigation
  const { user } = useAuth();
  const {
    items: cartItems = [],
    totalItems = 0,
    subtotal: totalPrice = 0,
    updateCartItem: updateQuantity,
    removeFromCart,
    clearCart,
    loading = false
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(99); // ₹99 shipping

  const freeShippingThreshold = 2000; // ₹2000 for free shipping
  const taxRate = 0.18; // 18% GST in India

  useEffect(() => {
    // Calculate shipping cost
    if (totalPrice >= freeShippingThreshold) {
      setShippingCost(0);
    } else {
      setShippingCost(99); // ₹99 shipping
    }
  }, [totalPrice, freeShippingThreshold]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const result = await updateQuantity(itemId, newQuantity);
    if (!result.success) {
      toast.error(result.error || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Item removed from cart');
    } else {
      toast.error(result.error || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      const result = await clearCart();
      if (result.success) {
        toast.success('Cart cleared');
      } else {
        toast.error(result.error || 'Failed to clear cart');
      }
    }
  };

  const applyPromoCode = () => {
    // Simple promo code logic - in real app, this would be an API call
    const promoCodes = {
      'SAVE10': 0.10,
      'WELCOME': 0.05,
      'SPORTS20': 0.20
    };

    if (promoCodes[promoCode.toUpperCase()]) {
      const discountAmount = totalPrice * promoCodes[promoCode.toUpperCase()];
      setDiscount(discountAmount);
      toast.success(`Promo code applied! You saved ${formatCurrency(discountAmount)}`);
    } else {
      toast.error('Invalid promo code');
    }
  };

  const formatPrice = (price) => {
    return formatCurrency(price);
  };

  const subtotal = totalPrice;
  const discountAmount = discount;
  const shipping = shippingCost;
  const tax = (subtotal - discountAmount + shipping) * taxRate;
  const total = subtotal - discountAmount + shipping + tax;

  if (loading) {
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
          component={Link}
          to="/products"
          sx={{ mr: 2 }}
        >
          Continue Shopping
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Shopping Cart
        </Typography>
        {cartItems && cartItems.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearCart}
            startIcon={<Delete />}
          >
            Clear Cart
          </Button>
        )}
      </Box>

      {!cartItems || cartItems.length === 0 ? (
        /* Empty Cart */
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingCartOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add some products to get started
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
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cart Items ({totalItems})
                </Typography>
                
                {cartItems && cartItems.map((item) => (
                  <Card key={item._id} elevation={1} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        {/* Product Image */}
                        <Grid item xs={12} sm={3}>
                          <CardMedia
                            component={Link}
                            to={`/products/${item.product._id}`}
                            sx={{ textDecoration: 'none' }}
                          >
                            <Box
                              component="img"
                              height="100"
                              width="100%"
                              src={getImageUrl(item.product.images?.[0]?.url)}
                              alt={item.product.name}
                              sx={{ objectFit: 'cover', borderRadius: 1 }}
                            />
                          </CardMedia>
                        </Grid>

                        {/* Product Details */}
                        <Grid item xs={12} sm={5}>
                          <Typography
                            variant="h6"
                            component={Link}
                            to={`/products/${item.product._id}`}
                            sx={{
                              textDecoration: 'none',
                              color: 'inherit',
                              '&:hover': { color: 'primary.main' }
                            }}
                          >
                            {item.product.name}
                          </Typography>
                          
                          {/* Variants */}
                          {item.variants && Object.keys(item.variants).length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {Object.entries(item.variants).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}

                          {/* Customization */}
                          {item.customization && (
                            <Box sx={{ mt: 1 }}>
                              {item.customization.playerName && (
                                <Chip
                                  label={`Name: ${item.customization.playerName}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                              {item.customization.playerNumber && (
                                <Chip
                                  label={`Number: ${item.customization.playerNumber}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                            </Box>
                          )}

                          <Typography variant="h6" color="primary.main" sx={{ mt: 1 }}>
                            {formatPrice(item.price)}
                          </Typography>
                        </Grid>

                        {/* Quantity Controls */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Remove />
                            </IconButton>
                            <TextField
                              size="small"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                handleQuantityChange(item._id, newQuantity);
                              }}
                              inputProps={{
                                style: { textAlign: 'center', width: 60 },
                                min: 1
                              }}
                              type="number"
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            >
                              <Add />
                            </IconButton>
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Subtotal: {formatPrice(item.price * item.quantity)}
                          </Typography>

                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleRemoveItem(item._id)}
                          >
                            Remove
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>

            {/* Promo Code */}
            <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Promo Code
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={applyPromoCode}
                  disabled={!promoCode.trim()}
                >
                  Apply
                </Button>
              </Box>
              {discount > 0 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Promo code applied! You saved {formatPrice(discount)}
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography>{formatPrice(subtotal)}</Typography>
                </ListItem>

                {discount > 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText primary="Discount" />
                    <Typography color="success.main">
                      -{formatPrice(discountAmount)}
                    </Typography>
                  </ListItem>
                )}

                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Shipping" 
                    secondary={shipping === 0 ? 'Free shipping!' : `Free shipping on orders over ${formatPrice(freeShippingThreshold)}`}
                  />
                  <Typography>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </Typography>
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Tax" />
                  <Typography>{formatPrice(tax)}</Typography>
                </ListItem>

                <Divider sx={{ my: 2 }} />

                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Total
                      </Typography>
                    }
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(total)}
                  </Typography>
                </ListItem>
              </List>

              <Button
                fullWidth
                variant="contained"
                size="large"
                component={Link}
                to="/checkout"
                sx={{ mt: 2, mb: 3 }}
                disabled={!user}
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </Button>

              {!user && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please <Link to="/login">login</Link> to proceed with checkout
                </Alert>
              )}

              {/* Trust Badges */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Secure Checkout
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Security color="action" />
                  <CreditCard color="action" />
                  <LocalShipping color="action" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  SSL encrypted • Safe payments • Fast delivery
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CustomerCart;
