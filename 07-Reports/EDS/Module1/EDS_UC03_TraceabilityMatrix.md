# Requirements Traceability Matrix - UC03: Account Management & RBAC

This document provides end-to-end traceability for **UC03: Account Management & Role Assignment (RBAC)** within Module 1, mapping requirements, security controls, technical endpoints, database attributes, and test cases.

---

## 1. Document Control
* **Document ID**: RESORT-M1-TM-UC03
* **Scope**: Module 1 (Authentication & Sensitive Health Profile)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC03-001** | Admin can view users list, assign roles, and toggle user accounts status. | `AdminController.getAllUsers()` <br> `AdminController.updateUserStatus()` <br> `AdminController.updateUserRole()` | Table: `users` <br> Columns: `role`, `status` | **RBAC-TC-001** | `AdminControllerTest.testGetAllUsers_AdminSuccess()` | **Traced** |
| **BR-21** | Least Privilege Principle: Guard administrative API endpoints so only ADMIN role can execute actions. Non-admin queries must return `403 Forbidden`. | Spring Security configuration <br> `@PreAuthorize("hasRole('ADMIN')")` | Table: `users` <br> Column: `role` | **RBAC-TC-001** | `AdminControllerTest.testGetAllUsers_StaffForbidden()` | **Traced** |
| **BR-22** | Block Login Rule: Prevent authentication if user account status is set to `INACTIVE` or `BANNED`. | `CustomUserDetailsService.loadUserByUsername()` <br> Status validation inside auth filters | Table: `users` <br> Column: `status` | **RBAC-TC-002** | `AuthControllerTest.testLogin_BannedUser_ThrowsException()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: [AdminController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/AdminController.java) & [AuthController.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/controller/AuthController.java)
- **Service**: `UserServiceImpl.java` & `CustomUserDetailsService.java`
- **Security Guard**: `SecurityConfig.java` (Spring Security configuration)
- **Repository**: `fu.se.smms.repository.UserRepository`
- **Entity**: `User.java`

### 3.2. Database Schema
- **User Table**: `dbo.users` containing `user_id`, `role` (varchar storing 'ADMIN', 'STAFF', 'GUEST', etc.), `status` (varchar storing 'ACTIVE', 'INACTIVE', 'BANNED', etc.).

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.controller.AdminControllerTest` & `AuthControllerTest`
- **Verification Results**: Verified correct access controls, block login filters, and role assignment capabilities.
