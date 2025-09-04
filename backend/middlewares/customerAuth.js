const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const customerAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.customerId);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Customer not found.'
      });
    }

    if (!customer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.customerId = customer._id;
    req.customer = customer;
    next();
  } catch (error) {
    console.error('Customer auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Optional customer authentication - doesn't fail if no token
const optionalCustomerAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const customer = await Customer.findById(decoded.customerId);

      if (customer && customer.isActive) {
        req.customerId = customer._id;
        req.customer = customer;
      }
    }
    
    next();
  } catch (error) {
    // Token is invalid, but we don't fail the request
    console.log('Optional customer auth token invalid:', error.message);
    next();
  }
};

module.exports = { customerAuth, optionalCustomerAuth };
