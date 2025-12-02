// API Configuration
const API_CONFIG = {
  PORT: process.env.PORT || 5006,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3006',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 1000, // requests per window (increased for development)
  BODY_LIMIT: '10mb'
};

// JWT Configuration
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET,
  EXPIRES_IN: '7d'
};

// Database Configuration
const DB_CONFIG = {
  URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-tamarind'
};

// Order Configuration
const ORDER_CONFIG = {
  STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
    PAID: 'paid',
    CANCELLED: 'cancelled'
  },
  TYPES: {
    DINE_IN: 'dine-in',
    TAKEAWAY: 'takeaway',
    PRE_ORDER: 'pre-order'
  }
};

// Payment Configuration
const PAYMENT_CONFIG = {
  CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',
  TAX_RATE: 0.08, // 8% tax rate
  SERVICE_CHARGE: 0.05 // 5% service charge
};

// OTP Configuration
const OTP_CONFIG = {
  ENABLED: process.env.OTP_ENABLED !== 'false', // Default: true, set OTP_ENABLED=false to disable
  EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5,
  MAX_ATTEMPTS: 5,
  LENGTH: 4
};

// Validation Rules
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// File Upload Configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  UPLOAD_PATH: 'uploads/'
};

module.exports = {
  API_CONFIG,
  JWT_CONFIG,
  DB_CONFIG,
  ORDER_CONFIG,
  PAYMENT_CONFIG,
  OTP_CONFIG,
  VALIDATION_RULES,
  UPLOAD_CONFIG
};
