# Requirements Traceability Matrix - UC05: Right to Deletion

This document provides end-to-end traceability for **UC05: Right to Deletion / Data Minimization** within Module 1, mapping requirements, privacy regulations (Decree 13/2023/ND-CP), controller delete handlers, database records, and verification tests.

---

## 1. Document Control
* **Document ID**: RESORT-M1-TM-UC05
* **Scope**: Module 1 (Authentication & Sensitive Health Profile)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC05-001** | Support guest request to delete physical condition profile data after checking out to protect privacy. | `MedicalProfileController.deleteMyProfile()` <br> `MedicalProfileServiceImpl.deleteProfileByUserId()` | Table: `medical_profile` | **DEL-TC-001** | `MedicalProfileServiceImplTest.testDeleteMyProfile_Success()` | **Traced** |
| **BR-20** | Data Minimization Principle: Empty physical condition records and disable consent status upon guest deletion request or automated cleanup job schedule. | `MedicalProfileServiceImpl.deleteProfileByUserId()` <br> `@Scheduled` cleanup job in `MedicalProfileCleanupScheduler` | Table: `medical_profile` <br> Columns: `physical_condition_encrypted` = NULL, `food_allergies_encrypted` = NULL | **DEL-TC-001** | `MedicalProfileServiceImplTest.testSchedulerCleanup_Success()` | **Traced** |
| **BR-20-002** | Security Restriction: Ensure users can only delete their own health profile, and reject any unauthorized deletion queries with `403 Forbidden`. | `@PreAuthorize` user checks <br> `MedicalProfileServiceImpl` validation checks | Table: `medical_profile` <br> Column: `user_id` | **DEL-TC-002** | `MedicalProfileControllerTest.testDeleteProfile_UnauthorizedUser_Forbidden()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: `MedicalProfileController.java`
- **Service**: `MedicalProfileServiceImpl.java`
- **Scheduler**: `MedicalProfileCleanupScheduler.java` (optional weekly cron runner)
- **Repository**: `fu.se.smms.repository.MedicalProfileRepository`
- **Entity**: `MedicalProfile.java`

### 3.2. Database Schema
- **Medical Profile Table**: `dbo.medical_profile` containing `profile_id`, `user_id`, `physical_condition_encrypted` (cleared to null), `food_allergies_encrypted` (cleared to null), `explicit_consent_signed` (set to false).

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.MedicalProfileServiceImplTest`
- **Verification Results**: Verified correct deletion handling, cron schedule cleanup behavior, and ownership validation preventing unauthorized profile erasure.
