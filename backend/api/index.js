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
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    data: { test: true }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel
module.exports = app;
