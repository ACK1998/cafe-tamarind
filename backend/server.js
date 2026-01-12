const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const { API_CONFIG } = require('./config/constants');

// Import routes
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Connect to MongoDB for production (Vercel serverless)
// In serverless environments, we need to connect when the module loads
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  const mongoose = require('mongoose');
  // Check if already connected
  if (mongoose.connection.readyState === 0) {
    // Connect immediately for serverless (connection is cached)
    // Don't await here - let it connect in background, middleware will handle it
    connectDB().catch(err => {
      console.error('❌ Initial DB connection failed:', err.message);
      console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    });
  }
}

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting - skip OPTIONS requests (preflight)
const limiter = rateLimit({
  windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  max: API_CONFIG.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Skip rate limiting for preflight requests
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(API_CONFIG.RATE_LIMIT_WINDOW / 1000)
  },
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(API_CONFIG.RATE_LIMIT_WINDOW / 1000)
    });
  }
});

app.use('/api/', limiter);

// CORS configuration - allow localhost and network IPs for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize origin (remove trailing slash, convert to lowercase for comparison)
    const normalizedOrigin = origin.replace(/\/+$/, '').toLowerCase();
    
    const allowedOrigins = [
      API_CONFIG.CORS_ORIGIN,
      process.env.FRONTEND_URL,
      'http://localhost:3006',
      'http://127.0.0.1:3006'
    ]
      .filter(Boolean) // Remove undefined values
      .map(o => o.replace(/\/+$/, '').toLowerCase()); // Normalize
    
    // Log CORS configuration on startup (first request)
    if (!corsOptions._logged) {
      console.log('🌐 CORS Configuration:', {
        CORS_ORIGIN: API_CONFIG.CORS_ORIGIN,
        FRONTEND_URL: process.env.FRONTEND_URL,
        allowedOrigins: allowedOrigins,
        receivedOrigin: origin
      });
      corsOptions._logged = true;
    }
    
    // Check if origin matches any allowed origin (normalized comparison)
    const isAllowedOrigin = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.toLowerCase();
      return normalizedOrigin === normalizedAllowed || 
             normalizedOrigin.startsWith(normalizedAllowed);
    });
    
    // Also allow any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const isLocalNetwork = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/i.test(origin);
    
    // Allow Vercel frontend URLs (production and preview deployments)
    const isVercelFrontend = /^https:\/\/cafe-tamarind-frontend(-[a-z0-9]+)?\.vercel\.app$/i.test(origin);
    
    if (isAllowedOrigin || isLocalNetwork || isVercelFrontend) {
      console.log(`✅ CORS allowed: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      console.warn(`   Is Vercel frontend: ${isVercelFrontend}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: API_CONFIG.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Request logging for debugging (production only)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`, {
      query: req.query,
      body: req.method !== 'GET' ? 'present' : 'none'
    });
    next();
  });
}

// Middleware to ensure DB connection in production (for serverless cold starts)
// Skip for OPTIONS requests (preflight) and health checks
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.use(async (req, res, next) => {
    // Skip DB check for OPTIONS requests (preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    const mongoose = require('mongoose');
    const readyState = mongoose.connection.readyState;
    
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (readyState === 0 || readyState === 3) {
      try {
        console.log('🔄 Establishing DB connection...');
        await connectDB();
        console.log('✅ DB connection established');
      } catch (error) {
        console.error('❌ DB connection failed in middleware:', error.message);
        console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
        console.error('NODE_ENV:', process.env.NODE_ENV);
        console.error('VERCEL:', !!process.env.VERCEL);
        
        // Don't block health check endpoint
        if (req.path === '/api/health') {
          return next();
        }
        
        return res.status(503).json({ 
          success: false, 
          message: 'Database connection failed. Please try again.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } else if (readyState === 2) {
      // Connection in progress, wait for it
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 10000);
          
          mongoose.connection.once('connected', () => {
            clearTimeout(timeout);
            resolve();
          });
          
          mongoose.connection.once('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      } catch (error) {
        console.error('❌ DB connection wait failed:', error.message);
        return res.status(503).json({ 
          success: false, 
          message: 'Database connection failed. Please try again.' 
        });
      }
    }
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/reviews', reviewRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cafe Tamarind API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      customers: '/api/customers',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'OK', 
    message: 'Cafe Tamarind API is running',
    database: {
      status: dbStates[dbStatus] || 'unknown',
      readyState: dbStatus
    },
    environment: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler - only for unmatched routes
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

const PORT = API_CONFIG.PORT;

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // For local development
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 API available at http://localhost:${PORT}/api`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (process.env.NODE_ENV !== 'production') {
  startServer();
}

// Export for Vercel
module.exports = app;
