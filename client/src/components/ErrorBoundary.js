import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={3}
          bgcolor="background.default"
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
            <ErrorOutline 
              sx={{ 
                fontSize: 64, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  textAlign: 'left'
                }}
              >
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Error Details (Development Mode):
                </Typography>
                <Typography 
                  variant="caption" 
                  component="pre" 
                  sx={{ 
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: 200
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={this.handleReload}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
