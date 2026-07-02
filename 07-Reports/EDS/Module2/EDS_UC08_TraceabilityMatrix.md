# Requirements Traceability Matrix - UC08: 30% Deposit Payment

This document provides end-to-end traceability for **UC08: 30% Deposit Payment** (Thanh toán đặt cọc 30%) within Module 2, mapping business requirements and business rules to technical components, database structures, and testing/verification elements.

---

## 1. Document Control
* **Document ID**: RESORT-M2-TM-UC08
* **Scope**: Module 2 (Retreat Package & Accommodation Booking)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC08-001** | Support online VNPay payment link generation and payment callback processing. | `InvoiceController.getPaymentUrl()` <br> `VNPayServiceImpl.createPaymentUrl()` <br> `InvoiceController.handleVNPayCallback()` | Table: `invoice` <br> Table: `payment_transaction_log` | **DEP-TC-002** | `InvoiceServiceImplTest` callback verification | **Traced** |
| **BR-05-001** | The deposit amount must be calculated as 30% of the total amount (room + retreat package + dining combo) by default, loading dynamically from configurable ratio settings. | `InvoiceServiceImpl.payableAmount()` <br> `SystemConfigurationRepository.findByConfigKey("deposit_ratio")` | Table: `system_configurations` <br> Table: `invoice` | **DEP-TC-001** | `InvoiceServiceImplTest.testCalculateDepositAmount()` | **Traced** |
| **BR-05-002** | Mark invoice as partially/fully paid and update the parent Room Booking status from `PENDING_DEPOSIT` to `CONFIRMED` upon successful deposit confirmation. | `InvoiceServiceImpl.markCashPayment()` <br> `InvoiceServiceImpl.handleVNPayCallback()` | Table: `invoice` <br> Table: `room_booking` <br> Columns: `status`, `paid_amount` | **DEP-TC-002** | `InvoiceServiceImplTest.cashDepositPaymentSetsBookingStatusToConfirmed()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: [InvoiceController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/InvoiceController.java)
- **Service**: [InvoiceServiceImpl.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/impl/InvoiceServiceImpl.java) & [VNPayServiceImpl.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/impl/VNPayServiceImpl.java)
- **Repository**: `fu.se.smms.repository.InvoiceRepository`, `fu.se.smms.repository.RoomBookingRepository`, `fu.se.smms.repository.SystemConfigurationRepository`
- **Entity**: `Invoice.java`, `RoomBooking.java`, `PaymentTransactionLog.java`

### 3.2. Database Schema
- **Invoice Table**: `dbo.invoice` with columns: `invoice_id`, `room_booking_id`, `room_subtotal`, `food_subtotal`, `tax_and_fees`, `final_amount`, `paid_amount`, `status`.
- **System Configuration Table**: `dbo.system_configurations` storing `deposit_ratio` configuration.
- **Log Table**: `dbo.payment_transaction_log` recording immutable cash/VNPay payments history.

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.InvoiceServiceImplTest`
- **Verification Results**: All 22 tests in `InvoiceServiceImplTest` passed successfully, verifying both Cash payment and VNPay callback handler business logic.
