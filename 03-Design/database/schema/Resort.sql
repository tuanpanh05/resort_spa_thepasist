-- =========================================================================
-- SYSTEM: RESORT & SPA MANAGEMENT (N NSRMS)
-- DIALECT: MICROSOFT SQL SERVER (T-SQL)
-- PURPOSE: Database Schema & Seed Data Focused on Module 5 Payment & Feedback
-- =========================================================================

IF DB_ID('ResortSpaDB') IS NULL
BEGIN
    CREATE DATABASE ResortSpaDB;
END
GO
USE ResortSpaDB;
GO

-- =========================================================================
-- 1. DROP EXISTING TABLES (CHILDREN FIRST)
-- =========================================================================

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
IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL DROP TABLE dbo.[User];
GO

-- =========================================================================
-- 2. CREATE TABLES (PARENTS FIRST)
-- =========================================================================

-- 2.1 Users Table
CREATE TABLE dbo.users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    id_passport_encrypted VARCHAR(MAX),
    role VARCHAR(50) NOT NULL DEFAULT 'GUEST',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_users_role CHECK (role IN ('ADMIN', 'STAFF', 'THERAPIST', 'GUEST', 'MANAGER', 'RECEPTIONIST', 'CHEF', 'CUSTOMER')),
    CONSTRAINT CK_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'BANNED')),
    CONSTRAINT CK_users_email CHECK (email LIKE '%_@_%._%'),
    CONSTRAINT CK_users_phone CHECK (phone IS NULL OR phone LIKE '[0-9]%')
);
GO

-- 2.1a Medical Profile Table (Sensitive medical notes, 1-1 with User)
CREATE TABLE dbo.medical_profile (
    profile_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    physical_condition_encrypted NVARCHAR(MAX) NULL, -- Sensitive diagnosis details encrypted
    food_allergies_encrypted NVARCHAR(MAX) NULL, -- Allergy details encrypted
    explicit_consent_signed BIT NOT NULL DEFAULT 0, -- Decree 356/2025/ND-CP compliance flag
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_medical_profile_User FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE
);
GO

-- 2.2 Retreat Packages Table
CREATE TABLE dbo.retreat_packages (
    package_id INT IDENTITY(1,1) PRIMARY KEY,
    package_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    base_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    duration_days INT NOT NULL DEFAULT 1,

    CONSTRAINT CK_retreat_packages_price CHECK (base_price >= 0),
    CONSTRAINT CK_retreat_packages_duration CHECK (duration_days > 0)
);
GO

-- 2.3 Room Types Table
CREATE TABLE dbo.room_types (
    room_type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name NVARCHAR(255) NOT NULL UNIQUE,
    base_price DECIMAL(15,2) NULL,
    capacity INT NULL,

    CONSTRAINT CK_room_types_price CHECK (base_price IS NULL OR base_price >= 0),
    CONSTRAINT CK_room_types_capacity CHECK (capacity IS NULL OR capacity > 0)
);
GO

-- 2.4 Room Table
CREATE TABLE dbo.room (
    room_id INT IDENTITY(1,1) PRIMARY KEY,
    room_type_id INT NOT NULL REFERENCES dbo.room_types(room_type_id) ON DELETE NO ACTION,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT CK_room_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DIRTY', 'CLEANING'))
);
GO

-- 2.5 Room Booking Table
CREATE TABLE dbo.room_booking (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES dbo.users(user_id) ON DELETE NO ACTION,
    package_id INT REFERENCES dbo.retreat_packages(package_id) ON DELETE SET NULL,
    check_in_date DATETIME2 NOT NULL,
    check_out_date DATETIME2 NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_deposit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_room_booking_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT CK_room_booking_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    CONSTRAINT CK_room_booking_deposit CHECK (total_deposit >= 0)
);
GO

-- 2.6 Room Booking Detail Table
CREATE TABLE dbo.room_booking_detail (
    detail_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES dbo.room(room_id) ON DELETE NO ACTION,
    price_at_booking DECIMAL(15,2) NOT NULL,

    CONSTRAINT CK_room_booking_detail_price CHECK (price_at_booking >= 0)
);
GO

-- 2.7 Spa Services Table
CREATE TABLE dbo.spa_services (
    service_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    category VARCHAR(80) NULL,
    price DECIMAL(15,2) NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_spa_services_price CHECK (price >= 0),
    CONSTRAINT CK_spa_services_duration CHECK (duration_minutes > 0),
    CONSTRAINT CK_spa_services_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);
GO

-- 2.8 Treatment Room Table
CREATE TABLE dbo.treatment_room (
    treatment_room_id INT IDENTITY(1,1) PRIMARY KEY,
    room_name NVARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT CK_treatment_room_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'))
);
GO

-- 2.9 Spa Booking Table
CREATE TABLE dbo.spa_booking (
    spa_booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES dbo.users(user_id) ON DELETE NO ACTION,
    room_booking_id INT REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION,
    spa_id INT NOT NULL REFERENCES dbo.spa_services(service_id) ON DELETE NO ACTION,
    therapist_id INT NOT NULL REFERENCES dbo.users(user_id) ON DELETE NO ACTION,
    treatment_room_id INT NOT NULL REFERENCES dbo.treatment_room(treatment_room_id) ON DELETE NO ACTION,
    start_datetime DATETIME2 NOT NULL,
    end_datetime DATETIME2 NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    price_at_booking DECIMAL(15,2) NOT NULL,
    is_package_included BIT NOT NULL DEFAULT 0,

    CONSTRAINT CK_spa_booking_dates CHECK (end_datetime > start_datetime),
    CONSTRAINT CK_spa_booking_status CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NOSHOW', 'NO_SHOW')),
    CONSTRAINT CK_spa_booking_price CHECK (price_at_booking >= 0),
    CONSTRAINT CK_spa_booking_package CHECK (
        (is_package_included = 0) OR (is_package_included = 1 AND room_booking_id IS NOT NULL)
    )
);
GO

-- 2.10 Food Menu Table
CREATE TABLE dbo.food_menu (
    food_id INT IDENTITY(1,1) PRIMARY KEY,
    dish_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    dietary_tags NVARCHAR(255) NOT NULL,
    is_today_menu BIT NOT NULL DEFAULT 1,
    sold_out BIT NOT NULL DEFAULT 0,
    ingredients NVARCHAR(MAX) NULL,
    enabled BIT NOT NULL DEFAULT 1,

    CONSTRAINT CK_food_menu_price CHECK (price >= 0)
);
GO

-- 2.10b Package Food Limit Table
CREATE TABLE dbo.package_food_limit (
    package_food_id INT IDENTITY(1,1) PRIMARY KEY,
    package_id INT NOT NULL REFERENCES dbo.retreat_packages(package_id) ON DELETE CASCADE,
    food_id INT NOT NULL REFERENCES dbo.food_menu(food_id) ON DELETE CASCADE,
    quantity_per_day INT NOT NULL DEFAULT 1,

    CONSTRAINT CK_package_food_limit_qty CHECK (quantity_per_day > 0)
);
GO

-- 2.11 Food Order Table
CREATE TABLE dbo.food_order (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES dbo.users(user_id) ON DELETE NO ACTION,
    room_booking_id INT REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION,
    order_time DATETIME2 NOT NULL DEFAULT GETDATE(),
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT CK_food_order_status CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT CK_food_order_amount CHECK (total_amount >= 0)
);
GO

-- 2.12 Food Order Detail Table
CREATE TABLE dbo.food_order_detail (
    order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL REFERENCES dbo.food_order(order_id) ON DELETE CASCADE,
    food_id INT NOT NULL REFERENCES dbo.food_menu(food_id) ON DELETE NO ACTION,
    quantity INT NOT NULL DEFAULT 1,
    price_at_order DECIMAL(15,2) NOT NULL,
    special_note NVARCHAR(255) NULL,
    is_package_included BIT NOT NULL DEFAULT 0,

    CONSTRAINT CK_food_order_detail_qty CHECK (quantity > 0),
    CONSTRAINT CK_food_order_detail_price CHECK (price_at_order >= 0)
);
GO

-- 2.13 Invoice Table (Guest Folio Ledger)
CREATE TABLE dbo.invoice (
    invoice_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES dbo.users(user_id) ON DELETE NO ACTION,
    room_booking_id INT NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION,
    room_subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    spa_subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    food_subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_and_fees DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    final_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    deposit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    amount_due DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    vnpay_tran_id VARCHAR(100) NULL,
    payment_time DATETIME2 NULL,

    CONSTRAINT CK_invoice_room CHECK (room_subtotal >= 0),
    CONSTRAINT CK_invoice_spa CHECK (spa_subtotal >= 0),
    CONSTRAINT CK_invoice_food CHECK (food_subtotal >= 0),
    CONSTRAINT CK_invoice_tax CHECK (tax_and_fees >= 0),
    CONSTRAINT CK_invoice_final CHECK (final_amount >= 0),
    CONSTRAINT CK_invoice_deposit CHECK (deposit_amount >= 0),
    CONSTRAINT CK_invoice_due CHECK (amount_due >= 0),
    CONSTRAINT CK_invoice_deposit_limit CHECK (deposit_amount <= final_amount),
    CONSTRAINT CK_invoice_due_calculation CHECK (amount_due = final_amount - deposit_amount),
    CONSTRAINT CK_invoice_status CHECK (status IN ('UNPAID', 'PAID', 'CANCELLED')),
    CONSTRAINT UQ_invoice_room_booking UNIQUE (room_booking_id)
);
GO

-- 2.14 Payment Transaction Log Table (Audit Trail)
CREATE TABLE dbo.payment_transaction_log (
    log_id              INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id          INT NOT NULL REFERENCES dbo.invoice(invoice_id) ON DELETE NO ACTION,
    payment_method      VARCHAR(50)     NOT NULL,
    amount              DECIMAL(15,2)   NOT NULL,
    gateway_ref         VARCHAR(100)    NULL,
    response_code       VARCHAR(10)     NULL,
    status              VARCHAR(20)     NOT NULL,
    transaction_time    DATETIME2       NOT NULL DEFAULT GETDATE(),
    client_ip           VARCHAR(45)     NULL,

    CONSTRAINT CK_ptl_method CHECK (payment_method IN ('VNPAY', 'CASH', 'STRIPE', 'PAYPAL')),
    CONSTRAINT CK_ptl_status CHECK (status IN ('PAID', 'FAILED', 'REFUNDED')),
    CONSTRAINT CK_ptl_amount CHECK (amount >= 0)
);
GO

-- 2.15 Feedback Table
CREATE TABLE dbo.feedback (
    feedback_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES dbo.users(user_id) ON DELETE CASCADE,
    room_booking_id INT NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION,
    rating INT NOT NULL,
    comment NVARCHAR(MAX) NULL,
    is_toxic BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_feedback_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT UQ_feedback_room_booking UNIQUE (room_booking_id)
);
GO

-- =========================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================
CREATE INDEX IX_room_booking_User ON dbo.room_booking(user_id);
CREATE INDEX IX_spa_booking_Dates ON dbo.spa_booking(start_datetime, end_datetime);
CREATE INDEX IX_spa_booking_Therapist ON dbo.spa_booking(therapist_id);
CREATE INDEX IX_food_order_User ON dbo.food_order(user_id);
CREATE INDEX IX_invoice_Booking ON dbo.invoice(room_booking_id);
CREATE INDEX IX_ptl_invoice ON dbo.payment_transaction_log(invoice_id);
CREATE INDEX IX_ptl_gateway_ref ON dbo.payment_transaction_log(gateway_ref);
CREATE INDEX IX_ptl_transaction_time ON dbo.payment_transaction_log(transaction_time);

-- FK optimization indexes
CREATE INDEX IX_room_room_type ON dbo.room(room_type_id);
CREATE INDEX IX_room_booking_Package ON dbo.room_booking(package_id);
CREATE INDEX IX_room_booking_detail_Booking ON dbo.room_booking_detail(booking_id);
CREATE INDEX IX_room_booking_detail_Room ON dbo.room_booking_detail(room_id);
CREATE INDEX IX_spa_booking_User ON dbo.spa_booking(user_id);
CREATE INDEX IX_spa_booking_RoomBooking ON dbo.spa_booking(room_booking_id);
CREATE INDEX IX_spa_booking_SpaService ON dbo.spa_booking(spa_id);
CREATE INDEX IX_spa_booking_TreatmentRoom ON dbo.spa_booking(treatment_room_id);
CREATE INDEX IX_food_order_RoomBooking ON dbo.food_order(room_booking_id);
CREATE INDEX IX_food_order_detail_Order ON dbo.food_order_detail(order_id);
CREATE INDEX IX_food_order_detail_Food ON dbo.food_order_detail(food_id);
CREATE INDEX IX_invoice_User ON dbo.invoice(user_id);
CREATE INDEX IX_feedback_User ON dbo.feedback(user_id);
GO

-- =========================================================================
-- 4. SEED SAMPLE DATA FOR PAYMENT TESTING
-- =========================================================================

-- 4.1 Users (Passwords are BCrypt hashes of '123456')
INSERT INTO dbo.users (email, password_hash, full_name, phone, id_passport_encrypted, role, status) VALUES
('manager@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Quản Lý', '0901234567', 'U2FsdGVkX194QTA1V2g3SjcrREJpZz09', 'MANAGER', 'ACTIVE'),
('reception@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Lễ Tân', '0907654321', 'U2FsdGVkX1+2NzVhOGYzNWVlOTc4NmQ0', 'RECEPTIONIST', 'ACTIVE'),
('therapist1@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Bác Sĩ Hải - Trị Liệu', '0912345678', 'U2FsdGVkX19rN0g3YjhkOTM0OGRlM2Qx', 'THERAPIST', 'ACTIVE'),
('chef@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Bếp Trưởng', '0987654321', 'U2FsdGVkX1+zNTRjMmVkNDhjOGE5MmEx', 'CHEF', 'ACTIVE'),
('guest1@gmail.com', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Khách Hàng', '0933333333', 'U2FsdGVkX1+1MGZhYjI5ZGNkYThmMDEx', 'CUSTOMER', 'ACTIVE'),
('guest2@gmail.com', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Minh Châu', '0944444444', 'U2FsdGVkX1/bNzU0MDNkZWEwOGYxZTIz', 'CUSTOMER', 'ACTIVE'),
('guest3@gmail.com', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Hoàng Nam Anh', '0955555555', NULL, 'CUSTOMER', 'ACTIVE'),
('admin@nguson.com', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Admin He Thong', '0999999999', NULL, 'ADMIN', 'ACTIVE'),
('staff@nguson.com', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Staff Ngu Son', '0988888888', NULL, 'STAFF', 'ACTIVE');

-- 4.1a Insert Medical Profiles (Decree 356/2025 Explicit consent signed)
-- NOTE: food_allergies_encrypted uses English keywords in parentheses to avoid sqlcmd NVARCHAR encoding issues.
-- AESUtil.decrypt() extracts the text inside parentheses; backend matching logic checks for 'peanut'/'seafood'.
INSERT INTO dbo.medical_profile (user_id, physical_condition_encrypted, food_allergies_encrypted, explicit_consent_signed) VALUES
(5, N'U2FsdGVkX19oQ1Z0M2o0U1hVdk82UT09 (lower back pain)', N'U2FsdGVkX19MOG85TjBkNmJkWT09 (peanut)', 1),
(6, N'U2FsdGVkX19hdmRjMTIzNGE4Zjk4ZDAw (stress and insomnia)', N'U2FsdGVkX19zZGYzMjRhOGY5OGQwMDk4 (seafood)', 1);

-- 4.2 Retreat Packages
INSERT INTO dbo.retreat_packages (package_name, description, base_price, duration_days) VALUES
(N'5-day Detox Journey', N'Gói giải độc cơ thể toàn diện 5 ngày 4 đêm, bao gồm ẩm thực dưỡng sinh riêng biệt và 3 buổi trị liệu chuyên sâu.', 12500000.00, 5),
(N'Mindfulness & Yoga Weekend', N'Gói thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm, hỗ trợ giảm stress và tái tạo năng lượng.', 7800000.00, 3);

-- 4.3 Room Types
INSERT INTO dbo.room_types (type_name, base_price, capacity) VALUES
(N'Standard Room 1 King Bed', 1800000.00, 2),
(N'Vip Villa 1-Bedroom Pool', 4500000.00, 2),
(N'Presidential Suite 2-Bedroom', 12000000.00, 4);

-- 4.4 Rooms
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(1, 'Room-102', 'AVAILABLE'),
(2, 'Villa-101', 'AVAILABLE'),
(2, 'Villa-102', 'AVAILABLE'),
(3, 'President-501', 'AVAILABLE');

-- 4.5 Room Bookings
INSERT INTO dbo.room_booking (user_id, package_id, check_in_date, check_out_date, status, total_deposit) VALUES
(5, 1, DATEADD(day, 1, GETDATE()), DATEADD(day, 6, GETDATE()), 'CONFIRMED', 3750000.00),
(6, NULL, DATEADD(day, 2, GETDATE()), DATEADD(day, 4, GETDATE()), 'CONFIRMED', 2700000.00);

-- 4.6 Booking Details
INSERT INTO dbo.room_booking_detail (booking_id, room_id, price_at_booking) VALUES
(1, 2, 4500000.00),
(2, 3, 4500000.00);

-- 4.7 Spa Services (Master Data)
INSERT INTO dbo.spa_services (name, description, price, duration_minutes, status) VALUES
(N'Hot Volcanic Stone Massage', N'Massage trị liệu toàn thân bằng đá núi lửa nóng giúp giảm đau mỏi cơ xương khớp.', 1200000.00, 90, 'ACTIVE'),
(N'Dao Red Leaf Herbal Bath', N'Tắm lá thuốc người Dao Đỏ hỗ trợ lưu thông khí huyết và thư giãn ngủ ngon.', 600000.00, 45, 'ACTIVE'),
(N'Spinal Adjustment Therapy', N'Liệu trình nắn chỉnh và kéo giãn cột sống thắt lưng chống đau mỏi thoái hóa.', 1500000.00, 60, 'ACTIVE');

-- 4.8 Treatment Rooms
INSERT INTO dbo.treatment_room (room_name, status) VALUES
(N'Therapy Room A', 'AVAILABLE'),
(N'Therapy Room B', 'AVAILABLE'),
(N'Red Dao Bath Room 1', 'AVAILABLE');

-- 4.9 Spa Bookings
INSERT INTO dbo.spa_booking (user_id, room_booking_id, spa_id, therapist_id, treatment_room_id, start_datetime, end_datetime, status, price_at_booking, is_package_included) VALUES
(5, 1, 1, 3, 1, DATEADD(hour, 14, DATEADD(day, 2, GETDATE())), DATEADD(minute, 990, DATEADD(day, 2, GETDATE())), 'CONFIRMED', 1200000.00, 1),
(6, 2, 3, 3, 2, DATEADD(hour, 10, DATEADD(day, 3, GETDATE())), DATEADD(hour, 11, DATEADD(day, 3, GETDATE())), 'CONFIRMED', 1500000.00, 0);

-- 4.10 Food Menu (Master Data)
INSERT INTO dbo.food_menu (dish_name, description, price, dietary_tags, is_today_menu, sold_out) VALUES
(N'Organic Avocado Quinoa Salad', N'Salad diem mach huu co voi bo sap cat lat, hat bi ngo va sot chanh mat ong.', 180000.00, 'Vegan, Gluten-Free', 1, 0),
(N'Ginseng Chicken Soup', N'Canh ga ham sam va tao do bo trung ich khi, ho tro phuc hoi suc khoe.', 320000.00, 'Keto, Healthy', 1, 0),
(N'Green Detox Juice', N'Nuoc ep giai doc gan tu can tay huu co, tao xanh, cai xoan va gung.', 95000.00, 'Vegan, Detox', 1, 0),
(N'Nam nuong la lot cot dua', N'Nam dui ga cuon la lot nuong than hoa, dau phong rang gion.', 320000.00, 'Vegan, Peanut', 1, 0),
(N'Tom rim toi ot (Mon man)', N'Tom su bien tuoi rim toi ot thom lung, giau protein.', 390000.00, 'Healthy, Seafood', 1, 0);

-- 4.11 Food Orders
INSERT INTO dbo.food_order (user_id, room_booking_id, order_time, status, total_amount) VALUES
(5, 1, DATEADD(hour, 18, DATEADD(day, 1, GETDATE())), 'DELIVERED', 595000.00),
(6, 2, DATEADD(hour, 8, DATEADD(day, 2, GETDATE())), 'DELIVERED', 415000.00);

-- 4.12 Food Order Details
INSERT INTO dbo.food_order_detail (order_id, food_id, quantity, price_at_order, special_note, is_package_included) VALUES
(1, 1, 1, 180000.00, N'Dị ứng đậu phộng, không bỏ các loại hạt đậu khác', 1),
(1, 2, 1, 320000.00, NULL, 0),
(1, 3, 1, 95000.00, NULL, 1),
(2, 2, 1, 320000.00, N'Không bỏ bột ngọt', 0),
(2, 3, 1, 95000.00, NULL, 0);

-- 4.12b Package Food Limit Data
INSERT INTO dbo.package_food_limit (package_id, food_id, quantity_per_day) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 2);

-- 4.13 Invoices
INSERT INTO dbo.invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status, vnpay_tran_id, payment_time) VALUES
(5, 1, 12500000.00, 0.00, 320000.00, 1282000.00, 14102000.00, 3750000.00, 10352000.00, 'UNPAID', NULL, NULL);

-- 4.14 Second Invoice for payment testing (UC21, UC22)
INSERT INTO dbo.invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status, vnpay_tran_id, payment_time) VALUES
(6, 2, 9000000.00, 1500000.00, 415000.00, 1091500.00, 12006500.00, 2700000.00, 9306500.00, 'UNPAID', NULL, NULL);

-- 4.15 Payment Transaction Log (BR-26 Audit Trail)
INSERT INTO dbo.payment_transaction_log (invoice_id, payment_method, amount, gateway_ref, response_code, status, transaction_time, client_ip) VALUES
(1, 'VNPAY', 3750000.00, 'VNP-DEPOSIT-001', '00', 'PAID', DATEADD(day, -7, GETDATE()), '127.0.0.1');

-- 4.16 Feedback
INSERT INTO dbo.feedback (user_id, room_booking_id, rating, comment, is_toxic) VALUES
(5, 1, 5, N'Dịch vụ nghỉ dưỡng trị liệu tuyệt vời! Đội ngũ nhân viên y tế chu đáo, thực đơn sạch sẽ và chuyên sâu.', 0);
GO