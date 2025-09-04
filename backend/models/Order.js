const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Customer information (no user account required)
  customerName: { 
    type: String, 
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  customerPhone: { 
    type: String, 
    required: [true, 'Customer phone is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  // Link to customer account (optional)
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  // Track who created the order
  createdBy: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  // Which pricing tier was applied at time of order
  pricingTier: {
    type: String,
    enum: ['standard', 'inhouse'],
    default: 'standard'
  },
  items: [{
    menuItemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'MenuItem',
      required: [true, 'Menu item ID is required']
    },
    name: {
      type: String,
      required: [true, 'Item name is required']
    },
    qty: { 
      type: Number, 
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: { 
      type: Number, 
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Item total is required']
    }
  }],
  total: { 
    type: Number, 
    required: [true, 'Order total is required'],
    min: [0, 'Total cannot be negative']
  },
  mealTime: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'pre-order'], 
    default: 'lunch'
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'], 
    default: 'pending'
  },
  // Order type and scheduling
  orderType: { 
    type: String, 
    enum: ['NOW', 'PREORDER'], 
    default: 'NOW' 
  },
  scheduledFor: { 
    type: Date, 
    required: function() { 
      return this.orderType === 'PREORDER'; 
    } 
  },
  // Legacy pre-order fields (for backward compatibility)
  isPreOrder: {
    type: Boolean,
    default: false
  },
  preOrderDateTime: {
    type: Date
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  },
  estimatedReadyTime: {
    type: Date
  },
  actualReadyTime: {
    type: Date
  },
  orderNumber: {
    type: String,
    unique: true
  }
}, { 
  timestamps: true 
});

// Index for efficient querying (orderNumber index is automatically created by unique: true)
orderSchema.index({ customerPhone: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1, mealTime: 1 });
orderSchema.index({ isPreOrder: 1, preOrderDateTime: 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const orderCount = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    this.orderNumber = `TM${year}${month}${day}${(orderCount + 1).toString().padStart(3, '0')}`;
  }
  next();
});

// Virtual for order summary
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.qty, 0);
});

// Virtual for pre-order display
orderSchema.virtual('preOrderDisplay').get(function() {
  if (this.isPreOrder && this.preOrderDateTime) {
    return new Date(this.preOrderDateTime).toLocaleString();
  }
  return null;
});

// Ensure virtuals are included in JSON output
orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
