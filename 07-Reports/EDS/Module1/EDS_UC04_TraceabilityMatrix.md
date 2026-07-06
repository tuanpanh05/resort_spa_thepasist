# Requirements Traceability Matrix - UC04: Master Data Management

This document provides end-to-end traceability for **UC04: Master Data Setup** within Module 1, mapping requirements, authorization controls, database tables, and verification tests.

---

## 1. Document Control
* **Document ID**: RESORT-M1-TM-UC04
* **Scope**: Module 1 (Authentication & Sensitive Health Profile)
* **Status**: Complete
* **Language**: English

---

## 2. Traceability Matrix Table

| Requirement ID | Requirement / Rule Description | Technical Component (Java Class & Method) | Database Elements (Table & Columns) | Test Case ID | Verification Method (Unit/Integration Test) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-UC04-001** | Support viewing master data lists (Room Types, Retreat Packages, Spa Services) without login requirement. | `MasterDataController.getRoomTypes()` <br> `MasterDataController.getSpaServices()` | Table: `room_types` <br> Table: `spa_services` | **MD-TC-001** | `MasterDataServiceImplTest.testGetRoomTypes_Success()` | **Traced** |
| **REQ-UC04-002** | Support editing, updating, and inserting new master data categories by administrator only. | `MasterDataController.createRoomType()` <br> `@PreAuthorize("hasRole('ADMIN')")` | Table: `room_types` <br> Table: `spa_services` | **MD-TC-002** | `MasterDataControllerTest.testCreateRoomType_AdminSuccess()` | **Traced** |
| **BR-04-001** | Authorization Guard: Restrict write access to category structures (CRUD) strictly to ADMIN role. GUEST or STAFF requests must yield `403 Forbidden`. | Spring Security configuration <br> `@PreAuthorize("hasRole('ADMIN')")` | Table: `users` <br> Column: `role` | **MD-TC-002** | `MasterDataControllerTest.testCreateSpaService_GuestForbidden()` | **Traced** |

---

## 3. Component Details & Mapping

### 3.1. Code Modules
- **Controller**: `MasterDataController.java`
- **Service**: [MasterDataService.java](file:///d:/ResortManageNew/05-Development/backend/src/main/java/fu/se/smms/service/MasterDataService.java) & `MasterDataServiceImpl.java`
- **Repository**: `RoomTypeRepository.java`, `SpaServiceRepository.java`, `RetreatPackageRepository.java`
- **Entity**: `RoomType.java`, `SpaService.java`, `RetreatPackage.java`

### 3.2. Database Schema
- **Room Types Table**: `dbo.room_types`
- **Spa Services Table**: `dbo.spa_services`
- **Retreat Packages Table**: `dbo.retreat_packages`

### 3.3. Verification Summary
- **JUnit Test Case**: `fu.se.smms.service.impl.MasterDataServiceImplTest`
- **Verification Results**: Confirmed public read endpoints allow unauthenticated fetch, and modification API endpoints require strict admin authorization check.
