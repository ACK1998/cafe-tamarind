// API Rate Limiting and Debouncing Utilities

// Debounce function to prevent rapid API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit API call frequency
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Retry mechanism for failed API calls
export const retryApiCall = async (apiCall, maxRetries = 2, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      console.log(`API call failed (attempt ${i + 1}/${maxRetries}):`, error.response?.status, error.message);
      
      if (error.response?.status === 429) {
        // Rate limited - don't retry, just throw the error
        console.log('Rate limited - not retrying');
        throw error;
      }
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Other errors - wait a bit and retry
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// API call wrapper with rate limiting
export const apiCallWithRetry = (apiCall, options = {}) => {
  const { maxRetries = 3, delay = 1000 } = options;
  return retryApiCall(apiCall, maxRetries, delay);
};
