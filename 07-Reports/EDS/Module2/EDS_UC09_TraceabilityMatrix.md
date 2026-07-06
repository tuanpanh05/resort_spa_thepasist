# Requirements Traceability Matrix - UC09: Booking Management

This document provides end-to-end traceability for **UC09: Booking Management** (Quản lý đặt phòng) within Module 2, mapping business requirements and business rules to technical components, database structures, and testing/verification elements.

---

## 1. Document Control
* **Document ID**: RESORT-M2-TM-UC09
* **Scope**: Module 2 (Retreat Package & Accommodation Booking)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC09-001** | Support viewing room booking details for both guests and resort staff. | `BookingController.getBookingDetails()` <br> `BookingServiceImpl.getBookingById()` | Table: `room_booking` <br> Columns: all basic fields | **MNG-TC-001** | `BookingServiceImplTest.testGetBookingDetails()` | **Traced** |
| **REQ-UC09-002** | Support booking cancellation request by guests or receptionist staff. | `BookingController.cancelBooking()` <br> `BookingServiceImpl.cancelBooking()` | Table: `room_booking` <br> Columns: `status`, `refund_amount` | **MNG-TC-001** | `BookingServiceImplTest.testCancelBooking_Success()` | **Traced** |
| **BR-09-001** | Cancellation refund policy: Allow successful cancellation and calculate refund based on cancellation timing before check-in date. | `BookingServiceImpl.cancelBooking()` | Table: `room_booking` <br> Columns: `cancellation_time`, `refund_amount` | **MNG-TC-001** | `BookingServiceImplTest.testCancelBooking_RefundCalculation()` | **Traced** |
| **BR-09-002** | Integrity constraint: Block cancellation if the booking is currently active (`CHECKED_IN`) or already finished (`CHECKED_OUT`). | `BookingServiceImpl.cancelBooking()` | Table: `room_booking` <br> Column: `status` | **MNG-TC-002** | `BookingServiceImplTest.testCancelBooking_CheckedIn_ThrowsException()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: [BookingController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/BookingController.java)
- **Service**: [BookingServiceImpl.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/impl/BookingServiceImpl.java)
- **Repository**: `fu.se.smms.repository.RoomBookingRepository`
- **Entity**: `RoomBooking.java`

### 3.2. Database Schema
- **Room Booking Table**: `dbo.room_booking` with columns: `booking_id`, `status` (`CANCELLED`), `cancellation_reason`, `cancellation_time`, `refund_amount`.

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.BookingServiceImplTest`
- **Verification Results**: Verified successful cancellations and validation restrictions preventing cancellation of checked-in bookings.
