import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  SportsSoccer,
  PersonAdd,
  ArrowForward
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';

// Validation schema
const schema = yup.object({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().matches(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  street: yup.string(),
  city: yup.string(),
  state: yup.string(),
  zipCode: yup.string().matches(/^\d{5,6}$/, 'Invalid ZIP code format')
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, error, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode
      }
    };

    const result = await registerUser(userData);
    
    if (result.success) {
      navigate('/', { replace: true });
    }
    
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(253, 216, 53, 0.15) 0%, rgba(253, 216, 53, 0.15) 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(253, 216, 53, 0.1), rgba(253, 216, 53, 0.1))',
          animation: 'float 8s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(253, 216, 53, 0.1), rgba(253, 216, 53, 0.1))',
          animation: 'float 6s ease-in-out infinite reverse'
        }}
      />

      <Container maxWidth="md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(253, 216, 53, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <SportsSoccer 
                    sx={{ 
                      fontSize: 60, 
                      color: 'primary.main',
                      mb: 2,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }} 
                  />
                </motion.div>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #FDD835, #FDD835)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Join SportsLine
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Create your customer account and start shopping
                </Typography>
              </Box>
            </motion.div>

            <motion.div variants={itemVariants}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  {/* Personal Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Personal Information
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      {...register('firstName')}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(253, 216, 53, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      {...register('lastName')}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(253, 216, 53, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>

                  {/* Contact Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 2 }}>
                      Contact Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(253, 216, 53, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...register('phone')}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(253, 216, 53, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>

                  {/* Password Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 2 }}>
                      Account Security
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(253, 216, 53, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(253, 216, 53, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                        endIcon={!loading && <ArrowForward />}
                        sx={{
                          mt: 3,
                          mb: 2,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #FDD835, #FDD835)',
                          boxShadow: '0 4px 15px rgba(253, 216, 53, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #F57F17, #F57F17)',
                            boxShadow: '0 6px 20px rgba(253, 216, 53, 0.6)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        {loading ? 'Creating Account...' : 'Create Customer Account'}
                      </Button>
                    </motion.div>

                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Already have an account?
                      </Typography>
                    </Divider>

                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="outlined"
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(253, 216, 53, 0.2)'
                        }
                      }}
                    >
                      Sign In Instead
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </Box>
  );
};

export default Register;
