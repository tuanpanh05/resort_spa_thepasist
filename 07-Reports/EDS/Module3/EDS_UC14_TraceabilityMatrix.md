# Requirements Traceability Matrix - UC14: Update Session Status

This document provides end-to-end traceability for **UC14: Update Session Status** (Cập nhật trạng thái buổi trị liệu) within Module 3, mapping business states, roles authorization, database attributes, and test cases.

---

## 1. Document Control
* **Document ID**: RESORT-M3-TM-UC14
* **Scope**: Module 3 (Spa Services)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC14-001** | Support updating the session status (CONFIRMED -> IN_PROGRESS -> COMPLETED / NO_SHOW) by the assigned therapist. | `SpaBookingController.updateStatus()` <br> `SpaBookingServiceImpl.updateStatus()` | Table: `spa_booking` <br> Column: `status` | **STAT-TC-001** | `SpaBookingServiceImplTest.testUpdateStatus_Success()` | **Traced** |
| **BR-14-001** | Authorization Check: Restrict state transition capabilities of spa sessions to THERAPIST and ADMIN roles. Reject GUEST or Chef access requests with `403 Forbidden`. | Spring Security filters <br> `@PreAuthorize("hasAnyRole('THERAPIST', 'ADMIN')")` | Table: `users` <br> Column: `role` | **STAT-TC-002** | `SpaBookingControllerTest.testUpdateStatus_GuestForbidden()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: `SpaBookingController.java`
- **Service**: `SpaBookingServiceImpl.java`
- **Repository**: `fu.se.smms.repository.SpaBookingRepository`
- **Entity**: `SpaBooking.java`

### 3.2. Database Schema
- **Spa Booking Table**: `dbo.spa_booking` containing `spa_booking_id` and `status` (storing state values like 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW').

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.SpaBookingServiceImplTest`
- **Verification Results**: Verified successful status updates, role restriction policies, and correct state transition rules.
