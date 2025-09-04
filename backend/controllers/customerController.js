const Customer = require('../models/Customer');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (customerId) => {
  return jwt.sign({ customerId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Customer registration
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, password, email, role } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }

    // Create new customer
    const customer = new Customer({
      name,
      phone,
      password,
      email,
      role: role || 'customer'
    });

    await customer.save();

    // Generate token
    const token = generateToken(customer._id);

    const message = customer.role === 'employee' 
      ? 'Employee registered successfully. Your account will be verified by an administrator.'
      : 'Customer registered successfully';

    res.status(201).json({
      success: true,
      message,
      token,
      customer
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Customer login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, password } = req.body;

    // Find customer by phone
    const customer = await Customer.findOne({ phone });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Check if customer is active
    if (!customer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if account is verified (for employees)
    if (customer.role === 'employee' && !customer.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending verification. Please contact the administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await customer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    // Generate token
    const token = generateToken(customer._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      customer
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get customer profile
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get customer orders
exports.getOrders = async (req, res) => {
  try {
    // Check if user is employee or customer and handle accordingly
    const customer = req.customer;
    
    if (customer.role === 'employee') {
      // For employees, get all orders they can see (or their own orders)
      const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .populate('items.menuItemId', 'name price');
      
      res.json({
        success: true,
        data: orders
      });
    } else {
      // For customers, get only their own orders
      const orders = await Order.find({ customerId: req.customerId })
        .sort({ createdAt: -1 })
        .populate('items.menuItemId', 'name price');

      res.json({
        success: true,
        data: orders
      });
    }
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update customer profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, address } = req.body;

    const customer = await Customer.findById(req.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Update fields
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (address) customer.address = address;

    await customer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const customer = await Customer.findById(req.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await customer.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    customer.password = newPassword;
    await customer.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
