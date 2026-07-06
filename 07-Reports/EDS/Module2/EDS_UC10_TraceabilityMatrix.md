# Requirements Traceability Matrix - UC10: Check-in Procedure & Keycard

This document provides end-to-end traceability for **UC10: Check-in Procedure & Keycard** (Thủ tục Check-in & Đăng ký lưu trú) within Module 2, mapping business requirements and business rules to technical components, database structures, and testing/verification elements.

---

## 1. Document Control
* **Document ID**: RESORT-M2-TM-UC10
* **Scope**: Module 2 (Retreat Package & Accommodation Booking)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC10-001** | Support check-in procedure, registering main guest and accompanying guests details. | `CheckInController.performCheckIn()` <br> `CheckInServiceImpl.performCheckIn()` | Table: `room_booking` <br> Table: `accompanying_guest` | **CI-TC-001** | `CheckInServiceImplTest.testPerformCheckIn_Success()` | **Traced** |
| **REQ-UC10-002** | Security requirement: Guest identity document (CCCD/Passport) must be encrypted using AES-256 before persisting. | `EncryptionServiceImpl.encrypt()` <br> `CheckInServiceImpl.performCheckIn()` | Table: `accompanying_guest` <br> Column: `identity_document` | **CI-TC-001** | `EncryptionServiceTest` & DB validation | **Traced** |
| **REQ-UC10-003** | Support assigning electronic physical keycard code to the booking record. | `CheckInServiceImpl.performCheckIn()` | Table: `room_booking` <br> Column: `keycard_number` | **CI-TC-001** | `CheckInServiceImplTest.testPerformCheckIn_Success()` | **Traced** |
| **BR-10-001** | Only reservations with confirmed deposit (`CONFIRMED`) can proceed with check-in. | `CheckInServiceImpl.performCheckIn()` | Table: `room_booking` <br> Column: `status` = 'CONFIRMED' | **CI-TC-002** | `CheckInServiceImplTest.testCheckIn_UnpaidDeposit_ThrowsException()` | **Traced** |
| **BR-10-002** | Successful check-in updates booking status to `CHECKED_IN` and automatically changes physical room status to `OCCUPIED`. | `CheckInServiceImpl.performCheckIn()` <br> `RoomRepository.updateStatus()` | Table: `room_booking` <br> Table: `room` <br> Columns: `room_booking.status`, `room.status` | **CI-TC-001** | `CheckInServiceImplTest.testPerformCheckIn_StatusTransition()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: [CheckInController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/CheckInController.java)
- **Service**: [CheckInServiceImpl.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/impl/CheckInServiceImpl.java) & `EncryptionServiceImpl.java`
- **Repository**: `fu.se.smms.repository.RoomBookingRepository`, `fu.se.smms.repository.RoomRepository`, `fu.se.smms.repository.AccompanyingGuestRepository`
- **Entity**: `RoomBooking.java`, `Room.java`, `AccompanyingGuest.java`

### 3.2. Database Schema
- **Room Booking Table**: `dbo.room_booking` containing `booking_id`, `status` (`CHECKED_IN`), `keycard_number` (varchar/nvarchar).
- **Physical Room Table**: `dbo.room` containing `room_id`, `status` (`OCCUPIED`).
- **Accompanying Guests Table**: `dbo.accompanying_guest` with column `identity_document` storing AES-256 encrypted bytes/strings.

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.CheckInServiceImplTest`
- **Verification Results**: All check-in tests passed successfully, confirming state transitions, keycard mapping, and validation restrictions.
