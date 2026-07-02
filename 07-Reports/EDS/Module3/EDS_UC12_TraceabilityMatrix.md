# Requirements Traceability Matrix - UC12: Auto-match Therapist & Room

This document provides end-to-end traceability for **UC12: Auto-match Therapist & Room** (Tự động ghép lịch thông minh) within Module 3, mapping business rules, specialty criteria, service handlers, database schemas, and test cases.

---

## 1. Document Control
* **Document ID**: RESORT-M3-TM-UC12
* **Scope**: Module 3 (Spa Services)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC12-001** | Support automatic matching of available therapist and treatment room matching the requested spa service category and time slot. | `SpaBookingController.autoMatch()` <br> `SpaBookingServiceImpl.autoAssignResource()` | Table: `users` <br> Table: `treatment_room` <br> Table: `spa_booking` | **MATCH-TC-001** | `SpaBookingServiceImplTest.testAutoMatch_Success()` | **Traced** |
| **BR-12-001** | Specialty Matching Rule: Match therapist according to service category (e.g. Yoga -> YOGA_INSTRUCTOR, Physical therapy -> PHYSIO, Spa -> SPA_STAFF). | `SpaBookingServiceImpl.filterTherapistBySpecialty()` | Table: `users` <br> Column: `specialty` | **MATCH-TC-001** | `SpaBookingServiceImplTest.testMatch_CorrectSpecialty()` | **Traced** |
| **BR-12-002** | Specialty Matching Fallback: If no specialist with exact matching category is free, apply fallback logic assigning any general available therapist in that slot. | `SpaBookingServiceImpl.autoAssignResource()` (fallback block) | Table: `users` <br> Column: `specialty` | **MATCH-TC-001** | `SpaBookingServiceImplTest.testMatch_FallbackToAvailable()` | **Traced** |
| **REQ-UC12-002** | Prevent matching and return error if all therapists or treatment rooms are fully occupied in the selected time range. | `SpaBookingServiceImpl.autoAssignResource()` | Table: `spa_booking` <br> Columns: `start_datetime`, `end_datetime` | **MATCH-TC-002** | `SpaBookingServiceImplTest.testMatch_AllBusy_ThrowsException()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: `SpaBookingController.java`
- **Service**: `SpaBookingServiceImpl.java`
- **Repository**: `fu.se.smms.repository.TreatmentRoomRepository`, `fu.se.smms.repository.UserRepository`, `fu.se.smms.repository.SpaBookingRepository`
- **Entity**: `User.java` (Therapist role), `TreatmentRoom.java`, `SpaBooking.java`

### 3.2. Database Schema
- **User Table (Therapists)**: `dbo.users` containing `user_id`, `role` = 'THERAPIST', `specialty` (e.g. 'YOGA', 'PHYSIO', 'SPA').
- **Treatment Room Table**: `dbo.treatment_room` containing `room_id`, `room_number`, `category` (e.g. 'YOGA_ROOM', 'SPA_ROOM').

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.SpaBookingServiceImplTest`
- **Verification Results**: Verified successful therapist specialty mapping, fallback mechanisms, and conflict responses.
