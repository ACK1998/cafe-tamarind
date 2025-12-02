const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Settlement amount is required'],
    min: [0, 'Settlement amount cannot be negative']
  },
  type: {
    type: String,
    enum: ['full', 'partial'],
    default: 'full'
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Settlement note cannot exceed 200 characters']
  },
  paymentMethod: {
    type: String,
    trim: true,
    maxlength: [50, 'Payment method cannot exceed 50 characters']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ledgerSchema = new mongoose.Schema({
  accountType: {
    type: String,
    enum: ['customer', 'employee'],
    required: true
  },
  // Customer-based fields
  customerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerPhone: {
    type: String,
    trim: true,
    maxlength: [20, 'Customer phone cannot exceed 20 characters']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  // Employee-based fields
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  employeeName: {
    type: String,
    trim: true,
    maxlength: [100, 'Employee name cannot exceed 100 characters']
  },
  employeePhone: {
    type: String,
    trim: true,
    maxlength: [20, 'Employee phone cannot exceed 20 characters']
  },
  periodMonth: {
    type: Number,
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  periodYear: {
    type: Number,
    min: [2000, 'Year must be reasonable']
  },
  // Aggregated amounts
  totalOrdersAmount: {
    type: Number,
    default: 0,
    min: [0, 'Order total cannot be negative']
  },
  totalPaymentsAmount: {
    type: Number,
    default: 0,
    min: [0, 'Payments total cannot be negative']
  },
  balance: {
    type: Number,
    default: 0
  },
  lastOrderAt: {
    type: Date
  },
  lastSettlementAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['open', 'settled'],
    default: 'open'
  },
  settlements: [settlementSchema]
}, {
  timestamps: true
});

ledgerSchema.pre('validate', function(next) {
  if (this.accountType === 'customer') {
    if (!this.customerPhone) {
      return next(new Error('Customer phone is required for customer ledger entries'));
    }
    if (!this.customerName) {
      return next(new Error('Customer name is required for customer ledger entries'));
    }
  }

  if (this.accountType === 'employee') {
    if (!this.employeeId && !this.employeePhone) {
      return next(new Error('Employee ledger entries must reference either an employeeId or employeePhone'));
    }
    if (typeof this.periodMonth !== 'number' || typeof this.periodYear !== 'number') {
      return next(new Error('Employee ledger entries require both periodMonth and periodYear'));
    }
  }

  return next();
});

ledgerSchema.index({ accountType: 1, customerPhone: 1, status: 1 }, {
  name: 'customer_open_balance_idx',
  partialFilterExpression: {
    accountType: 'customer',
    status: 'open'
  },
  unique: true
});

ledgerSchema.index({
  accountType: 1,
  periodYear: 1,
  periodMonth: 1,
  employeeId: 1,
  employeePhone: 1
}, {
  name: 'employee_month_idx',
  partialFilterExpression: {
    accountType: 'employee'
  },
  unique: true
});

ledgerSchema.index({ accountType: 1, balance: -1, updatedAt: -1 });

module.exports = mongoose.model('AccountLedger', ledgerSchema);

