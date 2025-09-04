// Minimal API for Vercel testing
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cafe Tamarind API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    config: {
      otpEnabled: process.env.OTP_ENABLED !== 'false'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    data: { test: true }
  });
});

// OTP endpoints (simplified for testing)
app.post('/api/auth/generate-otp', (req, res) => {
  const { phone } = req.body;
  
  if (process.env.OTP_ENABLED === 'false') {
    return res.json({
      success: true,
      data: {
        phone,
        message: 'OTP is disabled. Order will be placed directly.',
        otpDisabled: true
      },
      message: 'OTP verification skipped'
    });
  }
  
  // If OTP is enabled but we don't have database, return success for testing
  res.json({
    success: true,
    data: {
      phone,
      expiresIn: '5 minutes',
      message: 'OTP sent successfully (test mode)'
    },
    message: 'OTP sent successfully'
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  
  if (process.env.OTP_ENABLED === 'false') {
    return res.json({
      success: true,
      data: {
        phone,
        message: 'OTP verification skipped - OTP is disabled',
        otpDisabled: true
      },
      message: 'OTP verification skipped'
    });
  }
  
  // If OTP is enabled, accept any 4-digit code for testing
  if (otp && otp.length === 4) {
    res.json({
      success: true,
      data: null,
      message: 'OTP verified successfully (test mode)'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP format'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel
module.exports = app;
