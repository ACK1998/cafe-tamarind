const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  submitFeedback,
  getOrderFeedback,
  getMenuItemFeedback,
  canReviewOrder,
  getAllFeedback,
  deleteFeedback,
  getFeedbackAnalytics
} = require('../controllers/feedbackController');

const router = express.Router();

// Validation middleware for feedback submission
const submitFeedbackValidation = [
  body('customerPhone')
    .isMobilePhone()
    .withMessage('Valid customer phone is required'),
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required'),
  body('reviews')
    .isArray({ min: 1 })
    .withMessage('At least one review is required'),
  body('reviews.*.menuItemId')
    .isMongoId()
    .withMessage('Valid menu item ID is required'),
  body('reviews.*.foodRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Food rating must be between 1 and 5'),
  body('reviews.*.serviceRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service rating must be between 1 and 5'),
  body('reviews.*.comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  body('reviews.*.isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean')
];

// Parameter validation
const mongoIdValidation = [
  param('orderId').isMongoId().withMessage('Valid order ID is required')
];

const menuItemIdValidation = [
  param('menuItemId').isMongoId().withMessage('Valid menu item ID is required')
];

const feedbackIdValidation = [
  param('feedbackId').isMongoId().withMessage('Valid feedback ID is required')
];

// Query validation for pagination and filtering
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Public routes
router.post('/', submitFeedbackValidation, submitFeedback);
router.get('/order/:orderId', mongoIdValidation, getOrderFeedback);
router.get('/item/:menuItemId', menuItemIdValidation, paginationValidation, getMenuItemFeedback);
router.get('/can-review/:orderId', mongoIdValidation, canReviewOrder);

// Admin routes
router.get('/admin/all', protect, admin, paginationValidation, getAllFeedback);
router.get('/admin/analytics', protect, admin, getFeedbackAnalytics);
router.delete('/admin/:feedbackId', protect, admin, feedbackIdValidation, deleteFeedback);

module.exports = router;
