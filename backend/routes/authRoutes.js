const express = require('express');
const { body } = require('express-validator');
const { login, getMe, generateOTPForCustomer, verifyOTP, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], login);

// @route   GET /api/auth/me
// @desc    Get current admin user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update admin profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  body('currentPassword').optional().isLength({ min: 6 }).withMessage('Current password must be at least 6 characters'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], updateProfile);

// @route   POST /api/auth/generate-otp
// @desc    Generate OTP for customer verification
// @access  Public
router.post('/generate-otp', [
  body('phone').isMobilePhone().withMessage('Please enter a valid phone number')
], generateOTPForCustomer);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for customer
// @access  Public
router.post('/verify-otp', [
  body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('otp').isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits')
], verifyOTP);

module.exports = router;
