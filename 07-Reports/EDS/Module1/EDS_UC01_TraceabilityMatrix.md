# Requirements Traceability Matrix - UC01: Registration & Login

This document provides end-to-end traceability for **UC01: Traditional Registration & Google SSO** within Module 1, mapping requirements, business rules, controllers, services, database tables, and test cases.

---

## 1. Document Control
* **Document ID**: RESORT-M1-TM-UC01
* **Scope**: Module 1 (Authentication & Sensitive Health Profile)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC01-001** | Support traditional registration with email verification via OTP. | `AuthController.registerUser()` <br> `UserServiceImpl.signUp()` <br> `AuthController.verifyOtp()` | Table: `users` <br> Table: `otp_token` | **AUTH-TC-001** | `AuthControllerTest.testRegister_Success()` | **Traced** |
| **BR-01** | Email uniqueness: Each email address must register exactly one user account. | `UserRepository.existsByEmail()` <br> `UserServiceImpl.signUp()` | Table: `users` <br> Column: `email` | **AUTH-TC-001** | `UserServiceTest.testSignUp_DuplicateEmail_ThrowsException()` | **Traced** |
| **BR-02** | Prevent traditional login for non-verified users (status = `INACTIVE`). | `AuthController.login()` <br> `CustomUserDetailsService.loadUserByUsername()` | Table: `users` <br> Column: `status` | **AUTH-TC-002** | `AuthControllerTest.testLogin_InactiveUser_Fails()` | **Traced** |
| **REQ-UC01-002** | Support Google SSO login. Sync email, avatar, and full name if user is logging in for the first time. | `AuthController.authenticateGoogleUser()` <br> `UserServiceImpl.loginWithGoogle()` | Table: `users` <br> Columns: `email`, `full_name` | **AUTH-TC-003** | `AuthControllerTest.testGoogleSSO_NewUser()` | **Traced** |
| **BR-01-002** | Prevent Google SSO from overwriting user's full name if they have updated it manually in NSRMS system. | `UserServiceImpl.loginWithGoogle()` | Table: `users` <br> Column: `full_name` | **AUTH-TC-003** | `AuthControllerTest.testGoogleSSO_DoesNotOverwriteName()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: [AuthController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/AuthController.java)
- **Service**: [UserServiceImpl.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/impl/UserServiceImpl.java) & `CustomUserDetailsService.java`
- **Repository**: `fu.se.smms.repository.UserRepository`, `fu.se.smms.repository.OtpTokenRepository`
- **Entity**: `User.java`, `OtpToken.java`

### 3.2. Database Schema
- **User Table**: `dbo.users` storing user login and profile data.
- **OTP Table**: `dbo.otp_token` storing verification tokens and expiration timestamps.

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.controller.AuthControllerTest`
- **Verification Results**: Verified successful register/login flows, OTP checks, and Google SSO name synchronization rules.
