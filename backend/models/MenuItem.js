const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  inHousePrice: {
    type: Number,
    min: [0, 'In-house price cannot be negative'],
    default: null
  },
  stock: { 
    type: Number, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  category: { 
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  portion: {
    type: String,
    enum: ['Half', 'Full', 'Single', 'Double', 'Regular'],
    default: 'Regular'
  },
  type: {
    type: String,
    enum: ['CUSTOMER', 'INHOUSE'],
    default: 'CUSTOMER'
  },
  image: {
    type: String,
    trim: true
  },
  availableFor: [{ 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner'],
    required: [true, 'At least one meal time must be specified']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableForPreOrder: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 15, // minutes
    min: [1, 'Preparation time must be at least 1 minute']
  }
}, { 
  timestamps: true 
});

// Index for efficient querying
menuItemSchema.index({ availableFor: 1, isAvailable: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ availableForPreOrder: 1, isAvailable: 1 });
menuItemSchema.index({ type: 1, isAvailable: 1 });
menuItemSchema.index({ category: 1, type: 1 });

// Virtual for display name
menuItemSchema.virtual('displayName').get(function() {
  if (this.portion && this.portion !== 'Regular') {
    return `${this.name} - ${this.portion}`;
  }
  return this.name;
});

// Ensure virtuals are included in JSON output
menuItemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
