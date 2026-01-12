const mongoose = require('mongoose');

const orderReviewSchema = new mongoose.Schema({
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: [true, 'Order ID is required'],
    unique: true // One review per order
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer'
  },
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  // Optional item-level ratings
  itemRatings: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Item comment cannot exceed 500 characters']
    }
  }]
}, { 
  timestamps: true 
});

// Index for efficient querying
orderReviewSchema.index({ orderId: 1 }, { unique: true });
orderReviewSchema.index({ customerPhone: 1, createdAt: -1 });
orderReviewSchema.index({ customerId: 1, createdAt: -1 });
orderReviewSchema.index({ rating: 1, createdAt: -1 });

// Virtual for rating stars
orderReviewSchema.virtual('ratingStars').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Ensure virtuals are included in JSON output
orderReviewSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('OrderReview', orderReviewSchema);

