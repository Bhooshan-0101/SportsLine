import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
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
  SportsSoccer,
  Login as LoginIcon,
  ArrowForward
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });



  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use unified login that automatically detects user role
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Role-based redirection
        const redirectPath = result.redirectPath || '/';
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
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
        background: `linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)`,
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
          top: '10%',
          right: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(253, 216, 53, 0.1), rgba(255, 235, 59, 0.1))',
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(255, 235, 59, 0.1), rgba(253, 216, 53, 0.1))',
          animation: 'float 8s ease-in-out infinite reverse'
        }}
      />

      <Container maxWidth="sm">
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
              background: '#FFFFFF',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(253, 216, 53, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              color: '#000000',
              boxShadow: '0 20px 40px rgba(253, 216, 53, 0.15)'
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
                      color: '#FDD835',
                      mb: 2,
                      filter: 'drop-shadow(0 4px 8px rgba(253, 216, 53, 0.3))'
                    }}
                  />
                </motion.div>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, #FDD835, #FFEB3B)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  SportsLine
                </Typography>
                <Typography variant="h6" sx={{ color: '#424242' }}>
                  Welcome Back! Sign in to access your account
                </Typography>
              </Box>
            </motion.div>





            {/* Login Form */}
            <motion.div variants={itemVariants}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
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
                        backgroundColor: '#FFFFFF',
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                          borderColor: 'rgba(253, 216, 53, 0.5)',
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(253, 216, 53, 0.3)',
                          '& fieldset': {
                            borderColor: '#FDD835',
                          },
                        },
                        '&.Mui-focused': {
                          '& fieldset': {
                            borderColor: '#F57F17',
                            borderWidth: 2,
                          },
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#424242',
                        '&.Mui-focused': {
                          color: '#F57F17',
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
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
                        backgroundColor: '#FFFFFF',
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                          borderColor: 'rgba(253, 216, 53, 0.5)',
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(253, 216, 53, 0.3)',
                          '& fieldset': {
                            borderColor: '#FDD835',
                          },
                        },
                        '&.Mui-focused': {
                          '& fieldset': {
                            borderColor: '#F57F17',
                            borderWidth: 2,
                          },
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#424242',
                        '&.Mui-focused': {
                          color: '#F57F17',
                        },
                      },
                    }}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading || loading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                      endIcon={!isLoading && <ArrowForward />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #FDD835, #FFEB3B)',
                        color: '#000000',
                        boxShadow: '0 4px 15px rgba(253, 216, 53, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #F57F17, #FDD835)',
                          boxShadow: '0 6px 20px rgba(253, 216, 53, 0.6)',
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          background: '#E0E0E0',
                          color: '#9E9E9E'
                        }
                      }}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </motion.div>
                </Box>
              </form>
            </motion.div>

            {/* Customer Registration Link */}
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Divider sx={{ my: 3, borderColor: 'rgba(253, 216, 53, 0.3)' }}>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  New Customer?
                </Typography>
              </Divider>

              <Button
                component={Link}
                to="/register"
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderWidth: 2,
                  borderColor: '#FDD835',
                  color: '#000000',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#F57F17',
                    backgroundColor: 'rgba(253, 216, 53, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(253, 216, 53, 0.3)'
                  }
                }}
              >
                Create Customer Account
              </Button>
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

export default Login;
