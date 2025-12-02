const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const AccountLedger = require('../models/AccountLedger');
const { validationResult } = require('express-validator');

// @desc    Get all users (customers and employees)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Customer.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await Customer.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update user role and verification status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role, isVerified, isActive } = req.body;

    const user = await Customer.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (role !== undefined) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await Customer.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get users by role
// @route   GET /api/admin/users/role/:role
// @access  Private/Admin
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['customer', 'employee'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be customer or employee'
      });
    }

    const users = await Customer.find({ role })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const buildOrderQuery = (userId, phone) => {
  const clauses = [{ customerId: userId }];
  if (phone) {
    clauses.push({ customerPhone: phone });
  }
  return clauses.length > 1 ? { $or: clauses } : clauses[0];
};

const buildLedgerFilter = (user) => {
  if (user.role === 'employee') {
    return {
      accountType: 'employee',
      $or: [
        { employeeId: user._id },
        { employeePhone: user.phone }
      ]
    };
  }

  return {
    accountType: 'customer',
    $or: [
      { customerId: user._id },
      { customerPhone: user.phone }
    ]
  };
};

// @desc    Get orders and ledger summary for a user
// @route   GET /api/admin/users/:id/orders
// @access  Private/Admin
exports.getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }

    const user = await Customer.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const orders = await Order.find(buildOrderQuery(user._id, user.phone))
      .sort({ createdAt: -1 })
      .lean();

    const ledgers = await AccountLedger.find(buildLedgerFilter(user))
      .sort({ updatedAt: -1 })
      .lean();

    const ledgerTotals = ledgers.reduce(
      (acc, ledger) => {
        const ordersAmount = Number(ledger.totalOrdersAmount) || 0;
        const paymentsAmount = Number(ledger.totalPaymentsAmount) || 0;
        const balanceAmount = Number(ledger.balance);

        acc.totalOrdersAmount += ordersAmount;
        acc.totalPaymentsAmount += paymentsAmount;

        if (Number.isFinite(balanceAmount)) {
          acc.outstandingBalance += balanceAmount;
        } else {
          acc.outstandingBalance += ordersAmount - paymentsAmount;
        }

        return acc;
      },
      { totalOrdersAmount: 0, totalPaymentsAmount: 0, outstandingBalance: 0 }
    );

    const orderAggregates = orders.reduce(
      (acc, order) => {
        const total = Number(order.total) || 0;

        acc.orderTotals += total;

        if (['paid'].includes(order.status)) {
          acc.paidTotals += total;
        }

        return acc;
      },
      { orderTotals: 0, paidTotals: 0 }
    );

    const orderTotals = orderAggregates.orderTotals;
    const paidTotals = orderAggregates.paidTotals;

    const summary = {
      orderCount: orders.length,
      totalOrdersAmount: ledgerTotals.totalOrdersAmount || orderTotals,
      totalPaymentsAmount: ledgerTotals.totalPaymentsAmount,
      outstandingBalance: ledgerTotals.outstandingBalance
    };

    if (!summary.outstandingBalance && summary.outstandingBalance !== 0) {
      summary.outstandingBalance = Math.max(
        (ledgerTotals.totalOrdersAmount || orderTotals) - ledgerTotals.totalPaymentsAmount,
        0
      );
    };

    // When no ledger entries exist, ensure we still show the order totals
    if (ledgers.length === 0) {
      summary.totalPaymentsAmount = paidTotals;
      summary.outstandingBalance = Math.max(orderTotals - paidTotals, 0);
    }

    res.json({
      success: true,
      data: {
        user,
        orders,
        ledgers,
        summary
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get unverified users
// @route   GET /api/admin/users/unverified
// @access  Private/Admin
exports.getUnverifiedUsers = async (req, res) => {
  try {
    const users = await Customer.find({ isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get unverified users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
