# Requirements Traceability Matrix - UC13: View Daily Schedule & Guest Notes

This document provides end-to-end traceability for **UC13: View Daily Schedule & Guest Notes** (Xem lịch làm việc & Hồ sơ trị liệu) within Module 3, mapping business privacy rules, controller methods, DTO properties, database schemas, and test cases.

---

## 1. Document Control
* **Document ID**: RESORT-M3-TM-UC13
* **Scope**: Module 3 (Spa Services)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC13-001** | Support therapist view of their daily schedule containing assigned spa bookings and guest profiles. | `SpaBookingController.getTherapistSchedule()` <br> `SpaBookingServiceImpl.getTherapistSchedule()` | Table: `spa_booking` <br> Table: `users` | **NOTE-TC-001** | `SpaBookingServiceImplTest.testGetTherapistSchedule_Success()` | **Traced** |
| **BR-21-SPA** | Least Privilege Rule: Allow therapist to see the guest's physical medical notes to safely perform therapies, but filter out/omit dining allergy data, passport details, or folio financial data. | `SpaBookingServiceImpl.getTherapistSchedule()` <br> `TherapistScheduleDTO` filtering | Table: `medical_profile` <br> Columns: `physical_condition_encrypted` (shown), `food_allergies_encrypted` (filtered out) | **NOTE-TC-002** | `SpaBookingServiceImplTest.testScheduleDTO_ExcludesSensitiveNonSpaData()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: `SpaBookingController.java`
- **Service**: `SpaBookingServiceImpl.java` & `EncryptionServiceImpl.java` (for decrypting `physicalCondition` for the therapist)
- **Repository**: `fu.se.smms.repository.SpaBookingRepository`, `fu.se.smms.repository.MedicalProfileRepository`
- **DTO**: `TherapistScheduleDTO.java` (exposing only `physicalCondition`)

### 3.2. Database Schema
- **Medical Profile Table**: `dbo.medical_profile` containing `physical_condition_encrypted` which is fetched and decrypted transparently.
- **Spa Booking Table**: `dbo.spa_booking` mapped by `therapist_id` to query daily schedules.

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.SpaBookingServiceImplTest`
- **Verification Results**: Verified correct decryption of physical condition notes for therapists, and verified DTO response data isolation to prevent leakage of unrelated sensitive data.
