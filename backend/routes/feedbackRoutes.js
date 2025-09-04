const express = require('express');
const { body } = require('express-validator');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Validation middleware
const feedbackValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Placeholder routes - will be implemented with feedback controller
router.post('/', protect, feedbackValidation, (req, res) => {
  res.json({ message: 'Feedback submission - to be implemented' });
});

router.get('/admin', protect, admin, (req, res) => {
  res.json({ message: 'Admin feedback view - to be implemented' });
});

module.exports = router;
