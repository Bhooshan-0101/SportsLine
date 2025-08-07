import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack, ArrowForward, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';

const steps = ['Shipping Information', 'Payment Method', 'Review Order'];

// Validation schema
const shippingSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().required('ZIP code is required'),
  phone: yup.string().required('Phone number is required')
});

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, totalItems, clearCart } = useCart();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [orderData, setOrderData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },

  } = useForm({
    resolver: yupResolver(shippingSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      phone: user?.phone || ''
    }
  });

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const calculateTax = () => subtotal * 0.18; // 18% GST for India
  const calculateShipping = () => {
    switch (shippingMethod) {
      case 'express': return 199;
      case 'overnight': return 399;
      default: return subtotal > 2000 ? 0 : 99; // Free shipping over ₹2000
    }
  };
  const calculateTotal = () => subtotal + calculateTax() + calculateShipping();

  const handleNext = () => {
    if (activeStep === 0) {
      handleSubmit(onShippingSubmit)();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onShippingSubmit = (data) => {
    setOrderData(prev => ({
      ...prev,
      shippingAddress: data,
      billingAddress: sameAsBilling ? data : prev?.billingAddress
    }));
    setActiveStep(1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      const order = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          customization: item.customization
        })),
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress || orderData.shippingAddress,
        payment: {
          method: paymentMethod
        },
        shipping: {
          method: shippingMethod
        },
        notes: {
          customer: orderData.notes
        }
      };

      const response = await ordersAPI.createOrder(order);
      
      if (response.data.success) {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${response.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const renderShippingForm = () => (
    <Box component="form">
      <Typography variant="h6" gutterBottom>
        Shipping Address
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            {...register('street')}
            error={!!errors.street}
            helperText={errors.street?.message}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="City"
            {...register('city')}
            error={!!errors.city}
            helperText={errors.city?.message}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="State"
            {...register('state')}
            error={!!errors.state}
            helperText={errors.state?.message}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="ZIP Code"
            {...register('zipCode')}
            error={!!errors.zipCode}
            helperText={errors.zipCode?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone Number"
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Shipping Method
      </Typography>
      
      <FormControl component="fieldset">
        <RadioGroup
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
        >
          <FormControlLabel
            value="standard"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1">Standard Shipping</Typography>
                <Typography variant="body2" color="text.secondary">
                  5-7 business days • {subtotal > 2000 ? 'FREE' : '₹99'}
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="express"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1">Express Shipping</Typography>
                <Typography variant="body2" color="text.secondary">
                  2-3 business days • ₹199
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="overnight"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1">Overnight Shipping</Typography>
                <Typography variant="body2" color="text.secondary">
                  Next business day • ₹399
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );

  const renderPaymentForm = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>
      
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel
            value="credit_card"
            control={<Radio />}
            label="Credit Card"
          />
          <FormControlLabel
            value="debit_card"
            control={<Radio />}
            label="Debit Card"
          />
          <FormControlLabel
            value="paypal"
            control={<Radio />}
            label="PayPal"
          />
          <FormControlLabel
            value="cash_on_delivery"
            control={<Radio />}
            label="Cash on Delivery"
          />
        </RadioGroup>
      </FormControl>

      {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Payment processing will be handled securely on the next page.
        </Alert>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
          />
        }
        label="Billing address same as shipping address"
      />
    </Box>
  );

  const renderOrderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      
      {/* Order Items */}
      {items.map((item) => (
        <Card key={item._id} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {item.product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {item.quantity}
                  {item.size && ` • Size: ${item.size}`}
                  {item.color && ` • Color: ${item.color}`}
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Shipping Address */}
      <Typography variant="h6" gutterBottom>
        Shipping Address
      </Typography>
      <Typography variant="body2">
        {orderData?.shippingAddress?.firstName} {orderData?.shippingAddress?.lastName}<br />
        {orderData?.shippingAddress?.street}<br />
        {orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state} {orderData?.shippingAddress?.zipCode}<br />
        {orderData?.shippingAddress?.phone}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Payment & Shipping Method */}
      <Typography variant="h6" gutterBottom>
        Payment & Shipping
      </Typography>
      <Typography variant="body2">
        Payment: {paymentMethod.replace('_', ' ').toUpperCase()}<br />
        Shipping: {shippingMethod.charAt(0).toUpperCase() + shippingMethod.slice(1)}
      </Typography>
    </Box>
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && renderShippingForm()}
            {activeStep === 1 && renderPaymentForm()}
            {activeStep === 2 && renderOrderReview()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={activeStep === 0 ? () => navigate('/cart') : handleBack}
                startIcon={<ArrowBack />}
              >
                {activeStep === 0 ? 'Back to Cart' : 'Back'}
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Total
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal ({totalItems} items):</Typography>
              <Typography>₹{subtotal.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax (GST):</Typography>
              <Typography>₹{calculateTax().toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Shipping:</Typography>
              <Typography>
                {calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping().toFixed(2)}`}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ₹{calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
