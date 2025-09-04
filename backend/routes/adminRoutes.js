const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customerController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validation middleware
const validateUserUpdate = [
  body('role').optional().isIn(['customer', 'employee']).withMessage('Role must be customer or employee'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

// All routes require admin authentication
router.use(protect);
router.use(admin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/unverified', adminController.getUnverifiedUsers);
router.get('/users/role/:role', adminController.getUsersByRole);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', validateUserUpdate, adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Customer management routes with order totals
router.get('/customers/with-totals', customerController.getAllCustomersWithOrderTotals);

module.exports = router;
