# Software Design Specification (SDS) - Database Design

This document details the database schema design for the **Ngu Son Resort & Spa Management System (NSRMS)**, matching the implementation in [resort_spa_db.sql](file:///c:/Users/Administrator/Videos/SWP391_G3/SQL_DB_RESORT_SPA/resort_spa_db.sql).

## 🛢️ Database Platform
- **DBMS**: Microsoft SQL Server
- **Authentication**: JWT token storage, BCrypt password hashing.
- **Compliance**: AES-256 encrypted fields for sensitive data (Passports, Medical Logs) to satisfy Decree 356/2025/ND-CP.

---

## 📋 Entity Catalog (22 Tables)

### 1. User & Authentication Component
- **`[User]`**: Root parent containing accounts.
  - Columns: `user_id` (PK), `email` (Unique), `password_hash`, `full_name`, `phone`, `id_passport_encrypted`, `role` (Enum), `status` (Enum), `created_at`.
  - Roles: `MANAGER`, `RECEPTIONIST`, `THERAPIST`, `CHEF`, `CUSTOMER`.
  - Statuses: `ACTIVE`, `INACTIVE`.
- **`medical_profile`**: 1-to-1 extension containing medical records.
  - Columns: `profile_id` (PK), `user_id` (FK, Unique), `physical_condition_encrypted`, `food_allergies_encrypted`, `explicit_consent_signed` (Bit), `updated_at`.
- **`refresh_token`**: JWT refresh keys.
  - Columns: `token_id` (PK), `user_id` (FK), `token` (Unique), `expires_at`, `used` (Bit), `created_at`.
- **`work_schedule`**: Staff shift assignments.
  - Columns: `schedule_id` (PK), `staff_id` (FK), `work_date`, `shift_start`, `shift_end`, `status`.

### 2. Accommodation & Booking Component
- **`room_type`**: Categories defining occupancy.
  - Columns: `room_type_id` (PK), `type_name`, `base_price` (Decimal), `capacity` (Int).
- **`room`**: Physical lodging units.
  - Columns: `room_id` (PK), `room_type_id` (FK), `room_number` (Unique), `status` (Enum: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `DIRTY`).
- **`room_booking`**: Master reservation.
  - Columns: `booking_id` (PK), `user_id` (FK), `package_id` (FK, Nullable), `check_in_date`, `check_out_date`, `status` (Enum: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`), `total_deposit`, `created_at`.
- **`room_booking_detail`**: Maps rooms to bookings.
  - Columns: `detail_id` (PK), `booking_id` (FK), `room_id` (FK), `price_at_booking`.
- **`room_guest_declaration`**: Police check-in reports.
  - Columns: `declaration_id` (PK), `booking_detail_id` (FK), `guest_full_name`, `guest_id_passport_encrypted`, `declared_at`.

### 3. Retreat Package & Spa Component
- **`retreat_package`**: Master wellness packages.
  - Columns: `package_id` (PK), `package_name`, `description`, `base_price`, `duration_days`.
- **`spa_service`**: Therapy catalog.
  - Columns: `spa_id` (PK), `service_name`, `description`, `price`, `duration_minutes`.
- **`package_spa_limit`**: Configures bundled spa sessions inside a package.
  - Columns: `package_spa_id` (PK), `package_id` (FK), `spa_id` (FK), `quantity_included`.
- **`treatment_room`**: Therapy spaces.
  - Columns: `treatment_room_id` (PK), `room_name`, `status` (Enum: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
- **`spa_booking`**: Spa appointment schedule.
  - Columns: `spa_booking_id` (PK), `user_id` (FK), `room_booking_id` (FK, Nullable), `spa_id` (FK), `therapist_id` (FK), `treatment_room_id` (FK), `start_datetime`, `end_datetime`, `status` (Enum: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NOSHOW`), `price_at_booking`, `is_package_included` (Bit).

### 4. Food & Beverage Component
- **`food_menu`**: Dish choices.
  - Columns: `food_id` (PK), `dish_name`, `description`, `price`, `dietary_tags`.
- **`package_food_limit`**: Configures daily dish limits inside a package.
  - Columns: `package_food_id` (PK), `package_id` (FK), `food_id` (FK), `quantity_per_day`.
- **`food_order`**: Meal orders.
  - Columns: `order_id` (PK), `user_id` (FK), `room_booking_id` (FK, Nullable), `order_time`, `status` (Enum: `PENDING`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`), `total_amount`.
- **`food_order_detail`**: Order line items.
  - Columns: `order_detail_id` (PK), `order_id` (FK), `food_id` (FK), `quantity`, `price_at_order`, `special_note`, `is_package_included` (Bit).
- **`cart_item`**: Pre-booking shopping cart.
  - Columns: `cart_id` (PK), `user_id` (FK), `item_type` (Enum: `ROOM`, `SPA`, `FOOD`), `item_id`, `quantity`, `created_at`.

### 5. Billing, Blog & Feedback Component
- **`invoice`**: AHLEI guest folio ledger.
  - Columns: `invoice_id` (PK), `user_id` (FK), `room_booking_id` (FK), `room_subtotal`, `spa_subtotal`, `food_subtotal`, `tax_and_fees`, `final_amount`, `status` (Enum: `UNPAID`, `PAID`, `CANCELLED`), `vnpay_tran_id`, `payment_time`.
- **`blog`**: Promotion pages.
  - Columns: `blog_id` (PK), `author_id` (FK), `title`, `content`, `status` (Enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`), `created_at`.
- **`feedback`**: Reviews.
  - Columns: `feedback_id` (PK), `user_id` (FK), `room_booking_id` (FK), `rating` (1-5), `comment`, `is_toxic` (Bit), `created_at`.

---

## 🔏 Cascading Delete Logic
To avoid circular dependency conflicts in SQL Server:
- **`ON DELETE CASCADE`**: Used exclusively for direct dependency relationships such as `medical_profile`, `refresh_token`, `work_schedule`, `room_booking_detail`, `room_guest_declaration`, `package_spa_limit`, `package_food_limit`, `food_order_detail`, and `feedback`.
- **`ON DELETE NO ACTION / SET NULL`**: Used for cross-component entities like `spa_booking`, `food_order`, and `invoice` to prevent cascade cycles.
