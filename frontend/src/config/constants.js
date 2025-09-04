// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://cafe-tamarind-backend.vercel.app/api' 
      : 'http://localhost:5006/api'),
  TIMEOUT: 10000
};

// Feature Configuration
export const FEATURE_CONFIG = {
  OTP_ENABLED: process.env.REACT_APP_OTP_ENABLED !== 'false', // Default: true, set REACT_APP_OTP_ENABLED=false to disable
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true'
};

// Currency Configuration
export const CURRENCY_CONFIG = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN'
};

// Order Configuration
export const ORDER_CONFIG = {
  STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  TYPES: {
    DINE_IN: 'dine-in',
    TAKEAWAY: 'takeaway',
    PRE_ORDER: 'pre-order'
  }
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  TAX_RATE: 0.08, // 8% tax rate
  SERVICE_CHARGE: 0.05 // 5% service charge
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^\+?[\d\s\-()]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Theme Configuration
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#1f2937',
    SECONDARY: '#6b7280',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  CUSTOMER_TOKEN: 'customerToken',
  CART: 'cart',
  THEME: 'theme'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',

  ADMIN_PROFILE: '/admin/profile',
  ADMIN_ORDERS: '/admin/orders'
};
