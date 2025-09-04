const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  menuItemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MenuItem',
    required: [true, 'Menu item ID is required']
  },
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewType: {
    type: String,
    enum: ['food', 'service'],
    required: [true, 'Review type is required']
  },
  comment: { 
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index for efficient querying
feedbackSchema.index({ menuItemId: 1, reviewType: 1, createdAt: -1 });
feedbackSchema.index({ customerPhone: 1, createdAt: -1 });
feedbackSchema.index({ orderId: 1, customerPhone: 1 });
feedbackSchema.index({ rating: 1, reviewType: 1 });

// Ensure one feedback per customer per menu item per order per review type
feedbackSchema.index({ 
  customerPhone: 1, 
  orderId: 1, 
  menuItemId: 1, 
  reviewType: 1 
}, { unique: true });

// Virtual for rating stars
feedbackSchema.virtual('ratingStars').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Ensure virtuals are included in JSON output
feedbackSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
