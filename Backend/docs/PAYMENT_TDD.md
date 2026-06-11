# SMMS Payment & Invoice Backend TDD Specification

* **Document ID:** SMMS-PAYMENT-TDD-001
* **Version:** 1.0
* **Date:** 2026-06-10
* **Status:** Draft
* **Standard:** ISO/IEC/IEEE 29119-3:2021 aligned
* **Author:** Codex - Backend Engineer
* **Classification:** Internal

---

## Changelog

| Date | Author | Change |
| :--- | :--- | :--- |
| 2026-06-10 | Codex | Created TDD specification for invoice creation, VNPay callback, and cash settlement. |

---

## 1. Module Information

| Field | Value |
| :--- | :--- |
| **Feature / Gap ID** | GAP-PAY-001 |
| **Module** | Payment & Invoice |
| **Spec Source** | `Backend/docs/PAYMENT_EDS.md` |
| **Priority** | P1 |
| **Data Classification** | Internal, PII-linked |
| **Upstream Dependencies** | SQL Server booking, spa, food, user tables |
| **Downstream Consumers** | Customer booking flow, Staff checkout, Admin ledger |

---

## 2. Logic Issues Resolved

| # | Original Gap | Actual Constraint | Fix Applied |
| :--- | :--- | :--- | :--- |
| L1 | Backend service methods returned `null`. | Controller exposed invoice endpoints but no business logic. | Implemented `InvoiceServiceImpl`. |
| L2 | Frontend mock uses `Paid/Unpaid`; SQL uses `PAID/UNPAID/CANCELLED`. | DB check constraint only allows uppercase statuses. | Backend uses SQL-compatible statuses. |
| L3 | VNPay callback was modeled as a DTO only. | VNPay sends `vnp_*` query parameters and secure hash. | Controller receives raw params and service verifies HMAC. |
| L4 | Staff checkout needs cash settlement. | Existing API only had VNPay payment URL/callback. | Added `POST /invoices/{id}/cash-payment`. |
| L5 | Gross invoice total could be sent to VNPay after deposit was already paid. | `room_booking.total_deposit` stores collected 30% deposit. | Invoice stores `depositAmount` and `amountDue`; VNPay charges `amountDue`. |

---

## 3. Test Design Specification

### TDS-01 Scope

Covered layers:

* Service: `InvoiceServiceImpl`
* Repository queries: charge aggregation SQL
* Controller: invoice and callback endpoints
* Security: VNPay secure hash verification

Out of scope:

* Real VNPay sandbox transaction settlement.
* JWT role enforcement. The current backend uses permissive dev security for invoice endpoints.

### TDS-02 Test Basis

| Source | Derived Items |
| :--- | :--- |
| `BUSINESS_PROCESS.md` | 30% deposit and 70% final checkout payment process |
| `SDS/BACKEND_ARCHITECTURE.md` | Invoice endpoints and VNPay callback |
| `SQL_DB_RESORT_SPA/resort_spa_db.sql` | Invoice status enum and charge source tables |
| `Backend/docs/PAYMENT_EDS.md` | ADRs, API contract, error codes |

### TDS-03 Test Conditions

| Condition ID | Test Condition | Coverage Item | Test Cases |
| :--- | :--- | :--- | :--- |
| TC-COND-001 | Existing booking creates/recalculates invoice totals. | `createInvoice()` | PAY-TC-001 |
| TC-COND-002 | Missing booking returns 404. | `createInvoice()` | PAY-TC-002 |
| TC-COND-003 | Paid invoice cannot generate duplicate payment work. | `createPaymentUrl()` | PAY-TC-003 |
| TC-COND-004 | Cash payment marks invoice paid. | `markCashPayment()` | PAY-TC-004 |
| TC-COND-005 | Valid VNPay callback marks paid. | `processVNPayCallback()` | PAY-TC-005 |
| TC-COND-006 | Invalid VNPay secure hash is rejected. | `processVNPayCallback()` | PAY-TC-006 |
| TC-COND-007 | Duplicate callback is idempotent. | `processPaymentCallback()` | PAY-TC-007 |

### TDS-04 Test Techniques

| Technique | Applied To | Rationale |
| :--- | :--- | :--- |
| Equivalence Partitioning | `PAID`, `UNPAID`, `CANCELLED` | Verify valid state classes. |
| Boundary Value Analysis | zero subtotal, high final amount | Prevent negative or rounding errors. |
| State Transition Testing | invoice status transitions | Prevent invalid payments on cancelled invoices. |
| Error Guessing | forged VNPay callback | Payment endpoints are high-risk. |

### TDS-05 Test Data

| Fixture ID | Type | Value / Logic | Purpose |
| :--- | :--- | :--- | :--- |
| FX-001 | DB seed | booking `1`, user `5`, invoice unpaid | Happy path |
| FX-002 | DB seed | invoice status `PAID` | Idempotency |
| FX-003 | Env | `payment.vnpay.hash-secret=test-secret` | HMAC verification |
| FX-004 | Callback params | `vnp_TxnRef=1`, `vnp_ResponseCode=00`, signed hash | VNPay success |

---

## 4. Test Case Specification

### PAY-TC-001 - Create Invoice Aggregates Charges

* **Severity:** Critical
* **Feature Under Test:** `InvoiceServiceImpl.createInvoice()`
* **TDD Phase:** Green target
* **Condition Ref:** TC-COND-001

Preconditions:

* Booking exists.
* Room, non-package spa, and non-package food rows exist.

Steps:

1. Call `createInvoice(bookingId)`.
2. Read returned `InvoiceDTO`.

Expected:

* `roomSubtotal` equals package base price for package bookings; otherwise room line price multiplied by nights.
* `spaSubtotal` excludes `is_package_included = 1`.
* `foodSubtotal` excludes `is_package_included = 1`.
* `taxAndFees = (room + spa + food) * 0.10`.
* `amountDue = finalAmount - depositAmount`.
* `status = UNPAID`.

### PAY-TC-002 - Missing Booking Returns 404

* **Severity:** High
* **Feature Under Test:** `InvoiceServiceImpl.createInvoice()`
* **Condition Ref:** TC-COND-002

Steps:

1. Call `createInvoice(999999)`.

Expected:

* Throws `BusinessException` with `INV-404`.
* No invoice row is created.

### PAY-TC-003 - Paid Invoice Cannot Generate New Payment URL

* **Severity:** High
* **Feature Under Test:** `InvoiceServiceImpl.createPaymentUrl()`
* **Condition Ref:** TC-COND-003

Steps:

1. Seed invoice with `status = PAID`.
2. Call `createPaymentUrl(invoiceId)`.

Expected:

* Throws `BusinessException` with `INV-409`.

### PAY-TC-004 - Cash Payment Marks Invoice Paid

* **Severity:** Critical
* **Feature Under Test:** `InvoiceServiceImpl.markCashPayment()`
* **Condition Ref:** TC-COND-004

Steps:

1. Seed invoice with `status = UNPAID`.
2. Call `markCashPayment(invoiceId)`.

Expected:

* `status = PAID`.
* `paymentTime` is not null.
* `vnpayTranId` remains null.

### PAY-TC-005 - Valid VNPay Callback Marks Paid

* **Severity:** Critical
* **OWASP:** A01 Broken Access Control / callback trust boundary
* **Feature Under Test:** `InvoiceServiceImpl.processVNPayCallback()`
* **Condition Ref:** TC-COND-005

Steps:

1. Build callback params with `vnp_TxnRef`, `vnp_ResponseCode=00`, `vnp_TransactionStatus=00`, `vnp_TransactionNo`.
2. Sign params using configured HMAC secret.
3. Call `processVNPayCallback(params)`.

Expected:

* Invoice `status = PAID`.
* `vnpayTranId` equals `vnp_TransactionNo`.
* `paymentTime` is not null.

### PAY-TC-006 - Invalid VNPay Hash Rejected

* **Severity:** Critical
* **OWASP:** A08 Software and Data Integrity Failures
* **CWE:** CWE-347 Improper Verification of Cryptographic Signature
* **Feature Under Test:** `InvoiceServiceImpl.processVNPayCallback()`
* **Condition Ref:** TC-COND-006

Steps:

1. Build callback params with success response.
2. Set `vnp_SecureHash` to an invalid value.
3. Call `processVNPayCallback(params)`.

Expected:

* Throws `BusinessException` with `INV-403`.
* Invoice remains `UNPAID`.

### PAY-TC-007 - Duplicate VNPay Callback Is Idempotent

* **Severity:** Medium
* **Feature Under Test:** `InvoiceServiceImpl.processPaymentCallback()`
* **Condition Ref:** TC-COND-007

Steps:

1. Seed invoice as `PAID`.
2. Send the same successful payment callback again.

Expected:

* Returns invoice as `PAID`.
* Does not overwrite existing payment state unexpectedly.

---

## 5. Red-Green-Refactor Tracker

| TC ID | Test File | RED Confirmed | GREEN | Refactor Note |
| :--- | :--- | :---: | :--- | :--- |
| PAY-TC-001 | `InvoiceServiceImplTest` | [ ] | [ ] | Pending automated test implementation |
| PAY-TC-002 | `InvoiceServiceImplTest` | [ ] | [ ] | Pending automated test implementation |
| PAY-TC-003 | `InvoiceServiceImplTest` | [ ] | [ ] | Pending automated test implementation |
| PAY-TC-004 | `InvoiceServiceImplTest` | [ ] | [ ] | Pending automated test implementation |
| PAY-TC-005 | `InvoiceServiceImplTest` | [ ] | [ ] | Pending automated test implementation |
| PAY-TC-006 | `InvoiceServiceImplTest` | [ ] | [ ] | Pending automated test implementation |
| PAY-TC-007 | `InvoiceServiceImplTest` | [ ] | [ ] | Pending automated test implementation |

---

## 6. Entry / Exit Criteria

Entry:

* SQL schema is available.
* VNPay sandbox credentials are configured.
* Booking seed data exists for smoke tests.

Exit:

* `mvn clean package` passes.
* Create invoice endpoint returns a valid `InvoiceDTO`.
* VNPay callback rejects invalid HMAC.
* Cash payment endpoint marks invoice paid.

---

## 7. Rollback Plan

```bash
git revert <payment-backend-change>
mvn clean package
```

If a bad callback marks invoices incorrectly, restore affected rows from transaction log or backup:

```sql
UPDATE dbo.invoice
SET status = 'UNPAID', vnpay_tran_id = NULL, payment_time = NULL
WHERE invoice_id IN (...);
```
