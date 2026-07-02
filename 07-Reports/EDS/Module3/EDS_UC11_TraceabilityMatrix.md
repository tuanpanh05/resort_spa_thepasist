# Requirements Traceability Matrix - UC11: Schedule Spa/Therapy Session

This document provides end-to-end traceability for **UC11: Schedule Spa/Therapy Session** (Đặt lịch trị liệu trong gói) within Module 3, mapping business rules, tech classes, database records, and test cases.

---

## 1. Document Control
* **Document ID**: RESORT-M3-TM-UC11
* **Scope**: Module 3 (Spa Services)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC11-001** | Support scheduling spa sessions within the purchased retreat package. | `SpaBookingController.scheduleSession()` <br> `SpaBookingServiceImpl.createSpaBooking()` | Table: `spa_booking` <br> Column: `is_package_included` = true | **SPAPKG-TC-001** | `SpaBookingServiceImplTest.testScheduleSession_Success()` | **Traced** |
| **BR-30** | Date Range Rule: Schedule date/time must fall precisely between the room booking check-in and check-out timestamps. | `SpaBookingServiceImpl.validateBookingTime()` | Table: `room_booking` <br> Columns: `check_in_date`, `check_out_date` | **SPAPKG-TC-001** | `SpaBookingServiceImplTest.testSchedule_OutsideStayDates_ThrowsException()` | **Traced** |
| **BR-30-002** | Pack limit Rule: Check and prevent booking if total scheduled spa slots exceed package-defined maximum. | `SpaBookingServiceImpl.checkPackageLimits()` | Table: `retreat_packages` <br> Column: `spa_limit` | **SPAPKG-TC-002** | `SpaBookingServiceImplTest.testSchedule_ExceedLimit_ThrowsException()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: `SpaBookingController.java`
- **Service**: [SpaBookingService.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/SpaBookingService.java) & `SpaBookingServiceImpl.java`
- **Repository**: `fu.se.smms.repository.SpaBookingRepository`, `fu.se.smms.repository.RoomBookingRepository`
- **Entity**: `SpaBooking.java`, `RoomBooking.java`

### 3.2. Database Schema
- **Spa Booking Table**: `dbo.spa_booking` containing `spa_booking_id`, `user_id`, `spa_service_id`, `room_booking_id`, `start_datetime`, `end_datetime`, `is_package_included` (bit), `price_at_booking` (decimal/numeric).

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.SpaBookingServiceImplTest`
- **Verification Results**: Verified successful within-package spa scheduling, room check-in check-out stay range checks, and package slot limit checks.
