# Software Design Specification (SDS) - Backend MVC Architecture

This document covers the Spring Boot Java package structure, server configurations, and class mappings configured in the [Backend](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend) directory of the workspace.

## 🛠️ Project Stack & Configuration
- **Framework**: Spring Boot 3.x, Spring Data JPA, Spring Security, Validation.
- **Java Platform**: Java 21 (LTS).
- **Build Tool**: Maven (`pom.xml` config).
- **Target Server Port**: `8080` (context-path `/api`).
- **Target Database**: Microsoft SQL Server (`ResortSpaDB` datasource driver).

---

## 📂 Package Design Skeletons (`fu.se.smms`)

We created empty packages and reference Java class skeletons to set up the IntelliJ development workspace:

### 1. Controllers (`fu.se.smms.controller`)
Handle incoming HTTP requests and return ResponseEntity models mapping DTO payloads.
- **`InvoiceController.java`**: Exposes payment routing paths:
  - `GET /invoices/{id}` - Retrieve details of a checkout invoice.
  - `GET /invoices/user/{userId}` - Query all invoices of a customer.
  - `POST /invoices/create` - Generate a guest folio invoice from a room booking ID.
  - `POST /invoices/{id}/payment-url` - Acquire a VNPay checkout link.
  - `GET /invoices/vnpay-callback` - Receive VNPay transaction webhook secure callbacks.

### 2. Services (`fu.se.smms.service` & `fu.se.smms.service.impl`)
Contain business logic interfaces and implementation templates.
- **`InvoiceService.java`** / **`InvoiceServiceImpl.java`**: Orchestrates calculation of room, spa, and food subtotals, computes tax, generates VNPay redirection links, and handles callback statuses.

### 3. Repositories (`fu.se.smms.repository`)
Data access layers extending `JpaRepository` mapping to database tables.
- **`InvoiceRepository.java`**: Database mapper containing queries to find invoices by user ID and booking ID.

### 4. Entities (`fu.se.smms.entity`)
JPA Models mapping directly to SQL Server schemas.
- **`Invoice.java`**: Maps to `invoice` table columns (subtotals, final amount, status, transaction details).
- **`User.java`, `MedicalProfile.java`, `RoomBooking.java`**: Skeletons mapping authentication, wellness profiles, and lodging transactions.

### 5. DTOs (`fu.se.smms.dto`)
Data Transfer Objects outlining request/response JSON models.
- **`InvoiceDTO.java`**: Foliage response payload.
- **`VNPayPaymentDTO.java`**: Request schema containing amount, return URL, response code, and transaction details.

---

## 🖥️ View Component (API Dashboard Panel)
Served from the static resources folder (`src/main/resources/static/index.html`). 
Accessing `http://localhost:8080/` displays a clean dark glassmorphism dashboard providing:
- Real-time online service status indication.
- Overview of checkout and VNPay payment endpoints.
- Quick navigation links for developer integration.
