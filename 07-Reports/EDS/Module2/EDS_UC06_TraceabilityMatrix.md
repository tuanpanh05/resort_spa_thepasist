# Requirements Traceability Matrix - UC06: Room Availability Engine

This document provides end-to-end traceability for **UC06: Room Availability Engine** (Tìm kiếm & Kiểm tra phòng trống) within Module 2, mapping business requirements and business rules to technical components, database structures, and testing/verification elements.

---

## 1. Document Control
* **Document ID**: RESORT-M2-TM-UC06
* **Scope**: Module 2 (Retreat Package & Accommodation Booking)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC06-001** | Search available villas/rooms based on check-in and check-out dates. | `VillaController.getAvailableVillas()` <br> `BookingServiceImpl.checkRoomAvailability()` | Table: `room` <br> Table: `room_booking` | **ROOM-TC-001** | `BookingServiceImplTest.testCheckAvailability_Success()` | **Traced** |
| **BR-06** | A room is available if it has no overlapping active bookings (`CONFIRMED`, `CHECKED_IN`). Overlapping is defined as `checkInDate < Booking.checkOutDate` and `checkOutDate > Booking.checkInDate`. | `RoomBookingRepository.findOverlappingBookings()` <br> `BookingServiceImpl.validateVillaAvailability()` | Table: `room_booking` <br> Columns: `check_in_date`, `check_out_date`, `status` | **ROOM-TC-001** | `BookingServiceImplTest.testCheckAvailability_OverlappingBooking()` | **Traced** |
| **REQ-UC06-002** | Input validation: Prevent query if `checkOutDate` is equal to or prior to `checkInDate`. | `VillaController.validateDates()` or `BookingServiceImpl` dates validation. | N/A (Validated at Service / Controller layer) | **ROOM-TC-002** | `BookingServiceImplTest.testCheckAvailability_InvalidDates_ThrowsException()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: [VillaController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/VillaController.java)
- **Service**: [BookingServiceImpl.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/impl/BookingServiceImpl.java)
- **Repository**: [RoomBookingRepository.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/repository/RoomBookingRepository.java)
- **Entity**: [Room.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/entity/Room.java) & [RoomBooking.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/entity/RoomBooking.java)

### 3.2. Database Schema
- **Bungalow / Villa Entity**: Maps to the SQL Server table `dbo.room` containing `room_id`, `room_number`, `room_type_id`, and `status`.
- **Booking Records**: Maps to table `dbo.room_booking` containing dates, status, and details in `dbo.room_booking_detail`.

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.BookingServiceImplTest`
- **Frontend Build**: Vite production build verifies no syntax issues in receptionist and customer search pages.
