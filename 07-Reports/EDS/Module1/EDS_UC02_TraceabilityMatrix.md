# Requirements Traceability Matrix - UC02: Health & Allergy Declaration

This document provides end-to-end traceability for **UC02: Sensitive Health Profile & Explicit Consent** within Module 1, mapping requirements, compliance targets, technical classes, database attributes, and verification tests.

---

## 1. Document Control
* **Document ID**: RESORT-M1-TM-UC02
* **Scope**: Module 1 (Authentication & Sensitive Health Profile)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC02-001** | Support declaring physical condition details and food allergies by guest or receptionist. | `MedicalProfileController.saveProfile()` <br> `MedicalProfileServiceImpl.saveProfile()` | Table: `medical_profile` | **MP-TC-002** | `MedicalProfileControllerTest.testSaveProfile_Success()` | **Traced** |
| **BR-02-001** | Explicit Consent Rule: Explicit consent checkbox must be signed (`true`). If `false`, refuse transaction and return `400 Bad Request`. | `MedicalProfileServiceImpl.saveProfile()` <br> Check: `explicitConsentSigned == true` | Table: `medical_profile` <br> Column: `explicit_consent_signed` | **MP-TC-001** | `MedicalProfileControllerTest.testSaveProfile_NoConsent_ThrowsException()` | **Traced** |
| **REQ-UC02-002** | Encryption Rule: Physical condition and food allergies data must be automatically encrypted using AES-256 before database insertion to comply with Decree 13/2023/ND-CP. | `AesEncryptorConverter.convertToDatabaseColumn()` <br> `JPA AttributeConverter` mappings on Entity | Table: `medical_profile` <br> Columns: `physical_condition_encrypted`, `food_allergies_encrypted` | **MP-TC-002** | `EncryptionServiceTest` & database raw query validation | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: [MedicalProfileController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/MedicalProfileController.java)
- **Service**: `MedicalProfileServiceImpl.java` & `EncryptionServiceImpl.java`
- **Converter**: `AesEncryptorConverter.java` (implements `AttributeConverter<String, String>`)
- **Repository**: `fu.se.smms.repository.MedicalProfileRepository`
- **Entity**: `MedicalProfile.java`

### 3.2. Database Schema
- **Medical Profile Table**: `dbo.medical_profile` with columns: `profile_id`, `user_id`, `physical_condition_encrypted` (nvarchar), `food_allergies_encrypted` (nvarchar), `explicit_consent_signed` (bit).

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.controller.MedicalProfileControllerTest`
- **Verification Results**: Confirmed validation blocks on unsigned consent and transparent AES encryption conversion at the JPA layer.
