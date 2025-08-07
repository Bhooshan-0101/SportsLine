import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import { getImageUrl } from '../../utils/helpers';
import { motion } from 'framer-motion';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { 
  SportsSoccer, 
  EmojiEvents, 
  Store, 
  LocalShipping,
  Security,
  Support,
  FitnessCenter,
  Pool,
  DirectionsRun,
  SportsBasketball,
  SportsVolleyball,
  ArrowForward,
  GetApp,
  Apple,
  Android,
  TrendingUp,
  Favorite,
  ShoppingCart
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CustomerHome = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getProducts({ featured: true, limit: 6 });
        setFeaturedProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Sports categories inspired by Decathlon
  const sportsCategories = [
    {
      icon: <SportsSoccer fontSize="large" />,
      title: 'Football',
      description: 'Jerseys, Boots & Equipment',
      color: '#4CAF50',
      link: '/products?category=football'
    },
    {
      icon: <SportsBasketball fontSize="large" />,
      title: 'Basketball',
      description: 'Shoes, Jerseys & Accessories',
      color: '#FF9800',
      link: '/products?category=basketball'
    },
    {
      icon: <DirectionsRun fontSize="large" />,
      title: 'Running',
      description: 'Shoes, Apparel & Gear',
      color: '#2196F3',
      link: '/products?category=running'
    },
    {
      icon: <FitnessCenter fontSize="large" />,
      title: 'Fitness',
      description: 'Equipment & Accessories',
      color: '#9C27B0',
      link: '/products?category=fitness'
    },
    {
      icon: <SportsVolleyball fontSize="large" />,
      title: 'Volleyball',
      description: 'Balls, Nets & Uniforms',
      color: '#FF5722',
      link: '/products?category=volleyball'
    },
    {
      icon: <Pool fontSize="large" />,
      title: 'Swimming',
      description: 'Swimwear & Equipment',
      color: '#00BCD4',
      link: '/products?category=swimming'
    }
  ];

  const features = [
    {
      icon: <Store fontSize="large" />,
      title: 'Wide Selection',
      description: 'Extensive range of sports products from jerseys to trophies'
    },
    {
      icon: <SportsSoccer fontSize="large" />,
      title: 'Custom Jerseys',
      description: 'Bulk jersey orders with custom designs and player names'
    },
    {
      icon: <LocalShipping fontSize="large" />,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to your doorstep'
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Secure Shopping',
      description: 'Safe and secure payment processing'
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      title: 'Quality Products',
      description: 'Premium quality sports gear and equipment'
    },
    {
      icon: <Support fontSize="large" />,
      title: '24/7 Support',
      description: 'Dedicated customer support team'
    }
  ];

  // Quick stats for customer - removed to clean up homepage
  const quickStats = [];

  return (
    <Box>
      {/* Personalized Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '60vh', md: '70vh' },
          background: 'linear-gradient(135deg, rgba(253, 216, 53, 0.9) 0%, rgba(255, 235, 59, 0.9) 100%), url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop") center/cover',
          display: 'flex',
          alignItems: 'center',
          color: '#1a1a1a',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Typography
                  variant={isMobile ? 'h4' : 'h2'}
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    mb: 2
                  }}
                >
                  Welcome back, {user?.firstName}!
                </Typography>
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{
                    mb: 3,
                    color: '#000000',
                    fontWeight: 500,
                    lineHeight: 1.4
                  }}
                >
                  Ready for your next sports adventure?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    color: '#000000',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    maxWidth: 500
                  }}
                >
                  Discover new gear, track your orders, and get personalized recommendations 
                  based on your favorite sports.
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      to="/products"
                      startIcon={<Store />}
                      sx={{
                        bgcolor: '#1a1a1a',
                        color: 'white',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        '&:hover': {
                          bgcolor: '#2c2c2c',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Shop Now
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      to="/dashboard"
                      sx={{
                        borderColor: '#1a1a1a',
                        color: '#1a1a1a',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderWidth: 2,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': {
                          borderColor: '#2c2c2c',
                          bgcolor: 'rgba(255,255,255,1)',
                          borderWidth: 2,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      My Dashboard
                    </Button>
                  </motion.div>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <Grid container spacing={2}>
                  {quickStats.map((stat, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper
                        component={Link}
                        to={stat.link}
                        elevation={4}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            color: stat.color,
                            mr: 2,
                            p: 1,
                            borderRadius: '50%',
                            bgcolor: `${stat.color}15`
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {stat.title}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sports Categories Section - Decathlon Style */}
      <Container maxWidth="lg" sx={{ py: 8, bgcolor: 'white' }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            mb: 2,
            color: '#1a1a1a'
          }}
        >
          Shop by Sport
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{
            mb: 6,
            color: '#666',
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Find the perfect equipment for your favorite sport. From football to fitness,
          we have everything you need to perform at your best.
        </Typography>
        <Grid container spacing={3}>
          {sportsCategories.map((category, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card
                  component={Link}
                  to={category.link}
                  sx={{
                    textDecoration: 'none',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    borderRadius: 3,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: category.color,
                      boxShadow: `0 8px 25px ${category.color}20`,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      color: category.color,
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: `${category.color}10`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: category.color,
                        color: 'white'
                      }
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      mb: 1,
                      fontSize: '1rem'
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      color: '#666',
                      fontSize: '0.85rem'
                    }}
                  >
                    {category.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: '#1a1a1a'
              }}
            >
              Recommended for You
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666'
              }}
            >
              Products picked just for you based on your interests
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/products"
            endIcon={<ArrowForward />}
            sx={{
              color: '#FDD835',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(253, 216, 53, 0.1)'
              }
            }}
          >
            View All
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center">
            <Typography sx={{ color: '#000000' }}>Loading featured products...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featuredProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      bgcolor: 'white',
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(253, 216, 53, 0.2)',
                        borderColor: '#FDD835',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={getImageUrl(product.images?.[0]?.url)}
                      alt={product.name}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        sx={{
                          color: '#000000',
                          fontWeight: 'bold',
                          mb: 2
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          color: '#000000',
                          lineHeight: 1.5
                        }}
                      >
                        {product.shortDescription || product.description?.substring(0, 100) + '...'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: '#FDD835',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          {formatCurrency(product.price)}
                        </Typography>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{ textDecoration: 'line-through', color: '#000000' }}
                            >
                              {formatCurrency(product.comparePrice)}
                            </Typography>
                            <Chip
                              label={`${product.discountPercentage}% OFF`}
                              size="small"
                              sx={{
                                bgcolor: '#FDD835',
                                color: '#000000',
                                fontWeight: 'bold'
                              }}
                            />
                          </>
                        )}
                      </Box>
                      <Chip
                        label={product.category.replace('-', ' ').toUpperCase()}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#FDD835',
                          color: '#000000',
                          fontWeight: 500
                        }}
                      />
                    </CardContent>
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        size="small"
                        component={Link}
                        to={`/products/${product._id}`}
                        fullWidth
                        variant="contained"
                        sx={{
                          bgcolor: '#1a1a1a',
                          color: 'white',
                          fontWeight: 'bold',
                          borderRadius: 2,
                          py: 1,
                          '&:hover': {
                            bgcolor: '#2c2c2c',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              mb: 6,
              color: '#1a1a1a'
            }}
          >
            Why Choose SportsLine?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      bgcolor: 'white',
                      borderRadius: 3,
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(253, 216, 53, 0.2)',
                        borderColor: '#FDD835'
                      }
                    }}
                  >
                    <Box sx={{
                      color: '#FDD835',
                      mb: 3,
                      '& svg': {
                        fontSize: '3.5rem'
                      }
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        color: '#1a1a1a',
                        mb: 2
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        lineHeight: 1.6
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>



      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FDD835 0%, #FFEB3B 100%)',
            color: '#1a1a1a',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.1)',
              zIndex: 1
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: '#000000',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Need Custom Team Jerseys?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: '#000000',
                fontWeight: 500
              }}
            >
              Get bulk pricing and custom designs for your team
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/bulk-jersey-order"
              startIcon={<SportsSoccer />}
              sx={{
                bgcolor: '#1a1a1a',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: '#2c2c2c',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                }
              }}
            >
              Start Your Bulk Order
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CustomerHome;
