import React from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { Construction, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageFallback = ({ 
  title = "Page Under Construction", 
  message = "This page is currently being developed. Please check back later.",
  showHomeButton = true,
  loading = false 
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="50vh"
      p={3}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          textAlign: 'center', 
          maxWidth: 500,
          borderRadius: 2
        }}
      >
        <Construction 
          sx={{ 
            fontSize: 64, 
            color: 'warning.main', 
            mb: 2 
          }} 
        />
        <Typography variant="h4" gutterBottom color="text.primary">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {message}
        </Typography>
        
        {showHomeButton && (
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<Home />}
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PageFallback;
