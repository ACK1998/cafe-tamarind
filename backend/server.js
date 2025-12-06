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

const app = express();

// Connect to MongoDB for production (Vercel serverless)
// In serverless environments, we need to connect when the module loads
if (process.env.NODE_ENV === 'production') {
  const mongoose = require('mongoose');
  // Check if already connected
  if (mongoose.connection.readyState === 0) {
    // Connect immediately for serverless (connection is cached)
    connectDB().catch(err => {
      console.error('❌ Initial DB connection failed:', err);
    });
  }
}

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  max: API_CONFIG.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
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

// CORS configuration
app.use(cors({
  origin: API_CONFIG.CORS_ORIGIN,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: API_CONFIG.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Middleware to ensure DB connection in production (for serverless cold starts)
if (process.env.NODE_ENV === 'production') {
  app.use(async (req, res, next) => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 0) {
      try {
        await connectDB();
      } catch (error) {
        console.error('❌ DB connection failed in middleware:', error);
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
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
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
