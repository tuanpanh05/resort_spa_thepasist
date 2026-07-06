# Requirements Traceability Matrix - UC07: Room Booking & Package Selection

This document provides end-to-end traceability for **UC07: Room Booking & Package Selection** (Đặt phòng & Chọn Gói trị liệu) within Module 2, mapping business requirements and business rules to technical components, database structures, and testing/verification elements.

---

## 1. Document Control
* **Document ID**: RESORT-M2-TM-UC07
* **Scope**: Module 2 (Retreat Package & Accommodation Booking)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC07-001** | Support room booking reservation combined with a chosen retreat package. | `BookingController.createBooking()` <br> `RoomBookingService.createBooking()` | Table: `room_booking` <br> Table: `booking_packages` | **BOOK-TC-001** | `BookingServiceImplTest.testCreateBooking_Success()` | **Traced** |
| **BR-04** | Only ACTIVE retreat packages can be viewed and selected. | `RetreatPackageService.filterActivePackages()` | Table: `retreat_packages` <br> Column: `status` = 'ACTIVE' | **BOOK-TC-001** | `RetreatPackageServiceTest.testFilterActiveOnly()` | **Traced** |
| **BR-05** | Freeze pricing information: Persist the price of the room and package at booking time to prevent future price fluctuation impact. | `RoomBookingDetail.price_at_booking` <br> `BookingServiceImpl.calculateBookingCosts()` | Table: `room_booking_detail` <br> Columns: `price_at_booking` | **BOOK-TC-001** | `BookingServiceImplTest.testPriceIsFrozenAtBooking()` | **Traced** |
| **REQ-UC07-002** | Prevent booking if any selected villa/room overlaps with another active booking. | `RoomBookingService.createBooking()` <br> `BookingServiceImpl.validateVillaAvailability()` | Table: `room_booking` <br> Table: `room_booking_detail` | **BOOK-TC-002** | `BookingServiceImplTest.testCreateBooking_OverlappingDates_ThrowsException()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: [BookingController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/BookingController.java) & [RoomBookingController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/RoomBookingController.java)
- **Service**: [RoomBookingService.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/RoomBookingService.java) & [BookingServiceImpl.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/impl/BookingServiceImpl.java)
- **Repository**: `fu.se.smms.repository.RoomBookingRepository`, `fu.se.smms.repository.RetreatPackageRepository`
- **Entity**: `RoomBooking.java`, `RoomBookingDetail.java`, `RetreatPackage.java`

### 3.2. Database Schema
- **Room Booking Table**: `dbo.room_booking` with columns: `booking_id`, `check_in_date`, `check_out_date`, `status`, `user_id`, `package_id`.
- **Detail Table**: `dbo.room_booking_detail` with column `price_at_booking` (decimal/numeric) to store the frozen price.

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.BookingServiceImplTest`
- **Verification Result**: `PASS` for successful booking creation and frozen pricing calculations.
