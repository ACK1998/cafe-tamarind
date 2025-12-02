const express = require('express');
const { body } = require('express-validator');
const { protect, admin, optionalAuth } = require('../middlewares/authMiddleware');
const { optionalCustomerAuth } = require('../middlewares/customerAuth');
const {
  placeOrder,
  getOrder,
  getCustomerOrders,
  getAllOrders,
  getAdminCustomerOrders,
  getInHouseOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

// Validation middleware
const orderValidation = [
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Customer name must be between 2 and 50 characters'),
  body('customerPhone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.menuItemId')
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  body('items.*.qty')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('mealTime')
    .isIn(['breakfast', 'lunch', 'dinner', 'pre-order'])
    .withMessage('Invalid meal time'),
  body('specialInstructions')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Special instructions cannot exceed 200 characters'),
  body('isPreOrder')
    .optional()
    .isBoolean()
    .withMessage('isPreOrder must be a boolean'),
  body('preOrderDateTime')
    .optional()
    .isISO8601()
    .withMessage('Pre-order date time must be a valid ISO date'),
  body('orderType')
    .optional()
    .isIn(['NOW', 'PREORDER'])
    .withMessage('Invalid order type'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date time must be a valid ISO date')
];

const statusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'paid', 'cancelled'])
    .withMessage('Invalid status')
];

// Customer routes (no authentication required)
// Allow optional auth; server will honor inhouse pricing for admin or employee customers
router.post('/', optionalAuth, optionalCustomerAuth, orderValidation, placeOrder);
router.get('/:orderId', getOrder);
router.get('/customer/:phone', getCustomerOrders);

// Admin routes (authentication required)
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/admin/customer', protect, admin, getAdminCustomerOrders);
router.get('/admin/inhouse', protect, admin, getInHouseOrders);
router.put('/admin/:orderId', protect, admin, statusValidation, updateOrderStatus);

module.exports = router;
