# Walkthrough - SQL Server Database Design for Ngu Son Resort & Spa

This document details the database schema design created in the file [resort_spa_db.sql](file:///c:/Users/Administrator/Videos/SWP391_G3/SQL_DB_RESORT_SPA/resort_spa_db.sql). The database is designed for **Microsoft SQL Server** to support the core operational modules of the **Ngu Son Resort & Spa Management System (NSRMS)**.

## Database File Created

- **File Path**: [resort_spa_db.sql](file:///c:/Users/Administrator/Videos/SWP391_G3/SQL_DB_RESORT_SPA/resort_spa_db.sql)
- **Folder**: [SQL_DB_RESORT_SPA](file:///c:/Users/Administrator/Videos/SWP391_G3/SQL_DB_RESORT_SPA)

---

## Database Tables Overview

The schema consists of **22 tables** grouped by business components:

### 1. User & Authentication Component
- `[User]`: Holds accounts for Managers, Receptionists, Therapists, Chefs, and Customers. (Delimited to avoid SQL Server keyword conflict).
- `[medical_profile]`: Stores sensitive medical notes (allergies, health history) in a strict 1-to-1 relationship with `[User]`. Fully compliant with Decree 356/2025/ND-CP on personal data protection.
- `[refresh_token]`: Holds UUID-based JWT refresh tokens for session management.
- `[work_schedule]`: Tracks staff work shifts.

### 2. Room & Accommodation Component
- `[room_type]`: Master data for room categories (Standard Room, Vip Villa, Presidential Suite).
- `[room]`: Holds physical room numbers and real-time operational status.
- `[room_booking]`: Master reservation folios connecting customers with package selections and dates.
- `[room_booking_detail]`: Line items mapping villas/rooms to a booking.
- `[room_guest_declaration]`: Companion registration details for police check-in compliance.

### 3. Spa & Therapy Component
- `[spa_service]`: Master data for therapies (Hot Volcanic Stone Massage, Red Dao Herbal Bath).
- `[package_spa_limit]`: Defines complimentary spa sessions bundled inside a retreat package.
- `[treatment_room]`: Physical therapy rooms.
- `[spa_booking]`: Spa scheduling engine aligning customer, therapist, room, and time. Supports walk-ins.

### 4. Dietary (Food & Beverage) Component
- `[food_menu]`: Master data for healthy culinary items with dietary tags (Vegan, Keto).
- `[package_food_limit]`: Defines daily food allowances bundled in packages.
- `[food_order]`: Dining orders submitted by guests or staff.
- `[food_order_detail]`: Dish details inside an F&B order with customized special/allergy notes.

### 5. Billing & Feedback Components
- `[invoice]`: AHLEI-compliant Guest Folio aggregating lodging, spa, and dining costs.
- `[blog]`: Article publishing system for managers.
- `[feedback]`: Ratings and comment logs.

---

## Schema Design Details

### 1. Referential Integrity & Cascade Rules
To prevent SQL Server from throwing the `multiple cascade paths` error, cascading delete rules were carefully restricted:
- **Cascade Deletes (`ON DELETE CASCADE`)** are allowed only on direct 1-to-1 or simple child tables: `[medical_profile]`, `[refresh_token]`, `[work_schedule]`, `[room_booking_detail]`, `[room_guest_declaration]`, `[package_spa_limit]`, `[package_food_limit]`, `[food_order_detail]`, `[cart_item]`, `[blog]`, and `[feedback]`.
- **Set Null / No Action (`ON DELETE NO ACTION` / `ON DELETE SET NULL`)** are applied to shared/polymorphic relationships (e.g. `[spa_booking]`, `[food_order]`, `[invoice]`, `[room_booking]`) to ensure deletion of parent records does not trigger conflicting deletion paths.

### 2. Constraints & Data Types
- **Boolean fields**: Mapped using `BIT` with defaults `0` / `1`.
- **Financial values**: Mapped using `DECIMAL(15,2)` with `CHECK (value >= 0)` constraints.
- **Enums**: Validated using `VARCHAR` columns with strict `CHECK` constraints (e.g. `role IN ('MANAGER', 'RECEPTIONIST', 'THERAPIST', 'CHEF', 'CUSTOMER')`).
- **Unicode Support**: `NVARCHAR` is used for descriptive fields to natively support Vietnamese accents.

### 3. Performance Indexes
Indexes are created on foreign keys and date ranges frequently used in join and query filters:
- `IX_room_booking_User` on `dbo.room_booking(user_id)`
- `IX_spa_booking_Dates` on `dbo.spa_booking(start_datetime, end_datetime)`
- `IX_spa_booking_Therapist` on `dbo.spa_booking(therapist_id)`
- `IX_food_order_User` on `dbo.food_order(user_id)`
- `IX_invoice_Booking` on `dbo.invoice(room_booking_id)`

---

## Seed Data Added

The script contains extensive sample data representing:
- **Staff and Guest Accounts** (including Therapist "Bác Sĩ Hải" and Chef "Phạm Bếp Trưởng").
- **Medical Profiles** with sample encrypted strings (representing health notes and food allergy details like peanuts/seafood).
- **Master Packages & Catalogues** (e.g. *5-day Detox Journey* package, standard villa rooms, spa therapies, and organic dishes).
- **Active Transactions** (active room bookings, spa schedules, food order requests with allergy alerts, and folio invoices).
