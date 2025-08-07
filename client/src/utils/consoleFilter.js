// Console filter utility to suppress common development warnings and errors
// This helps clean up the browser console during development

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// List of messages to filter out
const FILTERED_MESSAGES = [
  // React warnings
  'Warning: ReactDOM.render is no longer supported',
  'Warning: componentWillReceiveProps has been renamed',
  'Warning: componentWillMount has been renamed',
  'Warning: componentWillUpdate has been renamed',

  // React Router future flags
  'React Router Future Flag Warning',
  'v7_startTransition',
  'v7_relativeSplatPath',
  'future flag to opt-in early',
  
  // Material-UI warnings
  'Material-UI: The `fade` color utility was renamed to `alpha`',
  'Material-UI: The color utility was renamed',
  
  // Development server warnings
  'webpack-dev-server',
  'HMR',
  'Hot Module Replacement',
  
  // Common API warnings during development
  'Failed to load resource: the server responded with a status of 404',
  'Failed to load resource: the server responded with a status of 500',
  
  // Passive event listener warnings
  'Added non-passive event listener',
  'Unable to preventDefault inside passive event listener',
  
  // Source map warnings
  'DevTools failed to load SourceMap',
  'Could not load content for',
  
  // Network errors during development
  'NetworkError when attempting to fetch resource',
  'TypeError: Failed to fetch',
  
  // Console spam from libraries
  'The above error occurred in the',
  'Consider adding an error boundary',
  
  // Image loading errors (common during development)
  'GET http://localhost:3000/static/media/',
  'GET http://localhost:5000/uploads/',
  
  // Authentication warnings
  'Token expired',
  'Invalid token',
  
  // Development mode warnings
  'You are running Vue in development mode',
  'Download the React DevTools',
];

// Function to check if a message should be filtered
const shouldFilterMessage = (message) => {
  if (typeof message !== 'string') return false;
  
  return FILTERED_MESSAGES.some(filter => 
    message.toLowerCase().includes(filter.toLowerCase())
  );
};

// Enhanced console.error with filtering
console.error = (...args) => {
  try {
    const message = args.join(' ');

    // Don't filter actual application errors in production
    if (process.env.NODE_ENV === 'production') {
      return originalConsoleError.apply(console, args);
    }

    // Filter out known development warnings
    if (!shouldFilterMessage(message)) {
      return originalConsoleError.apply(console, args);
    }
  } catch (error) {
    // Fallback to original console.error if filtering fails
    return originalConsoleError.apply(console, args);
  }
};

// Enhanced console.warn with filtering
console.warn = (...args) => {
  try {
    const message = args.join(' ');

    // Don't filter warnings in production
    if (process.env.NODE_ENV === 'production') {
      return originalConsoleWarn.apply(console, args);
    }

    // Filter out known development warnings
    if (!shouldFilterMessage(message)) {
      return originalConsoleWarn.apply(console, args);
    }
  } catch (error) {
    // Fallback to original console.warn if filtering fails
    return originalConsoleWarn.apply(console, args);
  }
};

// Keep console.log unchanged for debugging
console.log = (...args) => {
  return originalConsoleLog.apply(console, args);
};

// Utility functions for manual filtering control
export const enableConsoleFiltering = () => {
  console.info('Console filtering enabled - development warnings will be suppressed');
};

export const disableConsoleFiltering = () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  console.info('Console filtering disabled - all messages will be shown');
};

// Add custom error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    try {
      // Don't filter actual application errors
      if (process.env.NODE_ENV === 'production') {
        console.error('Unhandled promise rejection:', event.reason);
        return;
      }

      // Filter common development promise rejections
      const reason = event.reason?.toString() || '';
      if (!shouldFilterMessage(reason)) {
        console.error('Unhandled promise rejection:', event.reason);
      }
    } catch (error) {
      // Fallback to original error logging
      originalConsoleError('Unhandled promise rejection:', event.reason);
    }
  });
}

// Initialize filtering in development mode
// Temporarily disabled for debugging
// if (process.env.NODE_ENV === 'development') {
//   enableConsoleFiltering();
// }

export default {
  enableConsoleFiltering,
  disableConsoleFiltering,
  shouldFilterMessage,
  FILTERED_MESSAGES
};
