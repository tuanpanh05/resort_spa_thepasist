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
IF OBJECT_ID('dbo.accompanying_guest', 'U') IS NOT NULL DROP TABLE dbo.accompanying_guest;
IF OBJECT_ID('dbo.package_highlights', 'U') IS NOT NULL DROP TABLE dbo.package_highlights;
IF OBJECT_ID('dbo.package_features', 'U') IS NOT NULL DROP TABLE dbo.package_features;
IF OBJECT_ID('dbo.feedback', 'U') IS NOT NULL DROP TABLE dbo.feedback;
IF OBJECT_ID('dbo.complaints', 'U') IS NOT NULL DROP TABLE dbo.complaints;
IF OBJECT_ID('dbo.blog', 'U') IS NOT NULL DROP TABLE dbo.blog;
IF OBJECT_ID('dbo.payment_transaction_log', 'U') IS NOT NULL DROP TABLE dbo.payment_transaction_log;
IF OBJECT_ID('dbo.invoice', 'U') IS NOT NULL DROP TABLE dbo.invoice;
IF OBJECT_ID('dbo.food_order_detail', 'U') IS NOT NULL DROP TABLE dbo.food_order_detail;
IF OBJECT_ID('dbo.food_order', 'U') IS NOT NULL DROP TABLE dbo.food_order;
IF OBJECT_ID('dbo.restaurant_table', 'U') IS NOT NULL DROP TABLE dbo.restaurant_table;
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
    specialty             VARCHAR(20)   NULL,
    google_calendar_sync_enabled BIT           NOT NULL DEFAULT 0,
    google_calendar_id           VARCHAR(255)  NULL,
    calendar_reminders_enabled   BIT           NOT NULL DEFAULT 1,
    reminder_lead_time_mins      INT           NOT NULL DEFAULT 30,
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

    CONSTRAINT CK_room_status CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE','DIRTY','CLEANING','VACANT_NEEDS_CLEANING','VIEWING'))
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
    special_requests NVARCHAR(MAX) NULL,

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

-- 2.6.1 Accompanying Guest
CREATE TABLE dbo.accompanying_guest (
    guest_id          INT           IDENTITY(1,1) PRIMARY KEY,
    booking_id        INT           NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE CASCADE,
    full_name         NVARCHAR(100) NOT NULL,
    identity_document VARCHAR(255)  NULL,
    relationship      NVARCHAR(50)  NULL,
    is_child          BIT           NOT NULL DEFAULT 0,
    created_at        DATETIME2     NOT NULL DEFAULT GETDATE()
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
    category          VARCHAR(20)   NULL,

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
    google_calendar_event_id VARCHAR(255) NULL,

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


-- 2.10.1 Restaurant Table
CREATE TABLE dbo.restaurant_table (
    table_id INT IDENTITY(1,1) PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'
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
    table_id        INT           NULL     REFERENCES dbo.restaurant_table(table_id) ON DELETE NO ACTION,

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

-- 2.15.1 Complaints / Support requests
CREATE TABLE dbo.complaints (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    user_id     INT           NULL REFERENCES dbo.users(user_id) ON DELETE SET NULL,
    guest_name  NVARCHAR(255) NOT NULL,
    room_number VARCHAR(50)   NOT NULL,
    content     NVARCHAR(MAX) NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'Open',
    created_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
    feedback    NVARCHAR(MAX) NULL
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

-- 4.1b Module 3: Assign discipline specialty + add Yoga & Physio specialists (BCrypt of '123456')
UPDATE dbo.users SET specialty = 'SPA' WHERE email = 'therapist1@nguson.vn';
INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
VALUES
    ('yoga1@nguson.vn',   '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Cô Lan - HLV Yoga & Thiền',   '0912345111', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'YOGA'),
    ('physio1@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'KTV Minh - Vật Lý Trị Liệu',  '0912345222', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'PHYSIO');
GO

-- 4.1c Mo rong nhan su Resort (large-scale wellness resort)
INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
VALUES
    ('spa2@nguson.vn',        '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Hoàng Thị Hoa - Massage Thư Giãn',        '0912347001', NULL, N'Vietnam', NULL, NULL, 'THERAPIST',    'ACTIVE', 'SPA'),
    ('spa3@nguson.vn',        '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Văn Dũng - Massage Đá Nóng',          '0912347002', NULL, N'Vietnam', NULL, NULL, 'THERAPIST',    'ACTIVE', 'SPA'),
    ('spa4@nguson.vn',        '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Thị Mai - Chăm Sóc Da Mặt',             '0912347003', NULL, N'Vietnam', NULL, NULL, 'THERAPIST',    'ACTIVE', 'SPA'),
    ('spa5@nguson.vn',        '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Thị Trang - Liệu Pháp Hương Thảo', '0912347004', NULL, N'Vietnam', NULL, NULL, 'THERAPIST',    'ACTIVE', 'SPA'),
    ('yoga2@nguson.vn',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Quang Minh - HLV Yoga Vinyasa',       '0912347005', NULL, N'Vietnam', NULL, NULL, 'THERAPIST',    'ACTIVE', 'YOGA'),
    ('yoga3@nguson.vn',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Đặng Thị Thu - Yoga Nidra & Thiền Định',   '0912347006', NULL, N'Vietnam', NULL, NULL, 'THERAPIST',    'ACTIVE', 'YOGA'),
    ('physio2@nguson.vn',     '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'BS Vũ Thị Lan - VLTL Cột Sống',            '0912347007', NULL, N'Vietnam', NULL, NULL, 'THERAPIST',    'ACTIVE', 'PHYSIO'),
    ('physio3@nguson.vn',     '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'KTV Bùi Mạnh Hùng - Phục Hồi Chức Năng',  '0912347008', NULL, N'Vietnam', NULL, NULL, 'THERAPIST',    'ACTIVE', 'PHYSIO'),
    ('reception2@nguson.vn',  '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Anh Khoa - Lễ Tân Ca Sáng',             '0912347009', NULL, N'Vietnam', NULL, NULL, 'RECEPTIONIST', 'ACTIVE', NULL),
    ('reception3@nguson.vn',  '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Thùy Linh - Lễ Tân Ca Chiều',      '0912347010', NULL, N'Vietnam', NULL, NULL, 'RECEPTIONIST', 'ACTIVE', NULL),
    ('reception4@nguson.vn',  '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Minh Tuấn - Lễ Tân Ca Tối',          '0912347011', NULL, N'Vietnam', NULL, NULL, 'RECEPTIONIST', 'ACTIVE', NULL),
    ('chef2@nguson.vn',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Bếp Phó Đỗ Thành - Ẩm Thực Dưỡng Sinh',   '0912347012', NULL, N'Vietnam', NULL, NULL, 'CHEF',         'ACTIVE', NULL),
    ('chef3@nguson.vn',       '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Đầu Bếp Ngô Thị Hương - Healthy Cuisine',  '0912347013', NULL, N'Vietnam', NULL, NULL, 'CHEF',         'ACTIVE', NULL),
    ('staff2@nguson.vn',      '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Hoài Nam - Phục Vụ Villa',          '0912347014', NULL, N'Vietnam', NULL, NULL, 'STAFF',        'ACTIVE', NULL),
    ('staff3@nguson.vn',      '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Thị Thái - Buồng Phòng & Vệ Sinh',   '0912347015', NULL, N'Vietnam', NULL, NULL, 'STAFF',        'ACTIVE', NULL),
    ('staff4@nguson.vn',      '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Văn Quân - Bảo Vệ & An Ninh',          '0912347016', NULL, N'Vietnam', NULL, NULL, 'STAFF',        'ACTIVE', NULL),
    ('staff5@nguson.vn',      '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Hoàng Văn Đức - Kỹ Thuật & Bảo Trì',      '0912347017', NULL, N'Vietnam', NULL, NULL, 'STAFF',        'ACTIVE', NULL),
    ('staff6@nguson.vn',      '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Thị Yến - Phục Vụ Khu Spa',          '0912347018', NULL, N'Vietnam', NULL, NULL, 'STAFF',        'ACTIVE', NULL),
    ('manager2@nguson.vn',    '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Thị Vân - Phó Giám Đốc Vận Hành',    '0912347019', NULL, N'Vietnam', NULL, NULL, 'MANAGER',      'ACTIVE', NULL);
GO

-- 4.2 Retreat Packages
INSERT INTO dbo.retreat_packages (name, description, duration_days, price, includes, status)
VALUES
    (N'5-day Detox Journey',       N'Gói giải độc cơ thể toàn diện 5 ngày 4 đêm, bao gồm ẩm thực dưỡng sinh riêng biệt và 3 buổi trị liệu chuyên sâu.', 5, 12500000.00, N'Tắm Ngâm Lá Thảo Dược Dao Đỏ;Massage Trị Liệu Đá Núi Lửa;Liệu Trình Trẻ Hóa Da Tự Nhiên', 'ACTIVE'),
    (N'Mindfulness & Yoga Weekend', N'Gói thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm, hỗ trợ giảm stress và tái tạo năng lượng.',             3,  7800000.00, N'Tắm Ngâm Lá Thảo Dược Dao Đỏ;Massage Trị Liệu Đá Núi Lửa;Liệu Trình Trẻ Hóa Da Tự Nhiên',   'ACTIVE');
GO

-- 4.3 Room Types
INSERT INTO dbo.room_types (type_name, base_price, capacity, area_sqm)
VALUES
    (N'Bungalow Gỗ Hướng Suối',     3200000.00, 2, 65),
    (N'Bungalow Đá Cuội Bên Rừng',   3800000.00, 3, 75),
    (N'Biệt Thự Đồi Trà Thiền Định',  5800000.00, 4, 120),
    (N'Biệt Thự Gia Đình Sen Trắng', 7500000.00, 8, 180),
    (N'Nhà Sàn Cộng Đồng Đông Sơn',  9000000.00, 25, 250);
GO

-- Type 1: Bungalow Gỗ Hướng Suối (10 rooms)
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(1, '#S101', 'AVAILABLE'),
(1, '#S102', 'AVAILABLE'),
(1, '#S103', 'AVAILABLE'),
(1, '#S104', 'AVAILABLE'),
(1, '#S105', 'AVAILABLE'),
(1, '#S106', 'AVAILABLE'),
(1, '#S107', 'AVAILABLE'),
(1, '#S108', 'AVAILABLE'),
(1, '#S109', 'AVAILABLE'),
(1, '#S110', 'AVAILABLE');

-- Type 2: Bungalow Đá Cuội Bên Rừng (10 rooms)
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(2, '#V101', 'AVAILABLE'),
(2, '#V102', 'AVAILABLE'),
(2, '#V103', 'AVAILABLE'),
(2, '#V104', 'AVAILABLE'),
(2, '#V105', 'AVAILABLE'),
(2, '#V106', 'AVAILABLE'),
(2, '#V107', 'AVAILABLE'),
(2, '#V108', 'AVAILABLE'),
(2, '#V109', 'AVAILABLE'),
(2, '#V110', 'AVAILABLE');

-- Type 3: Biệt Thự Đồi Trà Thiền Định (10 rooms)
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(3, '#P101', 'AVAILABLE'),
(3, '#P102', 'AVAILABLE'),
(3, '#P103', 'AVAILABLE'),
(3, '#P104', 'AVAILABLE'),
(3, '#P105', 'AVAILABLE'),
(3, '#P106', 'AVAILABLE'),
(3, '#P107', 'AVAILABLE'),
(3, '#P108', 'AVAILABLE'),
(3, '#P109', 'AVAILABLE'),
(3, '#P110', 'AVAILABLE');

-- Type 4: Biệt Thự Gia Đình Sen Trắng (5 rooms)
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(4, '#F101', 'AVAILABLE'),
(4, '#F102', 'AVAILABLE'),
(4, '#F103', 'AVAILABLE'),
(4, '#F104', 'AVAILABLE'),
(4, '#F105', 'AVAILABLE');

-- Type 5: Nhà Sàn Cộng Đồng Đông Sơn (5 rooms)
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(5, '#NS101', 'AVAILABLE'),
(5, '#NS102', 'AVAILABLE'),
(5, '#NS103', 'AVAILABLE'),
(5, '#NS104', 'AVAILABLE'),
(5, '#NS105', 'AVAILABLE');
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
    (1, (SELECT room_id FROM dbo.room WHERE room_number = '#S101'), 3200000.00),
    (2, (SELECT room_id FROM dbo.room WHERE room_number = '#S102'), 3200000.00);
GO

-- 4.7 Spa Services
INSERT INTO dbo.spa_services (name, description, category, price, duration_minutes, status)
VALUES
    (N'Hot Volcanic Stone Massage', N'Massage trị liệu toàn thân bằng đá núi lửa nóng giúp giảm đau mỏi cơ xương khớp.', 'SPA',     1200000.00, 90, 'ACTIVE'),
    (N'Dao Red Leaf Herbal Bath',   N'Tắm lá thuốc người Dao Đỏ hỗ trợ lưu thông khí huyết và thư giãn ngủ ngon.',       'SPA',      600000.00,  45, 'ACTIVE'),
    (N'Spinal Adjustment Therapy',  N'Liệu trình nắn chỉnh và kéo giãn cột sống thắt lưng chống đau mỏi thoái hóa.',    'THERAPY', 1500000.00, 60, 'ACTIVE');
GO

-- 4.8 Treatment Rooms
INSERT INTO dbo.treatment_room (room_name, status, category)
VALUES
    (N'Therapy Room A',     'AVAILABLE', 'SPA'),
    (N'Therapy Room B',     'AVAILABLE', 'PHYSIO'),
    (N'Red Dao Bath Room 1','AVAILABLE', 'SPA'),
    (N'Yoga Studio 1',      'AVAILABLE', 'YOGA'),
    (N'Physio Rehab Room 1','AVAILABLE', 'PHYSIO'),
    (N'Spa Deluxe Room 1',  'AVAILABLE', 'SPA'),
    (N'Spa Deluxe Room 2',  'AVAILABLE', 'SPA'),
    (N'Physio Rehab Room 2','AVAILABLE', 'PHYSIO'),
    (N'Yoga Studio 2',      'AVAILABLE', 'YOGA');
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


-- =========================================================================
-- 7. NEW COMBO MENU BUSINESS LOGIC TABLES
-- =========================================================================

-- 1. Lưu trữ Chế độ ăn cho mỗi Booking (Booking Diets)
-- Giải quyết bài toán: 1 Booking có nhiều khách, mỗi khách có thể có chế độ ăn khác nhau.
CREATE TABLE booking_diet (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    dietary_tag NVARCHAR(50) NOT NULL, -- Ví dụ: 'Omnivore', 'Vegan', 'Keto'
    guest_count INT NOT NULL DEFAULT 1, -- Số lượng khách chọn chế độ này
    FOREIGN KEY (booking_id) REFERENCES room_booking(booking_id)
);

-- 2. Cấu trúc lại bảng FoodMenu (nếu chưa có đủ fields)
-- Bảng hiện tại đã có category, dietary_tags, periods, available_days.
-- Ta đảm bảo các giá trị Enum/Chuẩn hóa như sau:
-- category: 'Appetizer' (Khai vị), 'Main' (Món chính), 'Dessert' (Tráng miệng), 'Drink' (Nước uống)
-- periods: 'Breakfast' (Sáng), 'Lunch' (Trưa), 'Dinner' (Tối), 'AllDay' (Cả ngày)
-- dietary_tags: 'Omnivore', 'Vegan', 'Vegetarian', 'Keto', 'Halal', 'Pescatarian' (Có thể là JSON array hoặc chuỗi cách phẩy)

-- 3. Template Thực đơn cho Combo (Combo Menu Template)
-- Giải quyết bài toán: Combo A có 7 ngày ăn, mỗi ngày ăn có những món gì.
CREATE TABLE combo_menu_template (
    id INT IDENTITY(1,1) PRIMARY KEY,
    package_id INT NOT NULL, -- Tham chiếu tới retreat_packages (Gói Detox, Phục hồi...)
    day_number INT NOT NULL, -- Từ 1 đến 7 (Chu kỳ luân phiên 7 ngày)
    meal_type NVARCHAR(20) NOT NULL, -- 'Breakfast', 'Lunch', 'Dinner'
    food_id INT NOT NULL, -- Tham chiếu tới food_menu
    FOREIGN KEY (package_id) REFERENCES retreat_packages(package_id),
    FOREIGN KEY (food_id) REFERENCES food_menu(food_id)
);

-- 4. Bảng Ghi Nhận Suất Ăn Hàng Ngày (Daily Meal Order) - Tùy chọn để Bếp dễ nấu
-- Khi khách Check-in, hệ thống generate ra các suất ăn cho từng ngày dựa trên booking_diet và combo_menu_template.
CREATE TABLE daily_meal_order (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    serve_date DATE NOT NULL, -- Ngày phục vụ ăn uống
    meal_type NVARCHAR(20) NOT NULL, -- 'Breakfast', 'Lunch', 'Dinner'
    dietary_tag NVARCHAR(50) NOT NULL, -- Phục vụ cho chế độ nào ('Vegan', 'Omnivore'...)
    food_id INT NOT NULL, -- Món ăn cụ thể
    quantity INT NOT NULL, -- Số lượng phần (dựa vào guest_count trong booking_diet)
    status NVARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PREPARING', 'SERVED'
    FOREIGN KEY (booking_id) REFERENCES room_booking(booking_id),
    FOREIGN KEY (food_id) REFERENCES food_menu(food_id)
);


GO

SET IDENTITY_INSERT dbo.retreat_packages ON;

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 22)
    INSERT INTO dbo.retreat_packages (package_id, name, description, duration_days, price, includes, status, created_at, package_name, base_price, duration_text, goal, image_url)
    VALUES (22, N'Gói Tắm lá thuốc Dao Đỏ cho trẻ (5-12 tuổi)', N'Liệu trình ngâm tắm lá thuốc Dao Đỏ thảo dược thiên nhiên ôn hòa giúp bé tăng cường sức đề kháng và có giấc ngủ sâu hơn. (Giảm 30% so với người lớn)', 1, 420000.00, N'Tắm lá thuốc Dao Đỏ cho trẻ (5-12 tuổi);Massage đầu vai cổ nhẹ nhàng;Trà thảo dược mật ong thanh nhiệt', 'ACTIVE', GETDATE(), N'Red Dao Herbal Bath for Kids', 420000.00, N'1 ngày', 'KID', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80');

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 23)
    INSERT INTO dbo.retreat_packages (package_id, name, description, duration_days, price, includes, status, created_at, package_name, base_price, duration_text, goal, image_url)
    VALUES (23, N'Gói Massage toàn thân tinh dầu tràm kháng khuẩn (5-12 tuổi)', N'Liệu trình massage nhẹ nhàng kết hợp tinh dầu tràm gió kháng khuẩn giúp làm ấm cơ thể và bảo vệ hệ hô hấp cho bé. (Giảm 30% so với người lớn)', 1, 560000.00, N'Massage toàn thân tràm kháng khuẩn (5-12 tuổi);Liệu pháp xông chân thảo dược;Trà gừng mật ong giữ ấm cơ thể', 'ACTIVE', GETDATE(), N'Antibacterial Cajeput Oil Body Massage for Kids', 560000.00, N'1 ngày', 'KID', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80');

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 24)
    INSERT INTO dbo.retreat_packages (package_id, name, description, duration_days, price, includes, status, created_at, package_name, base_price, duration_text, goal, image_url)
    VALUES (24, N'Gói Nắn chỉnh tư thế & Giãn cơ cột sống học đường (5-12 tuổi)', N'Liệu trình nắn chỉnh tư thế nhẹ nhàng, phòng ngừa gù lưng, cong vẹo cột sống do ngồi học sai tư thế cho trẻ em. (Giảm 30% so với người lớn)', 1, 840000.00, N'Nắn chỉnh Chiropractic học đường (5-12 tuổi);Giãn cơ sâu kéo giãn cột sống lưng;Hướng dẫn ngồi học chuẩn y khoa', 'ACTIVE', GETDATE(), N'School Posture Alignment & Spine Stretching for Kids', 840000.00, N'1 ngày', 'KID', 'https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&w=800&q=80');

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 25)
    INSERT INTO dbo.retreat_packages (package_id, name, description, duration_days, price, includes, status, created_at, package_name, base_price, duration_text, goal, image_url)
    VALUES (25, N'Vé Khu Vui Chơi Trẻ Em', N'Bao gồm công viên nước và tất cả các trò chơi trẻ em hay chơi với trị giá là 500k.', 1, 400000.00, N'Vé vào cổng công viên nước;Trò chơi trẻ em đa dạng;Đảm bảo an toàn cho bé', 'ACTIVE', GETDATE(), N'Kids Playground Ticket', 400000.00, N'1 ngày', 'KID', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80');

SET IDENTITY_INSERT dbo.retreat_packages OFF;


GO

-- Migration: Add voucher table + invoice voucher/discount columns
-- Fixes "Transaction silently rolled back / marked as rollback-only" during
-- booking creation and VNPay payment. The Invoice entity maps voucher_id,
-- discount_amount and a Voucher association that did not exist in the DB,
-- so Hibernate failed on save and poisoned the transaction.
-- Idempotent: safe to run multiple times.

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.voucher','U') IS NULL
BEGIN
    CREATE TABLE dbo.voucher (
        voucher_id          INT IDENTITY(1,1) PRIMARY KEY,
        code                VARCHAR(50)   NOT NULL UNIQUE,
        discount_type       VARCHAR(20)   NOT NULL,         -- PERCENTAGE | FIXED_AMOUNT
        discount_value      DECIMAL(12,2) NOT NULL,
        max_discount_amount DECIMAL(12,2) NULL,
        min_booking_amount  DECIMAL(12,2) NULL DEFAULT(0),
        start_date          DATETIME2     NOT NULL,
        expiry_date         DATETIME2     NOT NULL,
        usage_limit         INT           NULL DEFAULT(100),
        used_count          INT           NULL DEFAULT(0),
        status              VARCHAR(20)   NULL DEFAULT('ACTIVE'),
        created_at          DATETIME2     NULL
    );
END

IF COL_LENGTH('dbo.invoice','discount_amount') IS NULL
    ALTER TABLE dbo.invoice ADD discount_amount DECIMAL(12,2) NOT NULL
        CONSTRAINT DF_invoice_discount_amount DEFAULT(0);

IF COL_LENGTH('dbo.invoice','voucher_id') IS NULL
    ALTER TABLE dbo.invoice ADD voucher_id INT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_invoice_voucher')
    ALTER TABLE dbo.invoice WITH CHECK
        ADD CONSTRAINT FK_invoice_voucher FOREIGN KEY (voucher_id)
        REFERENCES dbo.voucher (voucher_id);

COMMIT TRANSACTION;

GO

USE ResortSpaDB;

-- CREATE TABLES FOR SHIFTS AND INVENTORY

-- INSERT STAFF ACCOUNTS INTO USERS TABLE
IF NOT EXISTS (SELECT * FROM users WHERE email='thu.le@ngusonresort.com')
BEGIN
    INSERT INTO users (email, password_hash, full_name, phone, role, status, created_at)
    VALUES ('thu.le@ngusonresort.com', '$2a$10$g1kGv2.rIuN9iH6qZ9Gg3eTMqO7Vig80fH3r.V9nFzEuxK9X.m9uG', N'Lê Thị Thu', '0981234567', 'STAFF', 'ACTIVE', GETDATE());
END;

IF NOT EXISTS (SELECT * FROM users WHERE email='huy.nguyen@ngusonresort.com')
BEGIN
    INSERT INTO users (email, password_hash, full_name, phone, role, status, created_at)
    VALUES ('huy.nguyen@ngusonresort.com', '$2a$10$g1kGv2.rIuN9iH6qZ9Gg3eTMqO7Vig80fH3r.V9nFzEuxK9X.m9uG', N'Nguyễn Văn Huy', '0981234568', 'THERAPIST', 'ACTIVE', GETDATE());
END;

IF NOT EXISTS (SELECT * FROM users WHERE email='long.pham@ngusonresort.com')
BEGIN
    INSERT INTO users (email, password_hash, full_name, phone, role, status, created_at)
    VALUES ('long.pham@ngusonresort.com', '$2a$10$g1kGv2.rIuN9iH6qZ9Gg3eTMqO7Vig80fH3r.V9nFzEuxK9X.m9uG', N'Phạm Văn Long', '0981234569', 'STAFF', 'ACTIVE', GETDATE());
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='shifts' AND xtype='U')
BEGIN
    CREATE TABLE shifts (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        role NVARCHAR(100) NOT NULL,
        time NVARCHAR(100) NOT NULL,
        department NVARCHAR(100) NOT NULL,
        status NVARCHAR(50) NOT NULL
    );

    INSERT INTO shifts (name, role, time, department, status) VALUES
    (N'Lê Thị Thu', N'Lễ tân chính', N'Ca Sáng (06:00 - 14:00)', N'Lễ tân', N'Checked-in'),
    (N'Nguyễn Văn Huy', N'Trưởng bộ phận Spa', N'Ca Chiều (14:00 - 22:00)', N'Bộ phận Spa', N'Checked-in'),
    (N'Phạm Văn Long', N'Kỹ thuật viên', N'Ca Đêm (22:00 - 06:00)', N'Kỹ thuật', N'Absent');
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='swap_requests' AND xtype='U')
BEGIN
    CREATE TABLE swap_requests (
        id INT IDENTITY(1,1) PRIMARY KEY,
        sender NVARCHAR(100) NOT NULL,
        shift NVARCHAR(100) NOT NULL,
        date NVARCHAR(50) NOT NULL,
        receiver NVARCHAR(100) NOT NULL,
        reason NVARCHAR(255) NOT NULL,
        status NVARCHAR(50) NOT NULL
    );

    INSERT INTO swap_requests (sender, shift, date, receiver, reason, status) VALUES
    (N'Lê Thị Thu', N'Ca Sáng (06:00 - 14:00)', N'2026-05-26', N'Nguyễn Văn Huy', N'Giải quyết việc gia đình đột xuất', N'Pending');
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='inventory' AND xtype='U')
BEGIN
    CREATE TABLE inventory (
        id VARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        category NVARCHAR(100) NOT NULL,
        stock INT NOT NULL,
        min_qty INT NOT NULL,
        unit NVARCHAR(50) NOT NULL
    );

    INSERT INTO inventory (id, name, category, stock, min_qty, unit) VALUES
    ('INV-101', N'Tinh dầu oải hương (Lavender)', N'Spa trị liệu', 25, 5, N'Lít'),
    ('INV-102', N'Trà thảo mộc hoa cúc', N'Bếp ăn nhà hàng', 120, 20, N'Hộp'),
    ('INV-103', N'Khăn tắm cotton cao cấp', N'Buồng phòng', 8, 15, N'Cái'),
    ('INV-104', N'Dầu gội organic bạc hà', N'Buồng phòng', 45, 10, N'Chai');
END;


GO

-- ============================================================
-- Module 3: Spa & Therapy Scheduling - schema + seed alignment
-- (idempotent; safe to re-run on an already-created database)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'specialty')
    ALTER TABLE dbo.users ADD specialty VARCHAR(20) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.treatment_room') AND name = 'category')
    ALTER TABLE dbo.treatment_room ADD category VARCHAR(20) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'google_calendar_sync_enabled')
    ALTER TABLE dbo.users ADD google_calendar_sync_enabled BIT NOT NULL DEFAULT 0;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'google_calendar_id')
    ALTER TABLE dbo.users ADD google_calendar_id VARCHAR(255) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'calendar_reminders_enabled')
    ALTER TABLE dbo.users ADD calendar_reminders_enabled BIT NOT NULL DEFAULT 1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'reminder_lead_time_mins')
    ALTER TABLE dbo.users ADD reminder_lead_time_mins INT NOT NULL DEFAULT 30;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.spa_booking') AND name = 'google_calendar_event_id')
    ALTER TABLE dbo.spa_booking ADD google_calendar_event_id VARCHAR(255) NULL;
GO

-- Assign discipline to existing therapist + add Yoga / Physio specialists (BCrypt of '123456')
UPDATE dbo.users SET specialty = 'SPA' WHERE email = 'therapist1@nguson.vn' AND (specialty IS NULL OR specialty = '');

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'yoga1@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('yoga1@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Cô Lan - HLV Yoga & Thiền', '0912345111', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'YOGA');

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'physio1@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('physio1@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'KTV Minh - Vật Lý Trị Liệu', '0912345222', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'PHYSIO');
GO

-- ============================================================
-- Mo rong nhan su Resort (large-scale wellness resort)
-- Tat ca mat khau: 123456 (BCrypt). Idempotent, an toan chay lai.
-- ============================================================

-- SPA Therapists: +4 (tong 5 chuyen gia Spa)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'spa2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('spa2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Hoàng Thị Hoa - Massage Thư Giãn', '0912347001', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'SPA');
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'spa3@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('spa3@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Văn Dũng - Massage Đá Nóng', '0912347002', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'SPA');
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'spa4@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('spa4@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Thị Mai - Chăm Sóc Da Mặt', '0912347003', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'SPA');
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'spa5@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('spa5@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Thị Trang - Liệu Pháp Hương Thảo', '0912347004', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'SPA');

-- YOGA Instructors: +2 (tong 3 HLV Yoga)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'yoga2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('yoga2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Quang Minh - HLV Yoga Vinyasa', '0912347005', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'YOGA');
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'yoga3@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('yoga3@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Đặng Thị Thu - Yoga Nidra & Thiền Định', '0912347006', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'YOGA');

-- PHYSIO Therapists: +2 (tong 3 KTV Vat Ly Tri Lieu)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'physio2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('physio2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'BS Vũ Thị Lan - VLTL Cột Sống', '0912347007', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'PHYSIO');
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'physio3@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('physio3@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'KTV Bùi Mạnh Hùng - Phục Hồi Chức Năng', '0912347008', NULL, N'Vietnam', NULL, NULL, 'THERAPIST', 'ACTIVE', 'PHYSIO');

-- Receptionists: +3 (tong 4 le tan)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'reception2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('reception2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Anh Khoa - Lễ Tân Ca Sáng', '0912347009', NULL, N'Vietnam', NULL, NULL, 'RECEPTIONIST', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'reception3@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('reception3@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Thùy Linh - Lễ Tân Ca Chiều', '0912347010', NULL, N'Vietnam', NULL, NULL, 'RECEPTIONIST', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'reception4@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('reception4@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Minh Tuấn - Lễ Tân Ca Tối', '0912347011', NULL, N'Vietnam', NULL, NULL, 'RECEPTIONIST', 'ACTIVE', NULL);

-- Chefs: +2 (tong 3 dau bep)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'chef2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('chef2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Bếp Phó Đỗ Thành - Ẩm Thực Dưỡng Sinh', '0912347012', NULL, N'Vietnam', NULL, NULL, 'CHEF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'chef3@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('chef3@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Đầu Bếp Ngô Thị Hương - Healthy Cuisine', '0912347013', NULL, N'Vietnam', NULL, NULL, 'CHEF', 'ACTIVE', NULL);

-- General Staff: +5 (tong 6 nhan vien van hanh)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Hoài Nam - Phục Vụ Villa', '0912347014', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff3@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff3@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Thị Thái - Buồng Phòng & Vệ Sinh', '0912347015', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff4@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff4@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Văn Quân - Bảo Vệ & An Ninh', '0912347016', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff5@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff5@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Hoàng Văn Đức - Kỹ Thuật & Bảo Trì', '0912347017', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff6@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff6@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Thị Yến - Phục Vụ Khu Spa', '0912347018', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);

-- Technical Staff (10 accounts)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech1@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech1@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Văn Hùng - Kỹ Thuật & Điện Nước', '0912347101', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Anh Tuấn - Kỹ Thuật Điện Lạnh', '0912347102', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech3@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech3@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Minh Hoàng - Bảo Trì Thiết Bị', '0912347103', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech4@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech4@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Hoàng Long - Kỹ Thuật Viên Hạ Tầng', '0912347104', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech5@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech5@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Tiến Đạt - Kỹ Thuật Hồ Bơi', '0912347105', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech6@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech6@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Vũ Anh Đức - Bảo Trì Hệ Thống', '0912347106', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech7@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech7@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Đặng Văn Sơn - Kỹ Thuật Âm Thanh Ánh Sáng', '0912347107', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech8@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech8@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Hoàng Quốc Việt - Sửa Chữa Đồ Gỗ', '0912347108', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech9@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech9@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Duy Anh - Kỹ Thuật Mạng & Viễn Thông', '0912347109', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_tech10@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_tech10@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Bùi Thanh Tùng - Kỹ Thuật Tổng Hợp', '0912347110', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);

-- Cleaning Staff (10 accounts)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean1@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean1@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Thị Hoa - Buồng Phòng Ca Sáng', '0912347201', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Thị Mai - Dọn Dẹp Villa', '0912347202', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean3@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean3@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Thị Đào - Dọn Dẹp Khu Vực Chung', '0912347203', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean4@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean4@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Thị Cúc - Buồng Phòng Ca Chiều', '0912347204', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean5@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean5@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Thị Lan - Giặt Ủi & Vệ Sinh', '0912347205', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean6@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean6@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Vũ Thị Hồng - Dọn Dẹp Khu Spa', '0912347206', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean7@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean7@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Hoàng Thị Tuyết - Vệ Sinh Ngoại Cảnh', '0912347207', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean8@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean8@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Đỗ Thị Thảo - Buồng Phòng Deluxe', '0912347208', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean9@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean9@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Bùi Thị Dung - Dọn Dẹp Khu Nhà Hàng', '0912347209', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'staff_clean10@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('staff_clean10@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Thị Kim - Buồng Phòng Ca Tối', '0912347210', NULL, N'Vietnam', NULL, NULL, 'STAFF', 'ACTIVE', NULL);

-- Manager: +1 (tong 2 quan ly)
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'manager2@nguson.vn')
    INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, nationality, visa_number, entry_date, role, status, specialty)
    VALUES ('manager2@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Thị Vân - Phó Giám Đốc Vận Hành', '0912347019', NULL, N'Vietnam', NULL, NULL, 'MANAGER', 'ACTIVE', NULL);
GO

-- Mo rong phong tri lieu de du suc chua so nhan su tang them
IF NOT EXISTS (SELECT 1 FROM dbo.treatment_room WHERE room_name = N'Spa Deluxe Room 1')
    INSERT INTO dbo.treatment_room (room_name, status, category) VALUES (N'Spa Deluxe Room 1', 'AVAILABLE', 'SPA');
IF NOT EXISTS (SELECT 1 FROM dbo.treatment_room WHERE room_name = N'Spa Deluxe Room 2')
    INSERT INTO dbo.treatment_room (room_name, status, category) VALUES (N'Spa Deluxe Room 2', 'AVAILABLE', 'SPA');
IF NOT EXISTS (SELECT 1 FROM dbo.treatment_room WHERE room_name = N'Physio Rehab Room 2')
    INSERT INTO dbo.treatment_room (room_name, status, category) VALUES (N'Physio Rehab Room 2', 'AVAILABLE', 'PHYSIO');
IF NOT EXISTS (SELECT 1 FROM dbo.treatment_room WHERE room_name = N'Yoga Studio 2')
    INSERT INTO dbo.treatment_room (room_name, status, category) VALUES (N'Yoga Studio 2', 'AVAILABLE', 'YOGA');
GO

-- Fix Users
UPDATE dbo.users SET full_name = N'Nguyễn Quản Lý' WHERE email = 'manager@nguson.vn';
UPDATE dbo.users SET full_name = N'Lê Lễ Tân' WHERE email = 'reception@nguson.vn';
UPDATE dbo.users SET full_name = N'Bác Sĩ Hải - Trị Liệu' WHERE email = 'therapist1@nguson.vn';
UPDATE dbo.users SET full_name = N'Phạm Bếp Trưởng' WHERE email = 'chef@nguson.vn';
UPDATE dbo.users SET full_name = N'Trần Khách Hàng' WHERE email = 'guest1@gmail.com';
UPDATE dbo.users SET full_name = N'Lê Minh Châu' WHERE email = 'guest2@gmail.com';
UPDATE dbo.users SET full_name = N'Hoàng Nam Anh' WHERE email = 'guest3@gmail.com';

-- Fix Retreat Packages
SET IDENTITY_INSERT dbo.retreat_packages ON;

-- 1
IF EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 1)
    UPDATE dbo.retreat_packages SET name = N'Gói Thanh Lọc & Giải Độc Cơ Thể (Premium Detox)', package_name = N'Premium Detox', description = N'Hành trình thanh lọc cơ thể toàn diện 5 ngày 4 đêm. Thải độc tố, tái tạo tế bào qua chế độ thực dưỡng lành mạnh kết hợp thủy liệu pháp đại tràng.', duration_days = 5, duration_text = N'5 ngày 4 đêm', price = 5200000.00, base_price = 5200000.00, includes = N'Thực đơn nước ép & chay thực dưỡng;Thủy liệu pháp đại tràng thanh lọc;Tắm khoáng nóng & xông hơi đá muối', goal = N'SPA', image_url = N'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80' WHERE package_id = 1;
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 1)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (1, N'Gói Thanh Lọc & Giải Độc Cơ Thể (Premium Detox)', N'Premium Detox', N'Hành trình thanh lọc cơ thể toàn diện 5 ngày 4 đêm. Thải độc tố, tái tạo tế bào qua chế độ thực dưỡng lành mạnh kết hợp thủy liệu pháp đại tràng.', 5, N'5 ngày 4 đêm', 5200000.00, 5200000.00, N'Thực đơn nước ép & chay thực dưỡng;Thủy liệu pháp đại tràng thanh lọc;Tắm khoáng nóng & xông hơi đá muối', N'SPA', 'ACTIVE', N'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80');

-- 2
IF EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 2)
    UPDATE dbo.retreat_packages SET name = N'Yoga & Thiền Định Phục Hồi (Mindfulness Weekend)', package_name = N'Mindfulness Weekend', description = N'Khóa thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm bên rừng thông. Giúp cân bằng luân xa, xoa dịu tâm trí và tái tạo năng lượng tích cực.', duration_days = 3, duration_text = N'3 ngày 2 đêm', price = 3500000.00, base_price = 3500000.00, includes = N'Lớp học Hatha Yoga cá nhân hóa 1-1;Thiền hành & Thiền chuông xoay Tây Tạng;Tư vấn dinh dưỡng & lối sống lành mạnh', goal = N'YOGA', image_url = N'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' WHERE package_id = 2;
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 2)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (2, N'Yoga & Thiền Định Phục Hồi (Mindfulness Weekend)', N'Mindfulness Weekend', N'Khóa thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm bên rừng thông. Giúp cân bằng luân xa, xoa dịu tâm trí và tái tạo năng lượng tích cực.', 3, N'3 ngày 2 đêm', 3500000.00, 3500000.00, N'Lớp học Hatha Yoga cá nhân hóa 1-1;Thiền hành & Thiền chuông xoay Tây Tạng;Tư vấn dinh dưỡng & lối sống lành mạnh', N'YOGA', 'ACTIVE', N'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80');

-- 3
IF EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 3)
    UPDATE dbo.retreat_packages SET name = N'Gói Giảm Cân & Thon Gọn Dáng Vóc (Slimming)', package_name = N'Slimming', description = N'Hành trình thon gọn vóc dáng khoa học 7 ngày 6 đêm. Bao gồm huấn luyện thể chất PT 1-1 chuyên sâu và tư vấn chế độ dinh dưỡng lành mạnh.', duration_days = 7, duration_text = N'7 ngày 6 đêm', price = 8500000.00, base_price = 8500000.00, includes = N'Tư vấn dinh dưỡng từ chuyên gia;Tập luyện PT 1-1 đốt mỡ cá nhân hóa;Massage bùn nóng hóa lỏng mỡ thừa', goal = N'THERAPY', image_url = N'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' WHERE package_id = 3;
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 3)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (3, N'Gói Giảm Cân & Thon Gọn Dáng Vóc (Slimming)', N'Slimming', N'Hành trình thon gọn vóc dáng khoa học 7 ngày 6 đêm. Bao gồm huấn luyện thể chất PT 1-1 chuyên sâu và tư vấn chế độ dinh dưỡng lành mạnh.', 7, N'7 ngày 6 đêm', 8500000.00, 8500000.00, N'Tư vấn dinh dưỡng từ chuyên gia;Tập luyện PT 1-1 đốt mỡ cá nhân hóa;Massage bùn nóng hóa lỏng mỡ thừa', N'THERAPY', 'ACTIVE', N'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80');

-- 4
IF EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 4)
    UPDATE dbo.retreat_packages SET name = N'Gói Thư Giãn Hoàng Gia (Royal Spa Retreat)', package_name = N'Royal Spa Retreat', description = N'Liệu trình thư giãn hoàng gia kết hợp massage tinh dầu hữu cơ thơm mát và liệu pháp đá muối nóng Himalaya giúp giải tỏa hoàn toàn mọi căng thẳng và phục hồi sinh khí.', duration_days = 2, duration_text = N'2 ngày 1 đêm', price = 2000000.00, base_price = 2000000.00, includes = N'Massage đá muối nóng Himalaya (90 phút);Xông hơi thảo dược hoàng cung;Ngâm chân thảo dược & trà dưỡng nhan', goal = N'SPA', image_url = N'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' WHERE package_id = 4;
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 4)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (4, N'Gói Thư Giãn Hoàng Gia (Royal Spa Retreat)', N'Royal Spa Retreat', N'Liệu trình thư giãn hoàng gia kết hợp massage tinh dầu hữu cơ thơm mát và liệu pháp đá muối nóng Himalaya giúp giải tỏa hoàn toàn mọi căng thẳng và phục hồi sinh khí.', 2, N'2 ngày 1 đêm', 2000000.00, 2000000.00, N'Massage đá muối nóng Himalaya (90 phút);Xông hơi thảo dược hoàng cung;Ngâm chân thảo dược & trà dưỡng nhan', N'SPA', 'ACTIVE', N'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80');

-- 5
IF EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 5)
    UPDATE dbo.retreat_packages SET name = N'Nắn Chỉnh Cột Sống & Vật Lý Trị Liệu', package_name = N'Spine Chiropractic', description = N'Gói trị liệu chuyên sâu phục hồi cột sống 4 ngày 3 đêm, chẩn đoán bởi bác sĩ chuyên khoa xương khớp kết hợp nắn chỉnh cơ Chiropractic.', duration_days = 4, duration_text = N'4 ngày 3 đêm', price = 4800000.00, base_price = 4800000.00, includes = N'Khám chẩn đoán cột sống bởi bác sĩ chuyên khoa;2 buổi nắn chỉnh cột sống Chiropractic;Tập phục hồi chức năng cơ cốt lõi', goal = N'THERAPY', image_url = N'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80' WHERE package_id = 5;
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 5)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (5, N'Nắn Chỉnh Cột Sống & Vật Lý Trị Liệu', N'Spine Chiropractic', N'Gói trị liệu chuyên sâu phục hồi cột sống 4 ngày 3 đêm, chẩn đoán bởi bác sĩ chuyên khoa xương khớp kết hợp nắn chỉnh cơ Chiropractic.', 4, N'4 ngày 3 đêm', 4800000.00, 4800000.00, N'Khám chẩn đoán cột sống bởi bác sĩ chuyên khoa;2 buổi nắn chỉnh cột sống Chiropractic;Tập phục hồi chức năng cơ cốt lõi', N'THERAPY', 'ACTIVE', N'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80');

-- 6
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 6)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (6, N'Gói Hương Trầm Trị Liệu & Trẻ Hóa', N'Agarwood Youth', N'Trải nghiệm sang trọng kết hợp hương trầm tự nhiên Ngũ Sơn và tinh dầu thông đỏ quý hiếm, kích thích tuần hoàn và mang đến làn da tươi trẻ rạng ngời.', 2, N'2 ngày 1 đêm', 2400000.00, 2400000.00, N'Massage hương trầm tự nhiên (75 phút);Chăm sóc da mặt thảo dược chuyên sâu;Trị liệu massage đầu kiểu Nhật', N'SPA', 'ACTIVE', N'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80');

-- 7
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 7)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (7, N'Gói Sen Vàng Tịnh Tâm (Golden Lotus)', N'Golden Lotus', N'Liệu trình chăm sóc sức khỏe lấy cảm hứng từ hoa sen Việt Nam, kết hợp bùn khoáng thiên nhiên giúp dưỡng ẩm sâu và đem lại giấc ngủ ngon lành.', 1, N'1 ngày', 1800000.00, 1800000.00, N'Massage toàn thân tinh dầu sen trắng (60 phút);Đắp mặt nạ hạt sen tươi;Tắm bùn khoáng thiên nhiên', N'SPA', 'ACTIVE', N'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=800&q=80');

-- 8
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 8)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (8, N'Gói Suối Khoáng Nóng Trị Liệu (Onsen Healing)', N'Onsen Healing', N'Liệu trình ngâm tắm suối khoáng nóng kết hợp xông hơi đá muối hồng ngoại Himalaya và massage Shiatsu bấm huyệt Nhật Bản giúp kích thích lưu thông khí huyết và thư giãn sâu cơ khớp.', 1, N'1 ngày', 1600000.00, 1600000.00, N'Tắm khoáng nóng Onsen thảo dược;Xông hơi đá muối Himalaya;Massage Shiatsu bấm huyệt Nhật Bản (60 phút)', N'SPA', 'ACTIVE', N'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80');

-- 9
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 9)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (9, N'Gói Thảo Mộc Bản Địa (Sensory Herb Journey)', N'Sensory Herb', N'Liệu trình chăm sóc cơ thể đa giác quan sử dụng thảo dược bản địa tươi mát thu hoạch tại vườn hữu cơ của resort, kết hợp chườm nóng và massage bằng dầu dừa nguyên chất ép lạnh.', 2, N'2 ngày 1 đêm', 2200000.00, 2200000.00, N'Tẩy tế bào chết bằng bã cà phê & mật ong;Chườm túi thảo dược tươi ấm nóng;Massage dầu dừa tự nhiên ép lạnh', N'SPA', 'ACTIVE', N'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80');

-- 10
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 10)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (10, N'Gói Yoga Cân Bằng Năng Lượng (Energy Balance)', N'Energy Balance', N'Huấn luyện Yoga nâng cao kết hợp Vinyasa Yoga năng động và các kỹ thuật hít thở sâu, hỗ trợ giải phóng năng lượng tắc nghẽn ở các cơ cốt lõi.', 4, N'4 ngày 3 đêm', 4200000.00, 4200000.00, N'3 buổi tập Vinyasa Yoga dòng chảy;Tập thở kiểm soát năng lượng Pranayama;Tắm khoáng phục hồi cơ bắp', N'YOGA', 'ACTIVE', N'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80');

-- 11
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 11)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (11, N'Khóa Thiền Tịnh Khẩu & Tắm Rừng (Silent Zen)', N'Silent Zen', N'Khóa trải nghiệm im lặng tuyệt đối trong 2 ngày, kết nối sâu sắc với tự nhiên qua liệu pháp tắm rừng (Shinrin-yoku) và thiền chuông xoay.', 2, N'2 ngày 1 đêm', 2000000.00, 2000000.00, N'Hướng dẫn tắm rừng Shinrin-yoku;Thiền trà tĩnh tâm bên suối;Trị liệu âm thanh bằng chuông xoay', N'YOGA', 'ACTIVE', N'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80');

-- 12
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 12)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (12, N'Gói Yoga Thiền Định Cho Giấc Ngủ (Sleep Well)', N'Sleep Well', N'Liệu trình đặc trị mất ngủ, kết hợp lớp tập Yoga phục hồi nhẹ nhàng buổi tối và thực hành Yoga Nidra (thiền ngủ) để làm dịu hệ thần kinh.', 3, N'3 ngày 2 đêm', 2800000.00, 2800000.00, N'Huấn luyện thiền giấc ngủ Yoga Nidra;Massage body tinh dầu oải hương;Trà thảo mộc an thần trước khi ngủ', N'YOGA', 'ACTIVE', N'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80');

-- 13
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 13)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (13, N'Khóa Thiền Sound Bath & Cân Bằng Luân Xa', N'Sound Bath Chakra', N'Sử dụng liệu pháp âm thanh cộng hưởng tần số cao của chuông xoay pha lê kết hợp các tư thế yoga phục hồi nhẹ nhàng để đả thông bế tắc ở 7 luân xa chính.', 3, N'3 ngày 2 đêm', 3000000.00, 3000000.00, N'Liệu pháp Sound Bath bằng chuông pha lê;Lớp học Restorative Yoga phục hồi;Tư vấn kiểm tra tần số luân xa cá nhân', N'YOGA', 'ACTIVE', N'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80');

-- 14
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 14)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (14, N'Yoga Đón Bình Minh (Sunrise Yoga Retreat)', N'Sunrise Yoga', N'Đánh thức mọi giác quan buổi sáng bên hồ nước tĩnh lặng của resort với chuỗi động tác chào mặt trời, thực hành kỹ thuật thở thanh lọc cơ thể Pranayama và thiền định ngắn.', 2, N'2 ngày 1 đêm', 1500000.00, 1500000.00, N'3 buổi tập Yoga đón bình minh bên hồ;Kỹ thuật thở thanh lọc Pranayama nâng cao;Bữa sáng dinh dưỡng thực dưỡng sau tập', N'YOGA', 'ACTIVE', N'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80');

-- 15
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 15)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (15, N'Trị Liệu Cổ Vai Gáy Chuyên Sâu (Deep Healing)', N'Deep Healing Neck', N'Liệu pháp đặc trị đau mỏi cổ vai gáy kinh niên cho giới văn phòng, sử dụng kỹ thuật ấn huyệt Đông y kết hợp túi chườm thảo dược nóng.', 1, N'1 ngày', 1200000.00, 1200000.00, N'Ấn huyệt đả thông kinh lạc cổ vai gáy (75 phút);Chườm thảo dược ngải cứu nóng;Ngâm chân thảo dược gừng tươi', N'THERAPY', 'ACTIVE', N'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80');

-- 16
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 16)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (16, N'Phục Hồi Chấn Thương & Giãn Cơ Thể Thao', N'Sports Recovery', N'Dành riêng cho những người hoạt động thể thao cường độ cao, giúp thư giãn cơ sâu bằng máy sóng xung kích và giải tỏa axit lactic.', 3, N'3 ngày 2 đêm', 3800000.00, 3800000.00, N'Giãn cơ sâu bằng máy sóng xung kích;Massage thể thao giải tỏa axit lactic;Ngâm bồn sục jacuzzi phục hồi', N'THERAPY', 'ACTIVE', N'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80');

-- 17
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 17)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (17, N'Điều Trị Đau Cột Sống & Thắt Lưng Chuyên Sâu', N'Spine & Waist Recovery', N'Hành trình điều trị chuyên biệt cho người thoát vị đĩa đệm, thoái hóa cột sống bằng công nghệ xung điện hiện đại, nắn chỉnh Chiropractic cột sống thắt lưng và bài tập phục hồi cơ cốt lõi chuyên sâu.', 5, N'5 ngày 4 đêm', 5800000.00, 5800000.00, N'Châm cứu & Xung điện phục hồi xung thần kinh;Nắn chỉnh Chiropractic chuyên khoa cột sống;Bài tập phục hồi nhóm cơ lưng & cơ bụng dưới', N'THERAPY', 'ACTIVE', N'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80');

-- 18
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 18)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (18, N'Phục Hồi Thần Kinh & Giải Tỏa Stress Cực Hạn', N'Neuro Stress Relief', N'Liệu trình kết hợp y học cổ truyền Đông y như châm cứu ngải cứu vùng đầu cổ gáy, massage ấn huyệt phản xạ cơ bàn chân và ngâm bồn tắm thuốc Dao đỏ giúp giải phóng căng thẳng tâm lý.', 3, N'3 ngày 2 đêm', 3200000.00, 3200000.00, N'Châm cứu ngải thảo dược ấm đầu cổ gáy;Massage bấm huyệt phản xạ lòng bàn tay/bàn chân;Ngâm bồn tắm gỗ sồi thuốc Dao Đỏ thảo dược', N'THERAPY', 'ACTIVE', N'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80');

-- 19
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 19)
    INSERT INTO dbo.retreat_packages (package_id, name, package_name, description, duration_days, duration_text, price, base_price, includes, goal, status, image_url)
    VALUES (19, N'Thải Độc Hệ Bạch Huyết Toàn Diện (Lymphatic Drainage)', N'Lymphatic Drainage', N'Liệu pháp kích thích tuần lưu thông bạch huyết cơ thể nhằm tăng cường hệ thống miễn dịch, giải quyết tình trạng ứ dịch và đào thải độc tố tích tụ.', 4, N'4 ngày 3 đêm', 4100000.00, 4100000.00, N'Massage dẫn lưu cơ học hệ bạch huyết toàn diện;Liệu pháp quấn nóng thải độc cơ thể bằng tảo biển;Thực đơn nước ép detox hữu cơ hàng ngày', N'THERAPY', 'ACTIVE', N'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80');

SET IDENTITY_INSERT dbo.retreat_packages OFF;

-- Fix Package Highlights
DELETE FROM dbo.package_highlights;
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
(5, N'Tắm ngâm thảo dược cổ truyền Dao Đỏ'),
(6, N'Massage hương trầm tự nhiên'),
(6, N'Tinh dầu thông đỏ quý hiếm'),
(7, N'Massage tinh dầu sen trắng'),
(7, N'Tắm bùn khoáng thiên nhiên'),
(8, N'Tắm khoáng nóng Onsen thảo dược'),
(8, N'Massage Shiatsu bấm huyệt Nhật Bản'),
(9, N'Chườm túi thảo dược tươi ấm nóng'),
(9, N'Tẩy tế bào chết bằng bã cà phê'),
(10, N'Tập Vinyasa Yoga dòng chảy'),
(10, N'Hít thở kiểm soát năng lượng Pranayama'),
(11, N'Khóa im lặng tuyệt đối 2 ngày'),
(11, N'Tắm rừng kết nối sâu sắc'),
(12, N'Thiền ngủ sâu Yoga Nidra'),
(12, N'Massage tinh dầu oải hương'),
(13, N'Sound Bath chuông xoay pha lê'),
(13, N'Đả thông bế tắc 7 luân xa'),
(14, N'Yoga chào mặt trời bên hồ'),
(14, N'Hít thở thanh lọc cơ thể'),
(15, N'Ấn huyệt đả thông kinh lạc cổ'),
(15, N'Chườm ngải cứu nóng giải mỏi'),
(16, N'Giãn cơ sâu bằng sóng xung kích'),
(16, N'Massage thể thao giải axit lactic'),
(17, N'Nắn chỉnh Chiropractic cột sống'),
(17, N'Châm cứu & xung điện xung thần kinh'),
(18, N'Châm cứu ngải cứu vùng đầu gáy'),
(18, N'Ngâm bồn tắm thuốc Dao Đỏ'),
(19, N'Massage dẫn lưu hệ bạch huyết'),
(19, N'Quấn nóng tảo biển thải độc');

-- Fix Package Features
DELETE FROM dbo.package_features;
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
(5, N'Súp sâm yến mạch thực dưỡng mỗi tối'),
(6, N'Trị liệu massage đầu kiểu Nhật'),
(6, N'Chăm sóc da mặt thảo dược chuyên sâu'),
(7, N'Đắp mặt nạ hạt sen tươi'),
(7, N'Trà sen tịnh tâm an thần'),
(8, N'Xông hơi đá muối Himalaya'),
(8, N'Trà gừng giữ ấm cơ thể'),
(9, N'Massage dầu dừa tự nhiên ép lạnh'),
(9, N'Vườn dược liệu hữu cơ riêng'),
(10, N'Tắm khoáng phục hồi cơ bắp'),
(10, N'Chuyên gia Yoga hướng dẫn'),
(11, N'Thiền trà tĩnh tâm bên suối'),
(11, N'Chuông xoay Tây Tạng phục hồi'),
(12, N'Trà thảo mộc an thần trước ngủ'),
(12, N'Lớp Yoga tối thư giãn'),
(13, N'Lớp học Restorative Yoga phục hồi'),
(13, N'Kiểm tra tần số luân xa'),
(14, N'Bữa sáng dinh dưỡng thực dưỡng'),
(14, N'Không gian hồ nước yên tĩnh'),
(15, N'Ngâm chân thảo dược gừng tươi'),
(15, N'Phục hồi cơ vai gáy kinh niên'),
(16, N'Ngâm bồn sục jacuzzi phục hồi'),
(16, N'Phù hợp vận động viên'),
(17, N'Bài tập nhóm cơ lưng & cơ bụng'),
(17, N'Chẩn đoán hình ảnh đĩa đệm'),
(18, N'Massage bấm huyệt phản xạ lòng chân'),
(18, N'Giải tỏa stress cực hạn'),
(19, N'Thực đơn nước ép detox hàng ngày'),
(19, N'Tăng cường hệ miễn dịch');

-- Fix Room Types
UPDATE dbo.room_types SET type_name = N'Standard Room 1 King Bed' WHERE room_type_id = 1;
UPDATE dbo.room_types SET type_name = N'Vip Villa 1-Bedroom Pool' WHERE room_type_id = 2;
UPDATE dbo.room_types SET type_name = N'Presidential Suite 2-Bedroom' WHERE room_type_id = 3;

-- Fix Treatment Rooms (+ assign discipline category for Module 3 auto-match)
UPDATE dbo.treatment_room SET room_name = N'Therapy Room A', category = 'SPA' WHERE treatment_room_id = 1;
UPDATE dbo.treatment_room SET room_name = N'Therapy Room B', category = 'PHYSIO' WHERE treatment_room_id = 2;
UPDATE dbo.treatment_room SET room_name = N'Red Dao Bath Room 1', category = 'SPA' WHERE treatment_room_id = 3;

IF NOT EXISTS (SELECT 1 FROM dbo.treatment_room WHERE room_name = N'Yoga Studio 1')
    INSERT INTO dbo.treatment_room (room_name, status, category) VALUES (N'Yoga Studio 1', 'AVAILABLE', 'YOGA');
IF NOT EXISTS (SELECT 1 FROM dbo.treatment_room WHERE room_name = N'Physio Rehab Room 1')
    INSERT INTO dbo.treatment_room (room_name, status, category) VALUES (N'Physio Rehab Room 1', 'AVAILABLE', 'PHYSIO');

-- Fix Spa Services
UPDATE dbo.spa_services SET name = N'Massage đá muối nóng Himalaya (90 phút)', description = N'Massage trị liệu toàn thân bằng đá muối nóng Himalaya giúp giải tỏa hoàn toàn mọi căng thẳng và phục hồi sinh khí.', category = 'SPA', price = 1200000.00, duration_minutes = 90 WHERE service_id = 1;
UPDATE dbo.spa_services SET name = N'Tắm lá thuốc người Dao Đỏ', description = N'Tắm lá thuốc người Dao Đỏ hỗ trợ tuần hoàn, thải độc, lưu thông khí huyết và mang lại giấc ngủ ngon.', category = 'SPA', price = 600000.00, duration_minutes = 45 WHERE service_id = 2;
UPDATE dbo.spa_services SET name = N'Nắn chỉnh cột sống Chiropractic', description = N'Nắn chỉnh Chiropractic chuyên khoa cột sống giúp điều chỉnh đốt sống lệch, kéo giãn cột sống thắt lưng chống đau mỏi thoái hóa.', category = 'THERAPY', price = 1500000.00, duration_minutes = 60 WHERE service_id = 3;

SET IDENTITY_INSERT dbo.spa_services ON;

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 4)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (4, N'Massage toàn thân tinh dầu sen trắng (60 phút)', N'Liệu trình massage toàn thân kết hợp tinh dầu hoa sen trắng nhẹ nhàng dưỡng ẩm sâu và đem lại giấc ngủ ngon lành.', 'SPA', 800000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 5)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (5, N'Massage Shiatsu bấm huyệt Nhật Bản (60 phút)', N'Massage Shiatsu bấm huyệt Nhật Bản giúp kích thích lưu thông khí huyết, giải tỏa căng thẳng sâu cơ khớp.', 'SPA', 900000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 6)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (6, N'Massage hương trầm tự nhiên (75 phút)', N'Trải nghiệm massage sang trọng kết hợp hương trầm tự nhiên Ngũ Sơn giúp thư giãn tinh thần và kích thích tuần hoàn.', 'SPA', 1000000.00, 75, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 7)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (7, N'Xông hơi thảo dược hoàng cung', N'Xông hơi thảo dược tươi hoàng cung giúp đào thải độc tố qua da và mang lại làn da hồng hào, sảng khoái.', 'SPA', 400000.00, 30, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 8)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (8, N'Lớp học Hatha Yoga cá nhân hóa 1-1', N'Lớp tập yoga 1-1 hướng dẫn trực tiếp bởi huấn luyện viên, cá nhân hóa động tác phục hồi thể chất.', 'YOGA', 500000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 9)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (9, N'Thiền hành & Thiền chuông xoay Tây Tạng', N'Liệu pháp chữa lành bằng âm thanh chuông xoay Tây Tạng kết hợp thiền hành giúp cân bằng luân xa và tĩnh lặng tâm trí.', 'YOGA', 450000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 10)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (10, N'Tập thở kiểm soát năng lượng Pranayama', N'Phương pháp thở cổ xưa giúp điều hòa nhịp tim, thanh lọc phổi và tối ưu hóa năng lượng sống.', 'YOGA', 350000.00, 45, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 11)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (11, N'Huấn luyện thiền giấc ngủ Yoga Nidra', N'Kỹ thuật dẫn dụ giấc ngủ sâu thư giãn hệ thần kinh tối đa, hỗ trợ đặc trị mất ngủ mãn tính.', 'YOGA', 400000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 12)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (12, N'Lớp học Restorative Yoga phục hồi', N'Lớp yoga phục hồi sử dụng dụng cụ hỗ trợ nhằm thư giãn hoàn toàn cơ bắp và phục hồi năng lượng luân xa.', 'YOGA', 550000.00, 75, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 13)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (13, N'Ấn huyệt đả thông kinh lạc cổ vai gáy (75 phút)', N'Liệu pháp bấm huyệt Đông y giải tỏa các điểm tắc nghẽn cơ vai gáy kinh niên cho người làm việc văn phòng.', 'THERAPY', 1200000.00, 75, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 14)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (14, N'Giãn cơ sâu bằng máy sóng xung kích', N'Vật lý trị liệu ứng dụng sóng xung kích giúp làm mềm dải xơ cơ co thắt, hỗ trợ phục hồi cơ khớp sau hoạt động.', 'THERAPY', 1400000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 15)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (15, N'Châm cứu & Xung điện phục hồi xung thần kinh', N'Kỹ thuật châm cứu kết hợp xung điện y học giúp kích thích phục hồi chức năng dây thần kinh vận động.', 'THERAPY', 950000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 16)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (16, N'Châm cứu ngải thảo dược ấm đầu cổ gáy', N'Châm cứu kết hợp hơ ngải cứu nóng giúp giãn mạch, hoạt huyết, giảm stress cực hạn và đau nhức vùng cổ vai đầu.', 'THERAPY', 850000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 17)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (17, N'Massage dẫn lưu cơ học hệ bạch huyết toàn diện', N'Liệu pháp kích thích tuần hoàn lưu thông bạch huyết nhằm tăng cường hệ thống miễn dịch và đào thải độc tố tích tụ.', 'THERAPY', 1600000.00, 90, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 18)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (18, N'Khu vui chơi trẻ em', N'Bao gồm công viên nước và tất cả các trò chơi trẻ em hay chơi với giá trị là 500k.', 'PLAYGROUND', 400000.00, 120, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 19)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (19, N'Tắm lá thuốc Dao Đỏ cho trẻ (5-12 tuổi)', N'Liệu trình ngâm tắm lá thuốc Dao Đỏ thảo dược thiên nhiên ôn hòa giúp bé tăng cường sức đề kháng và có giấc ngủ sâu hơn. (Giảm 30% so với người lớn)', 'THERAPY', 420000.00, 45, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 20)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (20, N'Massage toàn thân tinh dầu tràm kháng khuẩn (5-12 tuổi)', N'Liệu trình massage nhẹ nhàng kết hợp tinh dầu tràm gió kháng khuẩn giúp làm ấm cơ thể và bảo vệ hệ hô hấp cho bé. (Giảm 30% so với người lớn)', 'SPA', 560000.00, 60, 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE service_id = 21)
    INSERT INTO dbo.spa_services (service_id, name, description, category, price, duration_minutes, status)
    VALUES (21, N'Nắn chỉnh tư thế & Giãn cơ cột sống học đường (5-12 tuổi)', N'Liệu trình nắn chỉnh tư thế nhẹ nhàng, phòng ngừa gù lưng, cong vẹo cột sống do ngồi học sai tư thế cho trẻ em. (Giảm 30% so với người lớn)', 'THERAPY', 840000.00, 45, 'ACTIVE');

SET IDENTITY_INSERT dbo.spa_services OFF;


-- Fix Food Menu
UPDATE dbo.food_menu SET dish_name = N'Organic Avocado Quinoa Salad', description = N'Salad diêm mạch hữu cơ với bơ sáp cắt lát, hạt bí ngô và sốt chanh mật ong.', dietary_tags = N'Vegan, Gluten-Free' WHERE food_id = 1;
UPDATE dbo.food_menu SET dish_name = N'Ginseng Chicken Soup', description = N'Canh gà hầm sâm và táo đỏ bổ trung ích khí, hỗ trợ phục hồi sức khỏe.', dietary_tags = N'Keto, Healthy' WHERE food_id = 2;
UPDATE dbo.food_menu SET dish_name = N'Green Detox Juice', description = N'Nước ép giải độc gan từ cần tây hữu cơ, táo xanh, cải xoăn và gừng.', dietary_tags = N'Vegan, Detox' WHERE food_id = 3;

-- Fix Feedback
UPDATE dbo.feedback SET comment = N'Dịch vụ nghỉ dưỡng trị liệu tuyệt vời! Đội ngũ nhân viên y tế chu đáo, thực đơn sạch sẽ và chuyên sâu.' WHERE feedback_id = 1;

-- Fix legacy paid invoices' amount_due (CK_invoice_due_calc: amount_due = final_amount - deposit_amount)
UPDATE dbo.invoice SET deposit_amount = final_amount, amount_due = 0 WHERE status = 'PAID';

-- Kid retreat packages
SET IDENTITY_INSERT dbo.retreat_packages ON;

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 22)
    INSERT INTO dbo.retreat_packages (package_id, name, description, duration_days, price, includes, status, created_at, package_name, base_price, duration_text, goal, image_url)
    VALUES (22, N'Gói Tắm lá thuốc Dao Đỏ cho trẻ (5-12 tuổi)', N'Liệu trình ngâm tắm lá thuốc Dao Đỏ thảo dược thiên nhiên ôn hòa giúp bé tăng cường sức đề kháng và có giấc ngủ sâu hơn. (Giảm 30% so với người lớn)', 1, 420000.00, N'Tắm lá thuốc Dao Đỏ cho trẻ (5-12 tuổi);Massage đầu vai cổ nhẹ nhàng;Trà thảo dược mật ong thanh nhiệt', 'ACTIVE', GETDATE(), N'Red Dao Herbal Bath for Kids', 420000.00, N'1 ngày', 'KID', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80');

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 23)
    INSERT INTO dbo.retreat_packages (package_id, name, description, duration_days, price, includes, status, created_at, package_name, base_price, duration_text, goal, image_url)
    VALUES (23, N'Gói Massage toàn thân tinh dầu tràm kháng khuẩn (5-12 tuổi)', N'Liệu trình massage nhẹ nhàng kết hợp tinh dầu tràm gió kháng khuẩn giúp làm ấm cơ thể và bảo vệ hệ hô hấp cho bé. (Giảm 30% so với người lớn)', 1, 560000.00, N'Massage toàn thân tràm kháng khuẩn (5-12 tuổi);Liệu pháp xông chân thảo dược;Trà gừng mật ong giữ ấm cơ thể', 'ACTIVE', GETDATE(), N'Antibacterial Cajeput Oil Body Massage for Kids', 560000.00, N'1 ngày', 'KID', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80');

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 24)
    INSERT INTO dbo.retreat_packages (package_id, name, description, duration_days, price, includes, status, created_at, package_name, base_price, duration_text, goal, image_url)
    VALUES (24, N'Gói Nắn chỉnh tư thế & Giãn cơ cột sống học đường (5-12 tuổi)', N'Liệu trình nắn chỉnh tư thế nhẹ nhàng, phòng ngừa gù lưng, cong vẹo cột sống do ngồi học sai tư thế cho trẻ em. (Giảm 30% so với người lớn)', 1, 840000.00, N'Nắn chỉnh Chiropractic học đường (5-12 tuổi);Giãn cơ sâu kéo giãn cột sống lưng;Hướng dẫn ngồi học chuẩn y khoa', 'ACTIVE', GETDATE(), N'School Posture Alignment & Spine Stretching for Kids', 840000.00, N'1 ngày', 'KID', 'https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&w=800&q=80');

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE package_id = 25)
    INSERT INTO dbo.retreat_packages (package_id, name, description, duration_days, price, includes, status, created_at, package_name, base_price, duration_text, goal, image_url)
    VALUES (25, N'Vé Khu Vui Chơi Trẻ Em', N'Bao gồm công viên nước và tất cả các trò chơi trẻ em hay chơi với trị giá là 500k.', 1, 400000.00, N'Vé vào cổng công viên nước;Trò chơi trẻ em đa dạng;Đảm bảo an toàn cho bé', 'ACTIVE', GETDATE(), N'Kids Playground Ticket', 400000.00, N'1 ngày', 'KID', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80');

SET IDENTITY_INSERT dbo.retreat_packages OFF;
GO

-- Refactor guest room numbers to start with '#'
IF OBJECT_ID('dbo.room', 'U') IS NOT NULL
BEGIN
    UPDATE dbo.room SET room_number = REPLACE(room_number, 'BG-', '#S') WHERE room_number LIKE 'BG-%';
    UPDATE dbo.room SET room_number = REPLACE(room_number, 'BD-', '#V') WHERE room_number LIKE 'BD-%';
    UPDATE dbo.room SET room_number = REPLACE(room_number, 'BT-', '#P') WHERE room_number LIKE 'BT-%';
    UPDATE dbo.room SET room_number = REPLACE(room_number, 'BS-', '#F') WHERE room_number LIKE 'BS-%';
    UPDATE dbo.room SET room_number = REPLACE(room_number, 'NS-', '#NS') WHERE room_number LIKE 'NS-%';
    UPDATE dbo.room SET room_number = REPLACE(room_number, 'NC-', '#NC') WHERE room_number LIKE 'NC-%';
END
GO

IF OBJECT_ID('dbo.complaints', 'U') IS NOT NULL
BEGIN
    UPDATE dbo.complaints SET room_number = REPLACE(room_number, 'BG-', '#S') WHERE room_number LIKE 'BG-%';
    UPDATE dbo.complaints SET room_number = REPLACE(room_number, 'BD-', '#V') WHERE room_number LIKE 'BD-%';
    UPDATE dbo.complaints SET room_number = REPLACE(room_number, 'BT-', '#P') WHERE room_number LIKE 'BT-%';
    UPDATE dbo.complaints SET room_number = REPLACE(room_number, 'BS-', '#F') WHERE room_number LIKE 'BS-%';
    UPDATE dbo.complaints SET room_number = REPLACE(room_number, 'NS-', '#NS') WHERE room_number LIKE 'NS-%';
    UPDATE dbo.complaints SET room_number = REPLACE(room_number, 'NC-', '#NC') WHERE room_number LIKE 'NC-%';
END
GO

IF OBJECT_ID('dbo.incurred_services', 'U') IS NOT NULL
BEGIN
    UPDATE dbo.incurred_services SET room_number = REPLACE(room_number, 'BG-', '#S') WHERE room_number LIKE 'BG-%';
    UPDATE dbo.incurred_services SET room_number = REPLACE(room_number, 'BD-', '#V') WHERE room_number LIKE 'BD-%';
    UPDATE dbo.incurred_services SET room_number = REPLACE(room_number, 'BT-', '#P') WHERE room_number LIKE 'BT-%';
    UPDATE dbo.incurred_services SET room_number = REPLACE(room_number, 'BS-', '#F') WHERE room_number LIKE 'BS-%';
    UPDATE dbo.incurred_services SET room_number = REPLACE(room_number, 'NS-', '#NS') WHERE room_number LIKE 'NS-%';
    UPDATE dbo.incurred_services SET room_number = REPLACE(room_number, 'NC-', '#NC') WHERE room_number LIKE 'NC-%';
END
GO

-- ============================================================
-- Update CK_room_status constraint to include 'VIEWING' status
-- ============================================================
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_room_status' AND parent_object_id = OBJECT_ID('dbo.room'))
BEGIN
    ALTER TABLE dbo.room DROP CONSTRAINT CK_room_status;
END
GO
ALTER TABLE dbo.room ADD CONSTRAINT CK_room_status CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE','DIRTY','CLEANING','VACANT_NEEDS_CLEANING','VIEWING'));
GO

-- ============================================================
-- Create accompanying_guest table if it doesn't exist
-- ============================================================
IF OBJECT_ID('dbo.accompanying_guest', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.accompanying_guest (
        guest_id INT IDENTITY(1,1) PRIMARY KEY,
        booking_id INT NOT NULL,
        full_name NVARCHAR(100) NOT NULL,
        identity_document VARCHAR(255) NULL,
        relationship      NVARCHAR(50) NULL,
        is_child BIT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_accompanying_guest_booking FOREIGN KEY (booking_id) REFERENCES dbo.room_booking(booking_id) ON DELETE CASCADE
    );
END
GO

-- ============================================================
-- Fix booking #19 and its food orders status to be active / pending
-- ============================================================
IF EXISTS (SELECT 1 FROM dbo.room_booking WHERE booking_id = 19)
BEGIN
    UPDATE dbo.room_booking SET status = 'CONFIRMED', total_deposit = 3750000.00 WHERE booking_id = 19;
    UPDATE dbo.food_order SET status = 'PREPARING' WHERE room_booking_id = 19;
END
GO


GO

