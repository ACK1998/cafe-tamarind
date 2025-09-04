const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const customerAuth = require('../middlewares/customerAuth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
];

const loginValidation = [
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/register', registerValidation, customerController.register);
router.post('/login', loginValidation, customerController.login);

// Protected routes (require authentication)
router.get('/profile', customerAuth, customerController.getProfile);
router.get('/orders', customerAuth, customerController.getOrders);
router.put('/profile', customerAuth, updateProfileValidation, customerController.updateProfile);
router.put('/change-password', customerAuth, changePasswordValidation, customerController.changePassword);

module.exports = router;
