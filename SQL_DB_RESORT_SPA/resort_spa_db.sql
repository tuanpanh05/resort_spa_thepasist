-- =========================================================================
-- Project: Ngu Son Resort & Spa Management System (NSRMS)
-- Database Dialect: Microsoft SQL Server
-- Purpose: Complete Database Schema Design with constraints and seed data.
-- File Location: SQL_DB_RESORT_SPA/resort_spa_db.sql
-- =========================================================================

/*
-- UNCOMMENT THIS BLOCK IF YOU WANT TO CREATE A NEW DATABASE
CREATE DATABASE ResortSpaDB;
GO
USE ResortSpaDB;
GO
*/

-- ==========================================
-- 1. DROP EXISTING TABLES (CHILDREN FIRST)
-- ==========================================

IF OBJECT_ID('dbo.feedback', 'U') IS NOT NULL DROP TABLE dbo.feedback;
IF OBJECT_ID('dbo.blog', 'U') IS NOT NULL DROP TABLE dbo.blog;
IF OBJECT_ID('dbo.invoice', 'U') IS NOT NULL DROP TABLE dbo.invoice;
IF OBJECT_ID('dbo.food_order_detail', 'U') IS NOT NULL DROP TABLE dbo.food_order_detail;
IF OBJECT_ID('dbo.food_order', 'U') IS NOT NULL DROP TABLE dbo.food_order;
IF OBJECT_ID('dbo.package_food_limit', 'U') IS NOT NULL DROP TABLE dbo.package_food_limit;
IF OBJECT_ID('dbo.food_menu', 'U') IS NOT NULL DROP TABLE dbo.food_menu;
IF OBJECT_ID('dbo.cart_item', 'U') IS NOT NULL DROP TABLE dbo.cart_item;
IF OBJECT_ID('dbo.spa_booking', 'U') IS NOT NULL DROP TABLE dbo.spa_booking;
IF OBJECT_ID('dbo.treatment_room', 'U') IS NOT NULL DROP TABLE dbo.treatment_room;
IF OBJECT_ID('dbo.package_spa_limit', 'U') IS NOT NULL DROP TABLE dbo.package_spa_limit;
IF OBJECT_ID('dbo.spa_service', 'U') IS NOT NULL DROP TABLE dbo.spa_service;
IF OBJECT_ID('dbo.room_guest_declaration', 'U') IS NOT NULL DROP TABLE dbo.room_guest_declaration;
IF OBJECT_ID('dbo.room_booking_detail', 'U') IS NOT NULL DROP TABLE dbo.room_booking_detail;
IF OBJECT_ID('dbo.room_booking', 'U') IS NOT NULL DROP TABLE dbo.room_booking;
IF OBJECT_ID('dbo.room', 'U') IS NOT NULL DROP TABLE dbo.room;
IF OBJECT_ID('dbo.room_type', 'U') IS NOT NULL DROP TABLE dbo.room_type;
IF OBJECT_ID('dbo.retreat_package', 'U') IS NOT NULL DROP TABLE dbo.retreat_package;
IF OBJECT_ID('dbo.work_schedule', 'U') IS NOT NULL DROP TABLE dbo.work_schedule;
IF OBJECT_ID('dbo.refresh_token', 'U') IS NOT NULL DROP TABLE dbo.refresh_token;
IF OBJECT_ID('dbo.medical_profile', 'U') IS NOT NULL DROP TABLE dbo.medical_profile;
IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL DROP TABLE dbo.[User];

-- ==========================================
-- 2. CREATE TABLES (PARENTS FIRST)
-- ==========================================

-- 2.1 [User] Table (delimited because USER is a reserved word)
CREATE TABLE dbo.[User] (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_passport_encrypted VARCHAR(MAX) NOT NULL, -- AES-256 encrypted string for police declaration compliance
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT CK_User_Role CHECK (role IN ('MANAGER', 'RECEPTIONIST', 'THERAPIST', 'CHEF', 'CUSTOMER')),
    CONSTRAINT CK_User_Status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 2.2 [medical_profile] Table (Sensitive medical notes, 1-1 with User)
CREATE TABLE dbo.medical_profile (
    profile_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    physical_condition_encrypted VARCHAR(MAX) NULL, -- Sensitive diagnosis details encrypted
    food_allergies_encrypted VARCHAR(MAX) NULL, -- Allergy details encrypted
    explicit_consent_signed BIT NOT NULL DEFAULT 0, -- Decree 356/2025/ND-CP compliance flag
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_medical_profile_User FOREIGN KEY (user_id) REFERENCES dbo.[User](user_id) ON DELETE CASCADE
);

-- 2.3 [refresh_token] Table (Session & authentication tokens)
CREATE TABLE dbo.refresh_token (
    token_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_refresh_token_User FOREIGN KEY (user_id) REFERENCES dbo.[User](user_id) ON DELETE CASCADE
);

-- 2.4 [work_schedule] Table (Staff shifts tracking)
CREATE TABLE dbo.work_schedule (
    schedule_id INT IDENTITY(1,1) PRIMARY KEY,
    staff_id INT NOT NULL,
    work_date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    
    CONSTRAINT CK_work_schedule_Status CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT FK_work_schedule_User FOREIGN KEY (staff_id) REFERENCES dbo.[User](user_id) ON DELETE CASCADE
);

-- 2.5 [retreat_package] Table (Master Data: GWI-compliant packages)
CREATE TABLE dbo.retreat_package (
    package_id INT IDENTITY(1,1) PRIMARY KEY,
    package_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    base_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    duration_days INT NOT NULL,
    
    CONSTRAINT CK_retreat_package_Price CHECK (base_price >= 0),
    CONSTRAINT CK_retreat_package_Duration CHECK (duration_days > 0)
);

-- 2.6 [room_type] Table (Master Data: Room tiers)
CREATE TABLE dbo.room_type (
    room_type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name NVARCHAR(255) NOT NULL,
    base_price DECIMAL(15,2) NULL, -- Standard nightly rate if booked outside package
    capacity INT NULL, -- Safe guest occupancy limit
    
    CONSTRAINT CK_room_type_Price CHECK (base_price IS NULL OR base_price >= 0),
    CONSTRAINT CK_room_type_Capacity CHECK (capacity IS NULL OR capacity > 0)
);

-- 2.7 [room] Table (Physical Rooms / Villas assets)
CREATE TABLE dbo.room (
    room_id INT IDENTITY(1,1) PRIMARY KEY,
    room_type_id INT NOT NULL,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    
    CONSTRAINT CK_room_Status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DIRTY')),
    CONSTRAINT FK_room_room_type FOREIGN KEY (room_type_id) REFERENCES dbo.room_type(room_type_id) ON DELETE NO ACTION
);

-- 2.8 [room_booking] Table (Master reservation folio)
CREATE TABLE dbo.room_booking (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NULL, -- NULL indicates room-only booking
    check_in_date DATETIME2 NOT NULL,
    check_out_date DATETIME2 NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_deposit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT CK_room_booking_Dates CHECK (check_out_date > check_in_date),
    CONSTRAINT CK_room_booking_Status CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    CONSTRAINT CK_room_booking_Deposit CHECK (total_deposit >= 0),
    CONSTRAINT FK_room_booking_User FOREIGN KEY (user_id) REFERENCES dbo.[User](user_id) ON DELETE NO ACTION,
    CONSTRAINT FK_room_booking_retreat_package FOREIGN KEY (package_id) REFERENCES dbo.retreat_package(package_id) ON DELETE SET NULL
);

-- 2.9 [room_booking_detail] Table (Villas associated with a booking)
CREATE TABLE dbo.room_booking_detail (
    detail_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    room_id INT NOT NULL,
    price_at_booking DECIMAL(15,2) NOT NULL, -- Locked room price at reservation time
    
    CONSTRAINT CK_room_booking_detail_Price CHECK (price_at_booking >= 0),
    CONSTRAINT FK_room_booking_detail_room_booking FOREIGN KEY (booking_id) REFERENCES dbo.room_booking(booking_id) ON DELETE CASCADE,
    CONSTRAINT FK_room_booking_detail_room FOREIGN KEY (room_id) REFERENCES dbo.room(room_id) ON DELETE NO ACTION
);

-- 2.10 [room_guest_declaration] Table (Police compliance check-in logs)
CREATE TABLE dbo.room_guest_declaration (
    declaration_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_detail_id INT NOT NULL,
    guest_full_name NVARCHAR(255) NOT NULL,
    guest_id_passport_encrypted VARCHAR(MAX) NOT NULL, -- AES encrypted passport string
    declared_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_room_guest_declaration_detail FOREIGN KEY (booking_detail_id) REFERENCES dbo.room_booking_detail(detail_id) ON DELETE CASCADE
);

-- 2.11 [spa_service] Table (Master Data: Spa service listings)
CREATE TABLE dbo.spa_service (
    spa_id INT IDENTITY(1,1) PRIMARY KEY,
    service_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    price DECIMAL(15,2) NOT NULL, -- Retail standard price
    duration_minutes INT NOT NULL,
    
    CONSTRAINT CK_spa_service_Price CHECK (price >= 0),
    CONSTRAINT CK_spa_service_Duration CHECK (duration_minutes > 0)
);

-- 2.12 [package_spa_limit] Table (Configures complimentary spa services bundled in retreat packages)
CREATE TABLE dbo.package_spa_limit (
    package_spa_id INT IDENTITY(1,1) PRIMARY KEY,
    package_id INT NOT NULL,
    spa_id INT NOT NULL,
    quantity_included INT NOT NULL DEFAULT 1,
    
    CONSTRAINT CK_package_spa_limit_Qty CHECK (quantity_included >= 0),
    CONSTRAINT FK_package_spa_limit_package FOREIGN KEY (package_id) REFERENCES dbo.retreat_package(package_id) ON DELETE CASCADE,
    CONSTRAINT FK_package_spa_limit_spa FOREIGN KEY (spa_id) REFERENCES dbo.spa_service(spa_id) ON DELETE CASCADE
);

-- 2.13 [treatment_room] Table (Spa spaces assets)
CREATE TABLE dbo.treatment_room (
    treatment_room_id INT IDENTITY(1,1) PRIMARY KEY,
    room_name NVARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    
    CONSTRAINT CK_treatment_room_Status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE'))
);

-- 2.14 [spa_booking] Table (Spa scheduling engine - maps customer, therapist, and room)
CREATE TABLE dbo.spa_booking (
    spa_booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    room_booking_id INT NULL, -- NULL represents walk-in customers
    spa_id INT NOT NULL,
    therapist_id INT NOT NULL, -- User ID where role = 'THERAPIST'
    treatment_room_id INT NOT NULL,
    start_datetime DATETIME2 NOT NULL,
    end_datetime DATETIME2 NOT NULL,
    status VARCHAR(50) NOT NULL,
    price_at_booking DECIMAL(15,2) NOT NULL,
    is_package_included BIT NOT NULL DEFAULT 0, -- 1 if cost is absorbed by retreat package
    
    CONSTRAINT CK_spa_booking_Dates CHECK (end_datetime > start_datetime),
    CONSTRAINT CK_spa_booking_Status CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NOSHOW')),
    CONSTRAINT CK_spa_booking_Price CHECK (price_at_booking >= 0),
    CONSTRAINT FK_spa_booking_User FOREIGN KEY (user_id) REFERENCES dbo.[User](user_id) ON DELETE NO ACTION,
    CONSTRAINT FK_spa_booking_room_booking FOREIGN KEY (room_booking_id) REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION,
    CONSTRAINT FK_spa_booking_spa_service FOREIGN KEY (spa_id) REFERENCES dbo.spa_service(spa_id) ON DELETE NO ACTION,
    CONSTRAINT FK_spa_booking_therapist FOREIGN KEY (therapist_id) REFERENCES dbo.[User](user_id) ON DELETE NO ACTION,
    CONSTRAINT FK_spa_booking_treatment_room FOREIGN KEY (treatment_room_id) REFERENCES dbo.treatment_room(treatment_room_id) ON DELETE NO ACTION
);

-- 2.15 [cart_item] Table (Temporary customer shopping cart)
CREATE TABLE dbo.cart_item (
    cart_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_id INT NOT NULL, -- ID pointing to room_type, spa_service, or food_menu
    quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT CK_cart_item_Type CHECK (item_type IN ('ROOM', 'SPA', 'FOOD')),
    CONSTRAINT CK_cart_item_Qty CHECK (quantity > 0),
    CONSTRAINT FK_cart_item_User FOREIGN KEY (user_id) REFERENCES dbo.[User](user_id) ON DELETE CASCADE
);

-- 2.16 [food_menu] Table (Master Data: Healthy dietary items)
CREATE TABLE dbo.food_menu (
    food_id INT IDENTITY(1,1) PRIMARY KEY,
    dish_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    price DECIMAL(15,2) NOT NULL, -- Retail price if ordered à la carte
    dietary_tags NVARCHAR(255) NOT NULL, -- e.g., 'Vegan, Keto, Gluten-Free'
    
    CONSTRAINT CK_food_menu_Price CHECK (price >= 0)
);

-- 2.17 [package_food_limit] Table (Configures complimentary daily food allowances bundled in packages)
CREATE TABLE dbo.package_food_limit (
    package_food_id INT IDENTITY(1,1) PRIMARY KEY,
    package_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity_per_day INT NOT NULL DEFAULT 1,
    
    CONSTRAINT CK_package_food_limit_Qty CHECK (quantity_per_day >= 0),
    CONSTRAINT FK_package_food_limit_package FOREIGN KEY (package_id) REFERENCES dbo.retreat_package(package_id) ON DELETE CASCADE,
    CONSTRAINT FK_package_food_limit_food FOREIGN KEY (food_id) REFERENCES dbo.food_menu(food_id) ON DELETE CASCADE
);

-- 2.18 [food_order] Table (F&B orders submitted by guests or service staff)
CREATE TABLE dbo.food_order (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    room_booking_id INT NULL, -- NULL represents walk-in diners
    order_time DATETIME2 NOT NULL DEFAULT GETDATE(),
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    CONSTRAINT CK_food_order_Status CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT CK_food_order_Amount CHECK (total_amount >= 0),
    CONSTRAINT FK_food_order_User FOREIGN KEY (user_id) REFERENCES dbo.[User](user_id) ON DELETE NO ACTION,
    CONSTRAINT FK_food_order_room_booking FOREIGN KEY (room_booking_id) REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION
);

-- 2.19 [food_order_detail] Table (Dish details inside an F&B order)
CREATE TABLE dbo.food_order_detail (
    order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_order DECIMAL(15,2) NOT NULL, -- Locked retail price at execution
    special_note NVARCHAR(255) NULL, -- Customer customization / allergy alerts
    is_package_included BIT NOT NULL DEFAULT 0, -- 1 if costs are absorbed by package daily limits
    
    CONSTRAINT CK_food_order_detail_Qty CHECK (quantity > 0),
    CONSTRAINT CK_food_order_detail_Price CHECK (price_at_order >= 0),
    CONSTRAINT FK_food_order_detail_order FOREIGN KEY (order_id) REFERENCES dbo.food_order(order_id) ON DELETE CASCADE,
    CONSTRAINT FK_food_order_detail_food FOREIGN KEY (food_id) REFERENCES dbo.food_menu(food_id) ON DELETE NO ACTION
);

-- 2.20 [invoice] Table (Consolidated check-out billing ledger / AHLEI-compliant Guest Folio)
CREATE TABLE dbo.invoice (
    invoice_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    room_booking_id INT NOT NULL,
    room_subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    spa_subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Sum of spa services where is_package_included = 0
    food_subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Sum of à la carte food items
    tax_and_fees DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    final_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL,
    vnpay_tran_id VARCHAR(100) NULL, -- Payment gateway ID
    payment_time DATETIME2 NULL,
    
    CONSTRAINT CK_invoice_Room CHECK (room_subtotal >= 0),
    CONSTRAINT CK_invoice_Spa CHECK (spa_subtotal >= 0),
    CONSTRAINT CK_invoice_Food CHECK (food_subtotal >= 0),
    CONSTRAINT CK_invoice_Tax CHECK (tax_and_fees >= 0),
    CONSTRAINT CK_invoice_Final CHECK (final_amount >= 0),
    CONSTRAINT CK_invoice_Status CHECK (status IN ('UNPAID', 'PAID', 'CANCELLED')),
    CONSTRAINT FK_invoice_User FOREIGN KEY (user_id) REFERENCES dbo.[User](user_id) ON DELETE NO ACTION,
    CONSTRAINT FK_invoice_room_booking FOREIGN KEY (room_booking_id) REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION
);

-- 2.21 [blog] Table (Promotional articles written by managers)
CREATE TABLE dbo.blog (
    blog_id INT IDENTITY(1,1) PRIMARY KEY,
    author_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT CK_blog_Status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT FK_blog_User FOREIGN KEY (author_id) REFERENCES dbo.[User](user_id) ON DELETE CASCADE
);

-- 2.22 [feedback] Table (Customer review ratings and text feedback)
CREATE TABLE dbo.feedback (
    feedback_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    room_booking_id INT NOT NULL,
    rating INT NOT NULL,
    comment NVARCHAR(MAX) NULL,
    is_toxic BIT NOT NULL DEFAULT 0, -- Sentiment filter flag
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT CK_feedback_Rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT FK_feedback_User FOREIGN KEY (user_id) REFERENCES dbo.[User](user_id) ON DELETE CASCADE,
    CONSTRAINT FK_feedback_room_booking FOREIGN KEY (room_booking_id) REFERENCES dbo.room_booking(booking_id) ON DELETE NO ACTION
);

-- =========================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================
CREATE INDEX IX_room_booking_User ON dbo.room_booking(user_id);
CREATE INDEX IX_spa_booking_Dates ON dbo.spa_booking(start_datetime, end_datetime);
CREATE INDEX IX_spa_booking_Therapist ON dbo.spa_booking(therapist_id);
CREATE INDEX IX_food_order_User ON dbo.food_order(user_id);
CREATE INDEX IX_invoice_Booking ON dbo.invoice(room_booking_id);

GO

-- =========================================================================
-- 4. SEED SAMPLE DATA (MASTER DATA & TRANSACTIONS)
-- =========================================================================

-- 4.1 Insert Users (Passwords are mocked BCrypt hashes)
INSERT INTO dbo.[User] (email, password_hash, full_name, phone, id_passport_encrypted, role, status) VALUES
('manager@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Nguyễn Quản Lý', '0901234567', 'U2FsdGVkX194QTA1V2g3SjcrREJpZz09', 'MANAGER', 'ACTIVE'),
('reception@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Lễ Tân', '0907654321', 'U2FsdGVkX1+2NzVhOGYzNWVlOTc4NmQ0', 'RECEPTIONIST', 'ACTIVE'),
('therapist1@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Bác Sĩ Hải - Trị Liệu', '0912345678', 'U2FsdGVkX19rN0g3YjhkOTM0OGRlM2Qx', 'THERAPIST', 'ACTIVE'),
('chef@nguson.vn', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Phạm Bếp Trưởng', '0987654321', 'U2FsdGVkX1+zNTRjMmVkNDhjOGE5MmEx', 'CHEF', 'ACTIVE'),
('guest1@gmail.com', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Trần Khách Hàng', '0933333333', 'U2FsdGVkX1+1MGZhYjI5ZGNkYThmMDEx', 'CUSTOMER', 'ACTIVE'),
('guest2@gmail.com', '$2a$10$X8k2UvT4t0WqI9Z3mC7tOe/qRk1rN4y9qEwXp4e5o6b7c8d9e0f1a', N'Lê Minh Châu', '0944444444', 'U2FsdGVkX1/bNzU0MDNkZWEwOGYxZTIz', 'CUSTOMER', 'ACTIVE');

-- 4.2 Insert Medical Profiles (Decree 356/2025 Explicit consent signed)
INSERT INTO dbo.medical_profile (user_id, physical_condition_encrypted, food_allergies_encrypted, explicit_consent_signed) VALUES
(5, 'U2FsdGVkX19oQ1Z0M2o0U1hVdk82UT09 (Đau cột sống thắt lưng nhẹ)', 'U2FsdGVkX19MOG85TjBkNmJkWT09 (Dị ứng đậu phộng)', 1),
(6, 'U2FsdGVkX19hdmRjMTIzNGE4Zjk4ZDAw (Căng thẳng thần kinh, mất ngủ)', 'U2FsdGVkX19zZGYzMjRhOGY5OGQwMDk4 (Dị ứng hải sản vỏ cứng)', 1);

-- 4.3 Insert Refresh Token
INSERT INTO dbo.refresh_token (user_id, token, expires_at, used) VALUES
(5, 'd3b07384-d113-4f24-a5e2-63205728a562', DATEADD(day, 7, GETDATE()), 0);

-- 4.4 Insert Work Schedules
INSERT INTO dbo.work_schedule (staff_id, work_date, shift_start, shift_end, status) VALUES
(3, CAST(GETDATE() AS DATE), '08:00:00', '17:00:00', 'ACTIVE'),
(4, CAST(GETDATE() AS DATE), '06:00:00', '15:00:00', 'ACTIVE');

-- 4.5 Insert Retreat Packages
INSERT INTO dbo.retreat_package (package_name, description, base_price, duration_days) VALUES
(N'5-day Detox Journey', N'Gói giải độc cơ thể toàn diện 5 ngày 4 đêm, bao gồm ẩm thực dưỡng sinh riêng biệt và 3 buổi trị liệu chuyên sâu.', 12500000.00, 5),
(N'Mindfulness & Yoga Weekend', N'Gói thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm, hỗ trợ giảm stress và tái tạo năng lượng.', 7800000.00, 3);

-- 4.6 Insert Room Types
INSERT INTO dbo.room_type (type_name, base_price, capacity) VALUES
(N'Standard Room 1 King Bed', 1800000.00, 2),
(N'Vip Villa 1-Bedroom Pool', 4500000.00, 2),
(N'Presidential Suite 2-Bedroom', 12000000.00, 4);

-- 4.7 Insert Rooms
INSERT INTO dbo.room (room_type_id, room_number, status) VALUES
(1, 'Room-102', 'AVAILABLE'),
(2, 'Villa-101', 'AVAILABLE'),
(2, 'Villa-102', 'AVAILABLE'),
(3, 'President-501', 'AVAILABLE');

-- 4.8 Insert Room Bookings (Deposit 30% paid)
INSERT INTO dbo.room_booking (user_id, package_id, check_in_date, check_out_date, status, total_deposit) VALUES
(5, 1, DATEADD(day, 1, GETDATE()), DATEADD(day, 6, GETDATE()), 'CONFIRMED', 3750000.00), -- 30% of 12.5M
(6, NULL, DATEADD(day, 2, GETDATE()), DATEADD(day, 4, GETDATE()), 'CONFIRMED', 2700000.00); -- 30% of standard room rate (2 nights Villa = 9M)

-- 4.9 Insert Room Booking Details
INSERT INTO dbo.room_booking_detail (booking_id, room_id, price_at_booking) VALUES
(1, 2, 4500000.00), -- Villa-101
(2, 3, 4500000.00); -- Villa-102

-- 4.10 Insert Room Guest Declaration
INSERT INTO dbo.room_guest_declaration (booking_detail_id, guest_full_name, guest_id_passport_encrypted) VALUES
(1, N'Trần Khách Hàng', 'U2FsdGVkX1+1MGZhYjI5ZGNkYThmMDEx'),
(2, N'Lê Minh Châu', 'U2FsdGVkX1/bNzU0MDNkZWEwOGYxZTIz');

-- 4.11 Insert Spa Services
INSERT INTO dbo.spa_service (service_name, description, price, duration_minutes) VALUES
(N'Hot Volcanic Stone Massage', N'Massage trị liệu toàn thân bằng đá núi lửa nóng giúp giảm đau mỏi cơ xương khớp.', 1200000.00, 90),
(N'Dao Red Leaf Herbal Bath', N'Tắm lá thuốc người Dao Đỏ hỗ trợ lưu thông khí huyết và thư giãn ngủ ngon.', 600000.00, 45),
(N'Spinal Adjustment Therapy', N'Liệu trình nắn chỉnh và kéo giãn cột sống thắt lưng chống đau mỏi thoái hóa.', 1500000.00, 60);

-- 4.12 Insert Package Spa Limits (detox package includes 2 sessions of Volcanic Massage and 1 Herbal Bath)
INSERT INTO dbo.package_spa_limit (package_id, spa_id, quantity_included) VALUES
(1, 1, 2), -- 2 Volcanic Massage
(1, 2, 1); -- 1 Herbal Bath

-- 4.13 Insert Treatment Rooms
INSERT INTO dbo.treatment_room (room_name, status) VALUES
(N'Therapy Room A', 'AVAILABLE'),
(N'Therapy Room B', 'AVAILABLE'),
(N'Red Dao Bath Room 1', 'AVAILABLE');

-- 4.14 Insert Spa Bookings
INSERT INTO dbo.spa_booking (user_id, room_booking_id, spa_id, therapist_id, treatment_room_id, start_datetime, end_datetime, status, price_at_booking, is_package_included) VALUES
(5, 1, 1, 3, 1, DATEADD(hour, 14, DATEADD(day, 2, GETDATE())), DATEADD(minute, 990, DATEADD(day, 2, GETDATE())), 'CONFIRMED', 1200000.00, 1), -- Included in package
(6, 2, 3, 3, 2, DATEADD(hour, 10, DATEADD(day, 3, GETDATE())), DATEADD(hour, 11, DATEADD(day, 3, GETDATE())), 'CONFIRMED', 1500000.00, 0); -- A-la-carte paying

-- 4.15 Insert Food Menu
INSERT INTO dbo.food_menu (dish_name, description, price, dietary_tags) VALUES
(N'Organic Avocado Quinoa Salad', N'Salad diêm mạch hữu cơ với bơ sáp cắt lát, hạt bí ngô và sốt chanh mật ong.', 180000.00, 'Vegan, Gluten-Free'),
(N'Ginseng Chicken Soup', N'Canh gà hầm sâm và táo đỏ bổ trung ích khí, hỗ trợ phục hồi sức khỏe.', 320000.00, 'Keto, Healthy'),
(N'Green Detox Juice', N'Nước ép giải độc gan từ cần tây hữu cơ, táo xanh, cải xoăn và gừng.', 95000.00, 'Vegan, Detox'),
(N'Nấm nướng lá lốt cốt dừa', N'Nấm đùi gà cuộn lá lốt nướng than hoa, đậu phộng rang giòn.', 320000.00, 'Vegan, Peanut'),
(N'Tôm rim tỏi ớt (Món mặn)', N'Tôm sú biển tươi rim tỏi ớt thơm lừng, giàu protein.', 390000.00, 'Healthy, Seafood');

-- 4.16 Insert Package Food Limits (detox package includes 1 detox juice per day and 1 avocado salad)
INSERT INTO dbo.package_food_limit (package_id, food_id, quantity_per_day) VALUES
(1, 3, 1), -- 1 Detox juice/day
(1, 1, 1); -- 1 Salad/day

-- 4.17 Insert Food Orders
INSERT INTO dbo.food_order (user_id, room_booking_id, order_time, status, total_amount) VALUES
(5, 1, DATEADD(hour, 18, DATEADD(day, 1, GETDATE())), 'DELIVERED', 595000.00), -- Salad + Chicken Soup + Juice
(6, 2, DATEADD(hour, 8, DATEADD(day, 2, GETDATE())), 'DELIVERED', 415000.00); -- Chicken soup + Juice (A-la-carte)

-- 4.18 Insert Food Order Details
INSERT INTO dbo.food_order_detail (order_id, food_id, quantity, price_at_order, special_note, is_package_included) VALUES
(1, 1, 1, 180000.00, N'Dị ứng đậu phộng, không bỏ các loại hạt đậu khác', 1), -- Package covers salad
(1, 2, 1, 320000.00, NULL, 0), -- Extra charge chicken soup
(1, 3, 1, 95000.00, NULL, 1), -- Package covers detox juice
(2, 2, 1, 320000.00, N'Không bỏ bột ngọt', 0), -- Extra charge
(2, 3, 1, 95000.00, NULL, 0); -- Extra charge

-- 4.19 Insert Invoices (AHLEI Folio calculated upon check-out)
-- Note: guest 5 is currently booked, invoice will be calculated on check-out. Let's record a mock invoice for an earlier past guest.
INSERT INTO dbo.invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, tax_and_fees, final_amount, status, vnpay_tran_id, payment_time) VALUES
(5, 1, 12500000.00, 0.00, 320000.00, 1282000.00, 14102000.00, 'UNPAID', NULL, NULL);

-- 4.20 Insert Blogs
INSERT INTO dbo.blog (author_id, title, content, status) VALUES
(1, N'Lợi ích trị liệu của việc tắm lá thuốc Dao Đỏ', N'Tắm lá thuốc người Dao Đỏ là một nét văn hóa y học bản địa đặc sắc, giúp lưu thông tuần hoàn máu, hỗ trợ điều trị đau nhức xương khớp và hồi phục sức khỏe nhanh chóng...', 'PUBLISHED');

-- 4.21 Insert Feedback
INSERT INTO dbo.feedback (user_id, room_booking_id, rating, comment, is_toxic) VALUES
(5, 1, 5, N'Dịch vụ nghỉ dưỡng trị liệu tuyệt vời! Đội ngũ nhân viên y tế chu đáo, thực đơn sạch sẽ và chuyên sâu.', 0);

-- =========================================================================
-- END OF DATABASE SCRIPT
-- =========================================================================
