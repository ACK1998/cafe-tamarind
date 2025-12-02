# Billing Ledger Overview

## Summary

- Orders now update an `AccountLedger` collection, aggregating totals per customer (by name + phone) and per employee (monthly credit cycle).
- Customers can accumulate multiple orders until a full settlement is recorded; employees accumulate monthly, supporting partial or full settlements.
- Admin UI surfaces outstanding balances on `AdminCustomerOrder` (customers) and `AdminInHouseOrder` (employees). Customers can see their balance on the order history page.

## Backend Changes

- Model: `backend/models/AccountLedger.js`
  - `accountType`: `customer` or `employee`
  - Customer identifiers: `customerName`, `customerPhone`, optional `customerId`
  - Employee identifiers: `employeeId` (ref), `employeePhone`, `employeeName`, `periodMonth`, `periodYear`
  - Aggregates: `totalOrdersAmount`, `totalPaymentsAmount`, `balance`, `settlements[]`
  - Status: `open` (active) or `settled` (balance cleared)
- Service: `backend/services/ledgerService.js`
  - `applyOrderToLedger(orderDoc, session)` invoked inside `placeOrder`
  - `recordSettlement({ ledgerId, amount, ... })` ensuring business rules (no partial for customers, bounded amounts)
- Controller/Routes: `backend/controllers/ledgerController.js`, `backend/routes/ledgerRoutes.js`
  - `GET /api/ledger/customers/phone/:phone` (optional auth)
  - `POST /api/ledger/customers/:ledgerId/settle` (admin only, full settlements)
  - `GET /api/ledger/employees`, `GET /api/ledger/employees/lookup` (admin only)
  - `POST /api/ledger/employees/:ledgerId/settlements` (admin only, partial/full)

## Frontend Changes

- API bindings in `frontend/src/services/api.js` (`ledgerAPI`).
- Admin pages fetch and display balances:
  - `AdminCustomerOrder.jsx` shows outstanding amount, settlement history, and adds “Mark Paid” action.
  - `AdminInHouseOrder.jsx` shows monthly employee balance, settlement history, and supports partial payments with amount input.
- Customer portal (`CustomerOrders.jsx`) displays the open balance with totals and last settlement.

## Settlement Rules

- Customers: full settlement only. Button records payment equal to current balance.
- Employees: partial or full settlements allowed within month-specific ledger. Amount must be `0 < amount ≤ balance`.
- Each settlement logs amount, type (`full` or `partial`), method, note, and recorded timestamp/user.

## Testing Notes

1. **Order placement**
   - Placed customer and in-house orders via admin UI (or POST `/api/orders`) and verified ledgers update with new total and timestamps.
2. **Customer settlement**
   - Called `POST /api/ledger/customers/:id/settle` (admin token) with optional note/method; balance dropped to 0 and status flipped to `settled`.
   - Verified subsequent order reopens a new ledger entry.
3. **Employee partial settlement**
   - Recorded settlement via `POST /api/ledger/employees/:id/settlements` with amount `< balance`; ledger balance reduced accordingly while status remained `open`.
   - Posted full amount to confirm status moves to `settled`.
4. **Frontend checks**
   - Observed balance cards on admin customer/in-house order pages refresh after orders and settlements.
   - Confirmed customer order history page shows outstanding balance and updates after backend settlement.

> **Tip:** Use MongoDB indexes (`customer_open_balance_idx`, `employee_month_idx`) to keep lookups quick and ensure only one active ledger per customer or employee period.

