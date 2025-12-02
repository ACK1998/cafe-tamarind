const express = require('express');
const {
  listCustomerLedgers,
  getCustomerLedgerByPhone,
  settleCustomerLedger,
  listEmployeeLedgers,
  recordEmployeeSettlement,
  getEmployeeLedgerByIdentifier
} = require('../controllers/ledgerController');
const { protect, admin, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/customers', protect, admin, listCustomerLedgers);
router.get('/customers/phone/:phone', optionalAuth, getCustomerLedgerByPhone);
router.post('/customers/:ledgerId/settle', protect, admin, settleCustomerLedger);

router.get('/employees', protect, admin, listEmployeeLedgers);
router.get('/employees/lookup', protect, admin, getEmployeeLedgerByIdentifier);
router.post('/employees/:ledgerId/settlements', protect, admin, recordEmployeeSettlement);

module.exports = router;

