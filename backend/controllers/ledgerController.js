const mongoose = require('mongoose');
const AccountLedger = require('../models/AccountLedger');
const { recordSettlement } = require('../services/ledgerService');

const parseAmount = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
};

const listCustomerLedgers = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { accountType: 'customer' };

    if (status) {
      query.status = status;
    }

    const ledgers = await AccountLedger.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: ledgers.length,
      data: ledgers
    });
  } catch (error) {
    console.error('listCustomerLedgers error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch customer ledgers'
    });
  }
};

const getCustomerLedgerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const { includeHistory } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone is required'
      });
    }

    const query = {
      accountType: 'customer',
      customerPhone: phone
    };

    if (!includeHistory) {
      query.status = 'open';
    }

    const ledgers = await AccountLedger.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: ledgers.length,
      data: ledgers
    });
  } catch (error) {
    console.error('getCustomerLedgerByPhone error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch customer ledger'
    });
  }
};

const settleCustomerLedger = async (req, res) => {
  try {
    const { ledgerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ledgerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ledger id'
      });
    }

    const ledger = await AccountLedger.findById(ledgerId);

    if (!ledger || ledger.accountType !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer ledger not found'
      });
    }

    if (ledger.status === 'settled') {
      return res.status(400).json({
        success: false,
        message: 'Ledger is already settled'
      });
    }

    const amount = parseAmount(req.body.amount);
    const updatedLedger = await recordSettlement({
      ledgerId,
      amount,
      note: req.body.note,
      paymentMethod: req.body.paymentMethod,
      recordedBy: req.user ? req.user._id : undefined,
      allowPartial: false
    });

    res.json({
      success: true,
      data: updatedLedger
    });
  } catch (error) {
    console.error('settleCustomerLedger error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to settle customer ledger'
    });
  }
};

const listEmployeeLedgers = async (req, res) => {
  try {
    const { status, month, year } = req.query;
    const query = { accountType: 'employee' };

    if (status) {
      query.status = status;
    }

    if (month) {
      query.periodMonth = Number(month);
    }

    if (year) {
      query.periodYear = Number(year);
    }

    const ledgers = await AccountLedger.find(query)
      .sort({ periodYear: -1, periodMonth: -1, updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: ledgers.length,
      data: ledgers
    });
  } catch (error) {
    console.error('listEmployeeLedgers error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch employee ledgers'
    });
  }
};

const recordEmployeeSettlement = async (req, res) => {
  try {
    const { ledgerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ledgerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ledger id'
      });
    }

    const amount = parseAmount(req.body.amount);
    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Settlement amount is required for employee accounts'
      });
    }

    const ledger = await AccountLedger.findById(ledgerId);

    if (!ledger || ledger.accountType !== 'employee') {
      return res.status(404).json({
        success: false,
        message: 'Employee ledger not found'
      });
    }

    if (ledger.status === 'settled' && ledger.balance === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ledger is already settled'
      });
    }

    const updatedLedger = await recordSettlement({
      ledgerId,
      amount,
      note: req.body.note,
      paymentMethod: req.body.paymentMethod,
      recordedBy: req.user ? req.user._id : undefined,
      allowPartial: true
    });

    res.json({
      success: true,
      data: updatedLedger
    });
  } catch (error) {
    console.error('recordEmployeeSettlement error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to record employee settlement'
    });
  }
};

const getEmployeeLedgerByIdentifier = async (req, res) => {
  try {
    const { phone, employeeId, month, year } = req.query;

    if (!phone && !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Provide either employeeId or phone to lookup ledger'
      });
    }

    const query = {
      accountType: 'employee'
    };

    if (employeeId) {
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid employeeId'
        });
      }
      query.employeeId = employeeId;
    }

    if (phone) {
      query.employeePhone = phone;
    }

    if (month) {
      query.periodMonth = Number(month);
    }

    if (year) {
      query.periodYear = Number(year);
    }

    const ledgers = await AccountLedger.find(query)
      .sort({ periodYear: -1, periodMonth: -1, updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: ledgers.length,
      data: ledgers
    });
  } catch (error) {
    console.error('getEmployeeLedgerByIdentifier error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to lookup employee ledger'
    });
  }
};

module.exports = {
  listCustomerLedgers,
  getCustomerLedgerByPhone,
  settleCustomerLedger,
  listEmployeeLedgers,
  recordEmployeeSettlement,
  getEmployeeLedgerByIdentifier
};

