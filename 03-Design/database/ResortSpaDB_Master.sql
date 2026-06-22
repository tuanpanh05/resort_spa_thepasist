-- =========================================================================
-- SYSTEM: RESORT & SPA MANAGEMENT (NSRMS)
-- DIALECT: MICROSOFT SQL SERVER (T-SQL)
-- DATABASE NAME: ResortSpaDB
-- FILE NAME: NghiaDB.sql
-- PURPOSE: Full schema for ResortSpaDB incorporating Module 2 requirements
--          (TDD, EDS, Residence Law 2020 compliance) while maintaining
--          backward compatibility with existing Spring Boot JPA entities.
-- =========================================================================

IF DB_ID('ResortSpaDB') IS NULL
BEGIN
    CREATE DATABASE ResortSpaDB;
END
GO
USE ResortSpaDB;
GO

-- =========================================================================
-- 1. DROP EXISTING TABLES (CHILDREN FIRST, THEN PARENTS)
-- =========================================================================
IF OBJECT_ID('dbo.package_highlights', 'U') IS NOT NULL DROP TABLE dbo.package_highlights;
IF OBJECT_ID('dbo.package_features', 'U') IS NOT NULL DROP TABLE dbo.package_features;
IF OBJECT_ID('dbo.feedback', 'U') IS NOT NULL DROP TABLE dbo.feedback;
IF OBJECT_ID('dbo.blog', 'U') IS NOT NULL DROP TABLE dbo.blog;
IF OBJECT_ID('dbo.payment_transaction_log', 'U') IS NOT NULL DROP TABLE dbo.payment_transaction_log;
IF OBJECT_ID('dbo.invoice', 'U') IS NOT NULL DROP TABLE dbo.invoice;
IF OBJECT_ID('dbo.food_order_detail', 'U') IS NOT NULL DROP TABLE dbo.food_order_detail;
IF OBJECT_ID('dbo.food_order', 'U') IS NOT NULL DROP TABLE dbo.food_order;
IF OBJECT_ID('dbo.cart_item', 'U') IS NOT NULL DROP TABLE dbo.cart_item;
IF OBJECT_ID('dbo.package_food_limit', 'U') IS NOT NULL DROP TABLE dbo.package_food_limit;
IF OBJECT_ID('dbo.food_menu', 'U') IS NOT NULL DROP TABLE dbo.food_menu;
IF OBJECT_ID('dbo.spa_booking', 'U') IS NOT NULL DROP TABLE dbo.spa_booking;
IF OBJECT_ID('dbo.treatment_room', 'U') IS NOT NULL DROP TABLE dbo.treatment_room;
IF OBJECT_ID('dbo.package_spa_limit', 'U') IS NOT NULL DROP TABLE dbo.package_spa_limit;
IF OBJECT_ID('dbo.spa_services', 'U') IS NOT NULL DROP TABLE dbo.spa_services;
IF OBJECT_ID('dbo.spa_service', 'U') IS NOT NULL DROP TABLE dbo.spa_service;
IF OBJECT_ID('dbo.room_guest_declaration', 'U') IS NOT NULL DROP TABLE dbo.room_guest_declaration;
IF OBJECT_ID('dbo.booking_packages', 'U') IS NOT NULL DROP TABLE dbo.booking_packages;
IF OBJECT_ID('dbo.room_booking_detail', 'U') IS NOT NULL DROP TABLE dbo.room_booking_detail;
IF OBJECT_ID('dbo.room_booking', 'U') IS NOT NULL DROP TABLE dbo.room_booking;
IF OBJECT_ID('dbo.room', 'U') IS NOT NULL DROP TABLE dbo.room;
IF OBJECT_ID('dbo.room_types', 'U') IS NOT NULL DROP TABLE dbo.room_types;
IF OBJECT_ID('dbo.room_type', 'U') IS NOT NULL DROP TABLE dbo.room_type;
IF OBJECT_ID('dbo.retreat_packages', 'U') IS NOT NULL DROP TABLE dbo.retreat_packages;
IF OBJECT_ID('dbo.retreat_package', 'U') IS NOT NULL DROP TABLE dbo.retreat_package;
IF OBJECT_ID('dbo.work_schedule', 'U') IS NOT NULL DROP TABLE dbo.work_schedule;
IF OBJECT_ID('dbo.refresh_token', 'U') IS NOT NULL DROP TABLE dbo.refresh_token;
IF OBJECT_ID('dbo.otp_tokens', 'U') IS NOT NULL DROP TABLE dbo.otp_tokens;
IF OBJECT_ID('dbo.medical_profile', 'U') IS NOT NULL DROP TABLE dbo.medical_profile;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
IF OBJECT_ID('dbo.system_configurations', 'U') IS NOT NULL DROP TABLE dbo.system_configurations;
GO

-- =========================================================================

IF OBJECT_ID('dbo.medical_profile', 'U') IS NOT NULL DROP TABLE dbo.medical_profile;
IF OBJECT_ID('dbo.package_food_limit', 'U') IS NOT NULL DROP TABLE dbo.package_food_limit;
IF OBJECT_ID('dbo.otp_tokens', 'U') IS NOT NULL DROP TABLE dbo.otp_tokens;

-- 2. CREATE TABLES (PARENTS FIRST)
-- =========================================================================

-- 2.0 System Configurations (ADR-001: Configurable deposit ratio)
CREATE TABLE dbo.system_configurations (
    config_id   INT          IDENTITY(1,1) PRIMARY KEY,
    config_key  VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    updated_at  DATETIME2    NOT NULL DEFAULT GETDATE()
);
GO

-- 2.1 Users
-- Matches User.java entity exactly.
-- id_passport_encrypted: stored as AES-256 encrypted string via AesEncryptor converter.
-- nationality/visa_number/entry_date are nullable extras for Residence Law compliance
-- (ignored by JPA unless added to entity in the future).
CREATE TABLE dbo.users (
    user_id               INT           IDENTITY(1,1) PRIMARY KEY,
    email                 VARCHAR(255)  NOT NULL UNIQUE,
    password_hash         VARCHAR(255)  NOT NULL,
    full_name             NVARCHAR(255) NOT NULL,
    phone                 VARCHAR(20)   NULL,
    id_passport_encrypted VARCHAR(MAX)  NULL,
    nationality           NVARCHAR(100) NULL,
    visa_number           VARCHAR(100)  NULL,
    entry_date            DATETIME2     NULL,
    role                  VARCHAR(50)   NOT NULL DEFAULT 'GUEST',
    status                VARCHAR(50)   NOT NULL DEFAULT 'ACTIVE',
    created_at            DATETIME2     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_users_role   CHECK (role   IN ('ADMIN','STAFF','THERAPIST','GUEST','MANAGER','RECEPTIONIST','CHEF','CUSTOMER')),
    CONSTRAINT CK_users_status CHECK (status IN ('ACTIVE','INACTIVE','BANNED')),
    CONSTRAINT CK_users_email  CHECK (email  LIKE '%_@_%._%'),
    CONSTRAINT CK_users_phone  CHECK (phone IS NULL OR phone LIKE '[0-9]%')
);
GO

-- 2.2 Retreat Packages
-- Matches RetreatPackage.java entity exactly:
--   name (NOT NULL), description, duration_days, price, includes, status, created_at
CREATE TABLE dbo.retreat_packages (
    package_id    INT           IDENTITY(1,1) PRIMARY KEY,
    name          NVARCHAR(255) NOT NULL,
    description   NVARCHAR(MAX) NULL,
    duration_days INT           NOT NULL DEFAULT 1,
    price         DECIMAL(15,2) NULL,
    includes      NVARCHAR(MAX) NULL,
    status        VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME2     NULL DEFAULT GETDATE(),

    CONSTRAINT CK_retreat_packages_duration CHECK (duration_days > 0),
    CONSTRAINT CK_retreat_packages_status   CHECK (status IN ('ACTIVE','INACTIVE')),
    CONSTRAINT CK_retreat_packages_price    CHECK (price IS NULL OR price >= 0)
);
GO

-- 2.3 Room Types
CREATE TABLE dbo.room_types (
    room_type_id INT           IDENTITY(1,1) PRIMARY KEY,
    type_name    NVARCHAR(255) NOT NULL UNIQUE,
    description  NVARCHAR(MAX) NULL,
    base_price   DECIMAL(15,2) NULL,
    capacity     INT           NULL,
    area_sqm     INT           NULL,

    CONSTRAINT CK_room_types_price    CHECK (base_price IS NULL OR base_price >= 0),
    CONSTRAINT CK_room_types_capacity CHECK (capacity   IS NULL OR capacity   > 0)
);
GO

-- 2.4 Room / Villa
-- Added VACANT_NEEDS_CLEANING status for ADR-003 (housekeeper workflow)
CREATE TABLE dbo.room (
    room_id      INT          IDENTITY(1,1) PRIMARY KEY,
    room_type_id INT          NOT NULL REFERENCES dbo.room_types(room_type_id) ON DELETE NO ACTION,
    room_number  VARCHAR(50)  NOT NULL UNIQUE,
    status       VARCHAR(50)  NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT CK_room_status CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE','DIRTY','CLEANING','VACANT_NEEDS_CLEANING'))
);
GO

-- 2.5 Room Booking
-- Added PENDING_DEPOSIT status for Module 2 UC07 deposit workflow
CREATE TABLE dbo.room_booking (
    booking_id    INT           IDENTITY(1,1) PRIMARY KEY,
    user_id       INT           NOT NULL REFERENCES dbo.users(user_id)            ON DELETE NO ACTION,
    package_id    INT           NULL     REFERENCES dbo.retreat_packages(package_id) ON DELETE SET NULL,
    check_in_date  DATETIME2    NOT NULL,
    check_out_date DATETIME2    NOT NULL,
    status         VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    total_deposit  DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at     DATETIME2    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_room_booking_dates   CHECK (check_out_date > check_in_date),
    CONSTRAINT CK_room_booking_status  CHECK (status IN ('PENDING','PENDING_DEPOSIT','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED')),
    CONSTRAINT CK_room_booking_deposit CHECK (total_deposit >= 0)
);
GO

-- 2.5.1 Booking Packages Join Table
CREATE TABLE dbo.booking_packages (
    booking_id INT NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE CASCADE,
    package_id INT NOT NULL REFERENCES dbo.retreat_packages(package_id) ON DELETE CASCADE,
    PRIMARY KEY (booking_id, package_id)
);
GO

-- 2.6 Room Booking Detail
CREATE TABLE dbo.room_booking_detail (
    detail_id        INT           IDENTITY(1,1) PRIMARY KEY,
    booking_id       INT           NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE CASCADE,
    room_id          INT           NOT NULL REFERENCES dbo.room(room_id)            ON DELETE NO ACTION,
    price_at_booking DECIMAL(15,2) NOT NULL,

    CONSTRAINT CK_room_booking_detail_price CHECK (price_at_booking >= 0)
);
GO

CREATE TABLE dbo.spa_services (
    service_id       INT           IDENTITY(1,1) PRIMARY KEY,
    name             NVARCHAR(255) NOT NULL,
    description      NVARCHAR(MAX) NOT NULL,
    category         VARCHAR(80)   NULL,
    price            DECIMAL(15,2) NOT NULL,
    duration_minutes INT           NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    created_at       DATETIME2     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_spa_services_price    CHECK (price            >= 0),
    CONSTRAINT CK_spa_services_duration CHECK (duration_minutes  > 0),
    CONSTRAINT CK_spa_services_status   CHECK (status IN ('ACTIVE','INACTIVE'))
);
GO

-- 2.8 Treatment Room
CREATE TABLE dbo.treatment_room (
    treatment_room_id INT           IDENTITY(1,1) PRIMARY KEY,
    room_name         NVARCHAR(255) NOT NULL UNIQUE,
    status            VARCHAR(50)   NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT CK_treatment_room_status CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE','CLEANING'))
);
GO

-- 2.9 Spa Booking
CREATE TABLE dbo.spa_booking (
    spa_booking_id    INT           IDENTITY(1,1) PRIMARY KEY,
    user_id           INT           NOT NULL REFERENCES dbo.users(user_id)                          ON DELETE NO ACTION,
    room_booking_id   INT           NULL     REFERENCES dbo.room_booking(booking_id)                ON DELETE NO ACTION,
    spa_id            INT           NOT NULL REFERENCES dbo.spa_services(service_id)                ON DELETE NO ACTION,
    therapist_id      INT           NOT NULL REFERENCES dbo.users(user_id)                          ON DELETE NO ACTION,
    treatment_room_id INT           NOT NULL REFERENCES dbo.treatment_room(treatment_room_id)       ON DELETE NO ACTION,
    start_datetime    DATETIME2     NOT NULL,
    end_datetime      DATETIME2     NOT NULL,
    status            VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
    price_at_booking  DECIMAL(15,2) NOT NULL,
    is_package_included BIT         NOT NULL DEFAULT 0,

    CONSTRAINT CK_spa_booking_dates   CHECK (end_datetime > start_datetime),
    CONSTRAINT CK_spa_booking_status  CHECK (status IN ('PENDING','CONFIRMED','COMPLETED','CANCELLED','NOSHOW','NO_SHOW')),
    CONSTRAINT CK_spa_booking_price   CHECK (price_at_booking >= 0),
    CONSTRAINT CK_spa_booking_package CHECK (
        (is_package_included = 0) OR (is_package_included = 1 AND room_booking_id IS NOT NULL)
    )
);
GO


-- 2.10 Food Menu
CREATE TABLE dbo.food_menu (
    food_id INT IDENTITY(1,1) PRIMARY KEY,
    dish_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    dietary_tags NVARCHAR(255) NOT NULL,
    category VARCHAR(255) NULL,
    allergens VARCHAR(255) NULL,
    is_today_menu BIT NOT NULL DEFAULT 1,
    sold_out BIT NOT NULL DEFAULT 0,
    ingredients NVARCHAR(MAX) NULL,
    image_url VARCHAR(255) NULL,
    is_package_included BIT NOT NULL DEFAULT 1,
    periods VARCHAR(255) NULL DEFAULT 'Lunch',
    available_days VARCHAR(255) NULL DEFAULT '0,1,2,3,4,5,6',
    enabled BIT NOT NULL DEFAULT 1,

    CONSTRAINT CK_food_menu_price CHECK (price >= 0)
);
GO


-- 2.11 Food Order
CREATE TABLE dbo.food_order (
    order_id        INT           IDENTITY(1,1) PRIMARY KEY,
    user_id         INT           NOT NULL REFERENCES dbo.users(user_id)           ON DELETE NO ACTION,
    room_booking_id INT           NULL     REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION,
    order_time      DATETIME2     NOT NULL DEFAULT GETDATE(),
    status          VARCHAR(50)   NOT NULL,
    total_amount    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    origin          VARCHAR(50)   NULL,

    CONSTRAINT CK_food_order_status CHECK (status IN ('PENDING','PREPARING','READY','DELIVERED','CANCELLED')),
    CONSTRAINT CK_food_order_amount CHECK (total_amount >= 0)
);
GO

-- 2.12 Food Order Detail
CREATE TABLE dbo.food_order_detail (
    order_detail_id    INT           IDENTITY(1,1) PRIMARY KEY,
    order_id           INT           NOT NULL REFERENCES dbo.food_order(order_id)  ON DELETE CASCADE,
    food_id            INT           NOT NULL REFERENCES dbo.food_menu(food_id)    ON DELETE NO ACTION,
    quantity           INT           NOT NULL DEFAULT 1,
    price_at_order     DECIMAL(15,2) NOT NULL,
    special_note       NVARCHAR(255) NULL,
    is_package_included BIT          NOT NULL DEFAULT 0,

    CONSTRAINT CK_food_order_detail_qty   CHECK (quantity       > 0),
    CONSTRAINT CK_food_order_detail_price CHECK (price_at_order >= 0)
);
GO

-- 2.13 Invoice (Guest Folio Ledger)
CREATE TABLE dbo.invoice (
    invoice_id      INT           IDENTITY(1,1) PRIMARY KEY,
    user_id         INT           NOT NULL REFERENCES dbo.users(user_id)           ON DELETE NO ACTION,
    room_booking_id INT           NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION,
    room_subtotal   DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    spa_subtotal    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    food_subtotal   DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_and_fees    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    final_amount    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    deposit_amount  DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    amount_due      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status          VARCHAR(50)   NOT NULL DEFAULT 'UNPAID',
    vnpay_tran_id   VARCHAR(100)  NULL,
    payment_time    DATETIME2     NULL,

    CONSTRAINT CK_invoice_room       CHECK (room_subtotal  >= 0),
    CONSTRAINT CK_invoice_spa        CHECK (spa_subtotal   >= 0),
    CONSTRAINT CK_invoice_food       CHECK (food_subtotal  >= 0),
    CONSTRAINT CK_invoice_tax        CHECK (tax_and_fees   >= 0),
    CONSTRAINT CK_invoice_final      CHECK (final_amount   >= 0),
    CONSTRAINT CK_invoice_deposit    CHECK (deposit_amount >= 0),
    CONSTRAINT CK_invoice_due        CHECK (amount_due     >= 0),
    CONSTRAINT CK_invoice_dep_limit  CHECK (deposit_amount <= final_amount),
    CONSTRAINT CK_invoice_due_calc   CHECK (amount_due = final_amount - deposit_amount),
    CONSTRAINT CK_invoice_status     CHECK (status IN ('UNPAID','PAID','CANCELLED')),
    CONSTRAINT UQ_invoice_room_booking UNIQUE (room_booking_id)
);
GO

-- 2.14 Payment Transaction Log (Audit Trail)
CREATE TABLE dbo.payment_transaction_log (
    log_id           INT           IDENTITY(1,1) PRIMARY KEY,
    invoice_id       INT           NOT NULL REFERENCES dbo.invoice(invoice_id) ON DELETE NO ACTION,
    payment_method   VARCHAR(50)   NOT NULL,
    amount           DECIMAL(15,2) NOT NULL,
    gateway_ref      VARCHAR(100)  NULL,
    response_code    VARCHAR(10)   NULL,
    status           VARCHAR(20)   NOT NULL,
    transaction_time DATETIME2     NOT NULL DEFAULT GETDATE(),
    client_ip        VARCHAR(45)   NULL,

    CONSTRAINT CK_ptl_method CHECK (payment_method IN ('VNPAY','CASH','STRIPE','PAYPAL')),
    CONSTRAINT CK_ptl_status CHECK (status          IN ('PAID','FAILED','REFUNDED')),
    CONSTRAINT CK_ptl_amount CHECK (amount           >= 0)
);
GO

-- 2.15 Feedback
CREATE TABLE dbo.feedback (
    feedback_id     INT           IDENTITY(1,1) PRIMARY KEY,
    user_id         INT           NOT NULL REFERENCES dbo.users(user_id)           ON DELETE CASCADE,
    room_booking_id INT           NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION,
    rating          INT           NOT NULL,
    comment         NVARCHAR(MAX) NULL,
    is_toxic        BIT           NOT NULL DEFAULT 0,
    created_at      DATETIME2     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_feedback_rating         CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT UQ_feedback_room_booking   UNIQUE (room_booking_id)
);
GO

-- =========================================================================

-- 2.16 Medical Profile
CREATE TABLE dbo.medical_profile (
    profile_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    physical_condition_encrypted NVARCHAR(MAX) NULL,
    food_allergies_encrypted NVARCHAR(MAX) NULL,
    explicit_consent_signed BIT NOT NULL DEFAULT 0,
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_medical_profile_User FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE
);
GO

-- 2.17 Package Food Limit
CREATE TABLE dbo.package_food_limit (
    package_food_id INT IDENTITY(1,1) PRIMARY KEY,
    package_id INT NOT NULL REFERENCES dbo.retreat_packages(package_id) ON DELETE CASCADE,
    food_id INT NOT NULL REFERENCES dbo.food_menu(food_id) ON DELETE CASCADE,
    quantity_per_day INT NOT NULL DEFAULT 1,

    CONSTRAINT CK_package_food_limit_qty CHECK (quantity_per_day > 0)
);
GO

-- 2.18 OTP Tokens
CREATE TABLE dbo.otp_tokens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    is_used BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL
);
GO

-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================
CREATE INDEX IX_room_booking_User            ON dbo.room_booking(user_id);
CREATE INDEX IX_room_booking_Package         ON dbo.room_booking(package_id);
CREATE INDEX IX_room_booking_detail_Booking  ON dbo.room_booking_detail(booking_id);
CREATE INDEX IX_room_booking_detail_Room     ON dbo.room_booking_detail(room_id);
CREATE INDEX IX_room_room_type               ON dbo.room(room_type_id);
CREATE INDEX IX_spa_booking_User             ON dbo.spa_booking(user_id);
CREATE INDEX IX_spa_booking_Dates            ON dbo.spa_booking(start_datetime, end_datetime);
CREATE INDEX IX_spa_booking_Therapist        ON dbo.spa_booking(therapist_id);
CREATE INDEX IX_spa_booking_RoomBooking      ON dbo.spa_booking(room_booking_id);
CREATE INDEX IX_spa_booking_SpaService       ON dbo.spa_booking(spa_id);
CREATE INDEX IX_spa_booking_TreatmentRoom    ON dbo.spa_booking(treatment_room_id);
CREATE INDEX IX_food_order_User              ON dbo.food_order(user_id);
CREATE INDEX IX_food_order_RoomBooking       ON dbo.food_order(room_booking_id);
CREATE INDEX IX_food_order_detail_Order      ON dbo.food_order_detail(order_id);
CREATE INDEX IX_food_order_detail_Food       ON dbo.food_order_detail(food_id);
CREATE INDEX IX_invoice_Booking              ON dbo.invoice(room_booking_id);
CREATE INDEX IX_invoice_User                 ON dbo.invoice(user_id);
CREATE INDEX IX_ptl_invoice                  ON dbo.payment_transaction_log(invoice_id);
CREATE INDEX IX_ptl_gateway_ref              ON dbo.payment_transaction_log(gateway_ref);
CREATE INDEX IX_ptl_transaction_time         ON dbo.payment_transaction_log(transaction_time);
CREATE INDEX IX_feedback_User                ON dbo.feedback(user_id);
GO

-- =========================================================================
-- 4. SEED DATA
-- =========================================================================

-- 4.0 System Config: default deposit ratio 30% (ADR-001)
INSERT INTO dbo.system_configurations (config_key, config_value)
VALUES ('deposit_ratio', '0.30');
GO

-- 4.1 Users (BCrypt of '123456')
INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status)
VALUES
    ('manager@nguson.vn',     '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Quản Lý',      '0901234567', 'U2FsdGVkX194QTA1V2g3SjcrREJpZz09', N'Vietnam', NULL, NULL, 'MANAGER',     'ACTIVE'),
    ('reception@nguson.vn',   '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Lễ Tân',            '0907654321', 'U2FsdGVkX1+2NzVhOGYzNWVlOTc4NmQ0', N'Vietnam', NULL, NULL, 'RECEPTIONIST','ACTIVE'),
    ('therapist1@nguson.vn',  '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Bác Sĩ Hải - Trị Liệu','0912345678', 'U2FsdGVkX19rN0g3YjhkOTM0OGRlM2Qx', N'Vietnam', NULL, NULL, 'THERAPIST',   'ACTIVE'),
    ('chef@nguson.vn',         '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Bếp Trưởng',      '0987654321', 'U2FsdGVkX1+zNTRjMmVkNDhjOGE5MmEx', N'Vietnam', NULL, NULL, 'CHEF',        'ACTIVE'),
    ('guest1@gmail.com',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Khách Hàng',      '0933333333', 'U2FsdGVkX1+1MGZhYjI5ZGNkYThmMDEx', N'Vietnam', NULL, NULL, 'CUSTOMER',    'ACTIVE'),
    ('guest2@gmail.com',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Minh Châu',         '0944444444', 'U2FsdGVkX1/bNzU0MDNkZWEwOGYxZTIz', N'Vietnam', NULL, NULL, 'CUSTOMER',    'ACTIVE'),
    ('guest3@gmail.com',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Hoàng Nam Anh',        '0955555555', NULL,                               N'Vietnam', NULL, NULL, 'CUSTOMER',    'ACTIVE'),
    ('admin@nguson.com',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Admin He Thong',       '0999999999', NULL,                               N'Vietnam', NULL, NULL, 'ADMIN',       'ACTIVE'),
    ('staff@nguson.com',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Staff Ngu Son',        '0988888888', NULL,                               N'Vietnam', NULL, NULL, 'STAFF',       'ACTIVE');
GO

-- 4.2 Retreat Packages
INSERT INTO dbo.retreat_packages (name, description, duration_days, price, includes, status)
VALUES
    (N'5-day Detox Journey',       N'Gói giải độc cơ thể toàn diện 5 ngày 4 đêm, bao gồm ẩm thực dưỡng sinh riêng biệt và 3 buổi trị liệu chuyên sâu.', 5, 12500000.00, N'Tắm Ngâm Lá Thảo Dược Dao Đỏ;Massage Trị Liệu Đá Núi Lửa;Liệu Trình Trẻ Hóa Da Tự Nhiên', 'ACTIVE'),
    (N'Mindfulness & Yoga Weekend', N'Gói thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm, hỗ trợ giảm stress và tái tạo năng lượng.',             3,  7800000.00, N'Tắm Ngâm Lá Thảo Dược Dao Đỏ;Massage Trị Liệu Đá Núi Lửa;Liệu Trình Trẻ Hóa Da Tự Nhiên',   'ACTIVE');
GO

-- 4.3 Room Types
INSERT INTO dbo.room_types (type_name, base_price, capacity)
VALUES
    (N'Standard Room 1 King Bed',      1200000.00,  2),
    (N'Vip Villa 1-Bedroom Pool',       1800000.00,  2),
    (N'Presidential Suite 2-Bedroom',  2500000.00, 4);
GO

-- 4.4 Rooms
-- Type 1: Standard Room 1 King Bed (5 rooms)
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(1, 'Room-101', 'AVAILABLE'),
(1, 'Room-102', 'AVAILABLE'),
(1, 'Room-103', 'AVAILABLE'),
(1, 'Room-104', 'AVAILABLE'),
(1, 'Room-105', 'AVAILABLE');

-- Type 2: Vip Villa 1-Bedroom Pool (5 rooms)
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(2, 'Villa-101', 'AVAILABLE'),
(2, 'Villa-102', 'AVAILABLE'),
(2, 'Villa-103', 'AVAILABLE'),
(2, 'Villa-104', 'AVAILABLE'),
(2, 'Villa-105', 'AVAILABLE');

-- Type 3: Presidential Suite 2-Bedroom (7 rooms)
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(3, 'President-501', 'AVAILABLE'),
(3, 'President-502', 'AVAILABLE'),
(3, 'President-503', 'AVAILABLE'),
(3, 'President-504', 'AVAILABLE'),
(3, 'President-505', 'AVAILABLE'),
(3, 'President-506', 'AVAILABLE'),
(3, 'President-507', 'AVAILABLE');
GO

-- 4.5 Room Bookings
INSERT INTO dbo.room_booking (user_id, package_id, check_in_date, check_out_date, status, total_deposit)
VALUES
    (5, 1,    DATEADD(day, 1, GETDATE()), DATEADD(day, 6, GETDATE()), 'CONFIRMED', 3750000.00),
    (6, NULL, DATEADD(day, 2, GETDATE()), DATEADD(day, 4, GETDATE()), 'CONFIRMED', 2700000.00);
GO

-- 4.6 Booking Details
INSERT INTO dbo.room_booking_detail (booking_id, room_id, price_at_booking)
VALUES
    (1, (SELECT room_id FROM dbo.room WHERE room_number = 'Villa-101'), 1800000.00),
    (2, (SELECT room_id FROM dbo.room WHERE room_number = 'Villa-102'), 1800000.00);
GO

-- 4.7 Spa Services
INSERT INTO dbo.spa_services (name, description, price, duration_minutes, status)
VALUES
    (N'Hot Volcanic Stone Massage', N'Massage trị liệu toàn thân bằng đá núi lửa nóng giúp giảm đau mỏi cơ xương khớp.', 1200000.00, 90, 'ACTIVE'),
    (N'Dao Red Leaf Herbal Bath',   N'Tắm lá thuốc người Dao Đỏ hỗ trợ lưu thông khí huyết và thư giãn ngủ ngon.',       600000.00,  45, 'ACTIVE'),
    (N'Spinal Adjustment Therapy',  N'Liệu trình nắn chỉnh và kéo giãn cột sống thắt lưng chống đau mỏi thoái hóa.',    1500000.00, 60, 'ACTIVE');
GO

-- 4.8 Treatment Rooms
INSERT INTO dbo.treatment_room (room_name, status)
VALUES
    (N'Therapy Room A',    'AVAILABLE'),
    (N'Therapy Room B',    'AVAILABLE'),
    (N'Red Dao Bath Room 1','AVAILABLE');
GO

-- 4.9 Spa Bookings
INSERT INTO dbo.spa_booking (user_id, room_booking_id, spa_id, therapist_id, treatment_room_id, start_datetime, end_datetime, status, price_at_booking, is_package_included)
VALUES
    (5, 1, 1, 3, 1, DATEADD(hour, 14, DATEADD(day, 2, GETDATE())), DATEADD(minute, 990, DATEADD(day, 2, GETDATE())), 'CONFIRMED', 1200000.00, 1),
    (6, 2, 3, 3, 2, DATEADD(hour, 10, DATEADD(day, 3, GETDATE())), DATEADD(hour,   11, DATEADD(day, 3, GETDATE())), 'CONFIRMED', 1500000.00, 0);
GO

-- 4.10 Food Menu
INSERT INTO dbo.food_menu (dish_name, description, price, dietary_tags, available_days, image_url, is_package_included, periods)
VALUES
    (N'Cháo Yến Mạch Hạt Chia', N'Cháo yến mạch nguyên cám nấu cùng hạt chia, hạt óc chó và dâu tây tươi.', 120000.00, 'Vegan, Healthy', '1,3,5', '/images/dishes/dish_chao_yen_mach.png', 1, 'Breakfast'),
    (N'Bún Gạo Lứt Chay', N'Bún nưa ăn kèm đậu hũ non, nấm đùi gà và nước dùng ngọt thanh từ củ quả.', 150000.00, 'Vegan, Healthy', '0,2,4,6', '/images/dishes/dish_bun_gao_lut.png', 1, 'Breakfast'),
    (N'Bánh Mì Nguyên Cám Trứng Chần', N'Bánh mì đen nguyên cám nướng giòn kèm bơ sáp và trứng chần.', 140000.00, 'Healthy, Vegetarian', '0,1,2,3,4,5,6', '/images/dishes/dish_banh_mi_trung.png', 1, 'Breakfast'),
    (N'Phở Gạo Lứt Bò Thảo Mộc', N'Phở nấu từ gạo lứt nảy mầm, nước dùng hầm xương bò thảo mộc trong 12h.', 250000.00, 'Healthy, Meat', '0,1,2,3,4,5,6', '/images/dishes/dish_pho_bo.png', 0, 'Breakfast'),
    (N'Nước Ép Green Detox', N'Nước ép giải độc gan từ cần tây hữu cơ, táo xanh, cải xoăn và gừng.', 95000.00, 'Vegan, Detox', '0,2,4,6', '/images/dishes/dish_green_detox.png', 1, 'Breakfast,Lunch'),
    (N'Trà Thảo Mộc Hoa Cúc', N'Trà hoa cúc ủ lạnh thanh nhiệt, giúp an thần và dễ tiêu hóa.', 85000.00, 'Vegan, Detox', '1,3,5', '/images/dishes/dish_tra_hoa_cuc.png', 1, 'Breakfast,Lunch'),
    (N'Organic Avocado Quinoa Salad', N'Salad diêm mạch hữu cơ với bơ sáp cắt lát, hạt bí ngô và sốt chanh mật ong.', 180000.00, 'Vegan, Gluten-Free', '1,3,5', '/images/dishes/dish_quinoa_salad.png', 1, 'Lunch'),
    (N'Mì Soba Lạnh Nhật Bản', N'Mì kiều mạch Nhật Bản thanh mát, ăn kèm rong biển và nước tương dashi nấm.', 210000.00, 'Vegan, Healthy', '0,2,4,6', '/images/dishes/dish_mi_soba.png', 1, 'Lunch'),
    (N'Cơm Gạo Lứt Ngũ Sắc', N'Cơm gạo lứt dẻo nấu cùng đậu gà, bắp, đậu hà lan và hạt sen.', 160000.00, 'Vegan, Healthy', '0,1,2,3,4,5,6', '/images/dishes/dish_com_gao_lut.png', 1, 'Lunch,Dinner'),
    (N'Cá Hồi Áp Chảo Măng Tây', N'Cá hồi Na Uy áp chảo sốt bơ chanh ăn kèm măng tây nướng.', 450000.00, 'Seafood, Keto', '1,3,5', '/images/dishes/dish_ca_hoi.png', 1, 'Dinner'),
    (N'Ginseng Chicken Soup', N'Canh gà hầm sâm và táo đỏ bổ trung ích khí, hỗ trợ phục hồi sức khỏe.', 320000.00, 'Keto, Healthy', '0,2,4,6', '/images/dishes/dish_chicken_soup.png', 1, 'Dinner'),
    (N'Súp Bí Đỏ Hạnh Nhân', N'Súp bí đỏ sánh mịn nấu cùng sữa hạnh nhân hữu cơ và dầu olive.', 150000.00, 'Vegan, Gluten-Free', '0,1,2,3,4,5,6', '/images/dishes/dish_sup_bi_do.png', 1, 'Dinner'),
    (N'Steak Bò Wagyu', N'Thăn nội bò Wagyu nướng than hoa mềm tan, ăn kèm rau củ nướng.', 1250000.00, 'Meat, Keto', '0,1,2,3,4,5,6', '/images/dishes/dish_steak_wagyu.png', 0, 'Dinner'),
    (N'Tôm Sú Rim Tỏi Ớt', N'Tôm sú biển tươi ngon rim tỏi ớt thơm lừng cay cay ngọt ngọt.', 390000.00, 'Seafood, Spicy', '0,1,2,3,4,5,6', '/images/dishes/dish_tom_su.png', 0, 'Lunch,Dinner');
GO

-- 4.11 Food Orders
INSERT INTO dbo.food_order (user_id, room_booking_id, order_time, status, total_amount)
VALUES
    (5, 1, DATEADD(hour, 18, DATEADD(day, 1, GETDATE())), 'DELIVERED', 595000.00),
    (6, 2, DATEADD(hour,  8, DATEADD(day, 2, GETDATE())), 'DELIVERED', 415000.00);
GO

-- 4.12 Food Order Details
INSERT INTO dbo.food_order_detail (order_id, food_id, quantity, price_at_order, special_note, is_package_included)
VALUES
    (1, 1, 1, 180000.00, N'Dị ứng đậu phộng, không bỏ các loại hạt đậu khác', 1),
    (1, 2, 1, 320000.00, NULL, 0),
    (1, 3, 1,  95000.00, NULL, 1),
    (2, 2, 1, 320000.00, N'Không bỏ bột ngọt', 0),
    (2, 3, 1,  95000.00, NULL, 0);
GO

-- 4.13 Invoice - Booking 1
INSERT INTO dbo.invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status, vnpay_tran_id, payment_time)
VALUES (5, 1, 12500000.00, 0.00, 320000.00, 1282000.00, 14102000.00, 3750000.00, 10352000.00, 'UNPAID', NULL, NULL);
GO

-- 4.14 Invoice - Booking 2
INSERT INTO dbo.invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status, vnpay_tran_id, payment_time)
VALUES (6, 2, 9000000.00, 1500000.00, 415000.00, 1091500.00, 12006500.00, 2700000.00, 9306500.00, 'UNPAID', NULL, NULL);
GO

-- 4.15 Payment Transaction Log (deposit audit trail)
INSERT INTO dbo.payment_transaction_log (invoice_id, payment_method, amount, gateway_ref, response_code, status, transaction_time, client_ip)
VALUES (1, 'VNPAY', 3750000.00, 'VNP-DEPOSIT-001', '00', 'PAID', DATEADD(day, -7, GETDATE()), '127.0.0.1');
GO

-- 4.16 Feedback
INSERT INTO dbo.feedback (user_id, room_booking_id, rating, comment, is_toxic)
VALUES (5, 1, 5, N'Dịch vụ nghỉ dưỡng trị liệu tuyệt vời! Đội ngũ nhân viên y tế chu đáo, thực đơn sạch sẽ và chuyên sâu.', 0);
GO


USE ResortSpaDB;
GO

-- 1. Alter retreat_packages table
-- Drop constraints on price/name if they prevent altering columns
IF EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.retreat_packages') AND name = 'name')
BEGIN
    ALTER TABLE dbo.retreat_packages ALTER COLUMN name NVARCHAR(255) NULL;
END
GO

IF EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.retreat_packages') AND name = 'price')
BEGIN
    ALTER TABLE dbo.retreat_packages ALTER COLUMN price DECIMAL(15,2) NULL;
END
GO

-- Add package_name if not exists
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.retreat_packages') AND name = 'package_name')
BEGIN
    ALTER TABLE dbo.retreat_packages ADD package_name NVARCHAR(255) NULL;
END
GO

-- Add base_price if not exists
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.retreat_packages') AND name = 'base_price')
BEGIN
    ALTER TABLE dbo.retreat_packages ADD base_price DECIMAL(15,2) NULL;
END
GO

-- Add duration_text if not exists
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.retreat_packages') AND name = 'duration_text')
BEGIN
    ALTER TABLE dbo.retreat_packages ADD duration_text NVARCHAR(255) NULL;
END
GO

-- Add goal if not exists
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.retreat_packages') AND name = 'goal')
BEGIN
    ALTER TABLE dbo.retreat_packages ADD goal NVARCHAR(255) NULL;
END
GO

-- Add image_url if not exists
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.retreat_packages') AND name = 'image_url')
BEGIN
    ALTER TABLE dbo.retreat_packages ADD image_url NVARCHAR(255) NULL;
END
GO

-- 2. Populate values from name & price or vice versa
UPDATE dbo.retreat_packages
SET package_name = COALESCE(package_name, name),
    base_price = COALESCE(base_price, price, 0.00);
GO

UPDATE dbo.retreat_packages
SET name = COALESCE(name, package_name),
    price = COALESCE(price, base_price, 0.00);
GO

-- Alter columns to be NOT NULL
ALTER TABLE dbo.retreat_packages ALTER COLUMN package_name NVARCHAR(255) NOT NULL;
ALTER TABLE dbo.retreat_packages ALTER COLUMN base_price DECIMAL(15,2) NOT NULL;
GO

-- 3. Create package_highlights and package_features tables
IF OBJECT_ID('dbo.package_highlights', 'U') IS NOT NULL DROP TABLE dbo.package_highlights;
CREATE TABLE dbo.package_highlights (
    package_id INT NOT NULL REFERENCES dbo.retreat_packages(package_id) ON DELETE CASCADE,
    highlight NVARCHAR(255) NOT NULL
);
GO

IF OBJECT_ID('dbo.package_features', 'U') IS NOT NULL DROP TABLE dbo.package_features;
CREATE TABLE dbo.package_features (
    package_id INT NOT NULL REFERENCES dbo.retreat_packages(package_id) ON DELETE CASCADE,
    feature NVARCHAR(255) NOT NULL
);
GO

-- 4. Seed/Update the 5 packages
-- Update package 1
UPDATE dbo.retreat_packages
SET name = N'5-day Detox Journey',
    package_name = N'5-day Detox Journey',
    description = N'Gói giải độc cơ thể toàn diện 5 ngày 4 đêm, bao gồm ẩm thực dưỡng sinh riêng biệt và 3 buổi trị liệu chuyên sâu.',
    price = 12500000.00,
    base_price = 12500000.00,
    duration_days = 5,
    duration_text = N'5 ngày 4 đêm',
    goal = N'Thải độc (Detox)',
    image_url = '/service_spa.png',
    status = 'ACTIVE'
WHERE package_id = 1;

-- Update package 2
UPDATE dbo.retreat_packages
SET name = N'Mindfulness & Yoga Weekend',
    package_name = N'Mindfulness & Yoga Weekend',
    description = N'Gói thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm, hỗ trợ giảm stress và tái tạo năng lượng.',
    price = 7800000.00,
    base_price = 7800000.00,
    duration_days = 3,
    duration_text = N'3 ngày 2 đêm',
    goal = N'Yoga & Thiền',
    image_url = '/service_yoga.png',
    status = 'ACTIVE'
WHERE package_id = 2;

-- Insert package 3
SET IDENTITY_INSERT dbo.retreat_packages ON;
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 3)
BEGIN
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, price, base_price, duration_days, duration_text, goal, image_url, status)
    VALUES (3, N'Weight Loss & Slimming Journey', N'Weight Loss & Slimming Journey', N'Liệu trình giảm cân & thon gọn dáng vóc 7 ngày 6 đêm với chế độ ăn uống khoa học kết hợp bài tập đốt mỡ.', 18200000.00, 18200000.00, 7, N'7 ngày 6 đêm', N'Thải độc (Detox)', '/service_dining.png', 'ACTIVE');
END
ELSE
BEGIN
    UPDATE dbo.retreat_packages
    SET name = N'Weight Loss & Slimming Journey',
        package_name = N'Weight Loss & Slimming Journey',
        description = N'Liệu trình giảm cân & thon gọn dáng vóc 7 ngày 6 đêm với chế độ ăn uống khoa học kết hợp bài tập đốt mỡ.',
        price = 18200000.00,
        base_price = 18200000.00,
        duration_days = 7,
        duration_text = N'7 ngày 6 đêm',
        goal = N'Thải độc (Detox)',
        image_url = '/service_dining.png',
        status = 'ACTIVE'
    WHERE package_id = 3;
END

-- Insert package 4
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 4)
BEGIN
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, price, base_price, duration_days, duration_text, goal, image_url, status)
    VALUES (4, N'Deep Stress Relief & Forest Bathing', N'Deep Stress Relief & Forest Bathing', N'Trải nghiệm giảm căng thẳng và kết nối thiên nhiên sâu qua hoạt động tắm rừng kết hợp trị liệu âm thanh.', 6500000.00, 6500000.00, 2, N'2 ngày 1 đêm', N'Giảm căng thẳng (Stress Relief)', '/service_therapy.png', 'ACTIVE');
END
ELSE
BEGIN
    UPDATE dbo.retreat_packages
    SET name = N'Deep Stress Relief & Forest Bathing',
        package_name = N'Deep Stress Relief & Forest Bathing',
        description = N'Trải nghiệm giảm căng thẳng và kết nối thiên nhiên sâu qua hoạt động tắm rừng kết hợp trị liệu âm thanh.',
        price = 6500000.00,
        base_price = 6500000.00,
        duration_days = 2,
        duration_text = N'2 ngày 1 đêm',
        goal = N'Giảm căng thẳng (Stress Relief)',
        image_url = '/service_therapy.png',
        status = 'ACTIVE'
    WHERE package_id = 4;
END

-- Insert package 5
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 5)
BEGIN
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, price, base_price, duration_days, duration_text, goal, image_url, status)
    VALUES (5, N'Spine Recovery & Physical Therapy', N'Spine Recovery & Physical Therapy', N'Gói trị liệu phục hồi cột sống chuyên sâu 4 ngày 3 đêm, chẩn đoán bởi bác sĩ chuyên khoa xương khớp.', 14500000.00, 14500000.00, 4, N'4 ngày 3 đêm', N'Chữa lành & Trị liệu', '/service_therapy.png', 'ACTIVE');
END
ELSE
BEGIN
    UPDATE dbo.retreat_packages
    SET name = N'Spine Recovery & Physical Therapy',
        package_name = N'Spine Recovery & Physical Therapy',
        description = N'Gói trị liệu phục hồi cột sống chuyên sâu 4 ngày 3 đêm, chẩn đoán bởi bác sĩ chuyên khoa xương khớp.',
        price = 14500000.00,
        base_price = 14500000.00,
        duration_days = 4,
        duration_text = N'4 ngày 3 đêm',
        goal = N'Chữa lành & Trị liệu',
        image_url = '/service_therapy.png',
        status = 'ACTIVE'
    WHERE package_id = 5;
END
SET IDENTITY_INSERT dbo.retreat_packages OFF;
GO

-- 5. Seed highlights
INSERT INTO dbo.package_highlights (package_id, highlight) VALUES
(1, N'Phác đồ thải độc riêng biệt'),
(1, N'Ẩm thực dưỡng sinh cá nhân hóa'),
(1, N'3 buổi trị liệu chuyên sâu'),
(1, N'Tắm lá thuốc người Dao Đỏ'),
(2, N'Thiền định đón bình minh'),
(2, N'Lớp học Yoga riêng biệt'),
(2, N'Tắm khoáng nóng trị liệu'),
(2, N'Trà thảo mộc an thần'),
(3, N'Thực đơn Keto/Vegan cá nhân hóa'),
(3, N'5 buổi tập luyện với PT 1-1'),
(3, N'3 buổi massage thải độc cơ học'),
(3, N'Kiểm tra chỉ số cơ thể InBody'),
(4, N'Tắm rừng phục hồi (Shinrin-yoku)'),
(4, N'Trị liệu bằng chuông xoay Tây Tạng'),
(4, N'Massage đá muối Himalaya'),
(4, N'Xông hơi thảo dược tươi'),
(5, N'Khám trực tiếp cùng Bác sĩ CKI Hải'),
(5, N'3 buổi nắn chỉnh cột sống thắt lưng'),
(5, N'2 buổi kéo giãn vật lý trị liệu'),
(5, N'Tắm ngâm thảo dược cổ truyền Dao Đỏ');
GO

-- 6. Seed features
INSERT INTO dbo.package_features (package_id, feature) VALUES
(1, N'Bác sĩ chuyên khoa thăm khám đầu vào'),
(1, N'Ăn sáng thực dưỡng hữu cơ hàng ngày'),
(1, N'Nước kiềm giàu hydro miễn phí'),
(1, N'Lớp học thiền & yoga miễn phí hàng ngày'),
(2, N'Được hướng dẫn bởi Master Yoga'),
(2, N'02 buổi Massage đá nóng 90 phút'),
(2, N'Thực đơn chay thực dưỡng organic'),
(2, N'Phòng nghỉ hướng núi yên tĩnh'),
(3, N'Đo chỉ số và lên thực đơn riêng biệt'),
(3, N'Các buổi workshop dinh dưỡng lành mạnh'),
(3, N'Nước ép rau củ detox mỗi ngày'),
(3, N'Bồn tắm ngâm khoáng nóng riêng biệt'),
(4, N'Chuyên gia hướng dẫn tắm rừng kết nối'),
(4, N'Phòng xông hơi đá muối thảo dược'),
(4, N'Bữa tối BBQ thực dưỡng ngoài trời'),
(4, N'Trà thảo mộc hữu cơ giấc ngủ sâu'),
(5, N'Chẩn đoán hình ảnh cột sống chi tiết'),
(5, N'Phác đồ tập luyện phục hồi riêng biệt'),
(5, N'Nước uống kiềm giải độc'),
(5, N'Súp sâm yến mạch thực dưỡng mỗi tối');
GO
