const mongoose = require('mongoose');
const AccountLedger = require('../models/AccountLedger');

const cleanUndefined = (payload) => {
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });
  return payload;
};

const derivePeriod = (date) => {
  const dt = date instanceof Date ? date : new Date(date);
  return {
    periodMonth: dt.getMonth() + 1,
    periodYear: dt.getFullYear()
  };
};

const applyOrderToLedger = async (orderDoc, session) => {
  if (!orderDoc || typeof orderDoc.total !== 'number') {
    throw new Error('Invalid order document supplied to ledger service');
  }

  const orderDate = orderDoc.createdAt || new Date();
  const orderAmount = orderDoc.total;
  const isEmployeeAccount = orderDoc.pricingTier === 'inhouse';

  if (isEmployeeAccount) {
    const { periodMonth, periodYear } = derivePeriod(orderDate);
    const identifierFilter = orderDoc.customerId
      ? { employeeId: new mongoose.Types.ObjectId(orderDoc.customerId) }
      : { employeePhone: orderDoc.customerPhone };
    const filter = {
      accountType: 'employee',
      periodMonth,
      periodYear,
      ...identifierFilter
    };

    const update = {
      $setOnInsert: cleanUndefined({
        accountType: 'employee',
        periodMonth,
        periodYear,
        status: 'open'
      }),
      $set: cleanUndefined({
        employeeName: orderDoc.customerName,
        employeePhone: orderDoc.customerPhone,
        employeeId: orderDoc.customerId || undefined,
        lastOrderAt: orderDate
      }),
      $inc: {
        totalOrdersAmount: orderAmount,
        balance: orderAmount
      }
    };

    return AccountLedger.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
        upsert: true,
        session,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
  }

  const filter = {
    accountType: 'customer',
    customerPhone: orderDoc.customerPhone,
    status: 'open'
  };

  const update = {
    $setOnInsert: cleanUndefined({
      accountType: 'customer',
      customerPhone: orderDoc.customerPhone,
      status: 'open'
    }),
    $set: cleanUndefined({
      customerName: orderDoc.customerName,
      customerId: orderDoc.customerId || undefined,
      lastOrderAt: orderDate
    }),
    $inc: {
      totalOrdersAmount: orderAmount,
      balance: orderAmount
    }
  };

  return AccountLedger.findOneAndUpdate(
    filter,
    update,
    {
      new: true,
      upsert: true,
      session,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );
};

const recordSettlement = async ({ ledgerId, amount, note, paymentMethod, recordedBy, allowPartial }) => {
  if (!ledgerId) {
    throw new Error('ledgerId is required');
  }

  const session = await AccountLedger.startSession();
  session.startTransaction();

  try {
    const ledger = await AccountLedger.findById(ledgerId).session(session);

    if (!ledger) {
      throw new Error('Ledger entry not found');
    }

    const settlementAmount = typeof amount === 'number' ? amount : ledger.balance;

    if (settlementAmount <= 0) {
      throw new Error('Settlement amount must be greater than zero');
    }

    if (!allowPartial && settlementAmount < ledger.balance) {
      throw new Error('Partial settlements are not permitted for this ledger');
    }

    if (settlementAmount > ledger.balance) {
      throw new Error('Settlement amount cannot exceed outstanding balance');
    }

    const settlementType = settlementAmount === ledger.balance ? 'full' : 'partial';

    const update = {
      $inc: {
        totalPaymentsAmount: settlementAmount,
        balance: -settlementAmount
      },
      $set: {
        lastSettlementAt: new Date()
      },
      $push: {
        settlements: {
          amount: settlementAmount,
          type: settlementType,
          note,
          paymentMethod,
          recordedBy,
          recordedAt: new Date()
        }
      }
    };

    if (settlementType === 'full') {
      update.$set.status = 'settled';
    }

    const updatedLedger = await AccountLedger.findByIdAndUpdate(
      ledger._id,
      update,
      {
        new: true,
        session,
        runValidators: true
      }
    );

    await session.commitTransaction();
    return updatedLedger;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  applyOrderToLedger,
  recordSettlement
};

