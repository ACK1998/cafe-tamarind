const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  generateToken,
  validateToken,
  submitReview,
  getOrderReview,
  getAllReviews
} = require('../controllers/reviewController');

const router = express.Router();

// Validation middleware
const submitReviewValidation = [
  body('token')
    .notEmpty()
    .withMessage('Review token is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('itemRatings')
    .optional()
    .isArray()
    .withMessage('Item ratings must be an array'),
  body('itemRatings.*.menuItemId')
    .optional()
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  body('itemRatings.*.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Item rating must be between 1 and 5'),
  body('itemRatings.*.comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Item comment cannot exceed 500 characters')
];

const generateTokenValidation = [
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required')
];

const mongoIdValidation = [
  param('orderId').isMongoId().withMessage('Valid order ID is required')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Public routes
router.post('/generate-token', generateTokenValidation, generateToken);
router.get('/validate-token', [
  query('token').notEmpty().withMessage('Review token is required')
], validateToken);
router.post('/submit', submitReviewValidation, submitReview);
router.get('/order/:orderId', mongoIdValidation, getOrderReview);

// Admin routes
router.get('/admin/all', protect, admin, paginationValidation, getAllReviews);

module.exports = router;

