import { toast as reactToastify } from 'react-toastify';

// Custom toast configuration to prevent passive event listener warnings
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false, // Disable dragging to prevent passive event listener issues
  progress: undefined,
  theme: "light",
  style: {
    borderRadius: '12px',
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
  }
};

// Custom toast functions with consistent configuration
export const toast = {
  success: (message, options = {}) => {
    return reactToastify.success(message, {
      ...toastConfig,
      ...options,
      className: 'toast-success',
    });
  },
  
  error: (message, options = {}) => {
    return reactToastify.error(message, {
      ...toastConfig,
      ...options,
      className: 'toast-error',
    });
  },
  
  warning: (message, options = {}) => {
    return reactToastify.warning(message, {
      ...toastConfig,
      ...options,
      className: 'toast-warning',
    });
  },
  
  info: (message, options = {}) => {
    return reactToastify.info(message, {
      ...toastConfig,
      ...options,
      className: 'toast-info',
    });
  },
  
  // Generic toast function
  show: (message, options = {}) => {
    return reactToastify(message, {
      ...toastConfig,
      ...options,
    });
  },
  
  // Dismiss functions
  dismiss: reactToastify.dismiss,
  dismissAll: () => reactToastify.dismiss(),
};

// Export default toast object
export default toast;
