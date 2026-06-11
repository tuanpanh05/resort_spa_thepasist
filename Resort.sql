-- =========================================================================
-- SYSTEM: RESORT & SPA MANAGEMENT
-- DIALECT: MICROSOFT SQL SERVER (T-SQL)
-- =========================================================================

-- Bảng lưu trữ người dùng (Khách hàng, Nhân viên, Quản lý)
CREATE TABLE [users] (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    id_passport_encrypted VARCHAR(MAX),
    role VARCHAR(20) NOT NULL DEFAULT 'GUEST' CHECK (role IN ('ADMIN', 'STAFF', 'THERAPIST', 'GUEST')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BANNED')),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Hồ sơ y tế (Dành cho dịch vụ Spa/Trị liệu)
CREATE TABLE medical_profile (
    profile_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES [users](user_id) ON DELETE CASCADE,
    physical_condition_encrypted VARCHAR(MAX),
    food_allergies_encrypted VARCHAR(MAX),
    explicit_consent_signed BIT NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Lịch làm việc của nhân viên
CREATE TABLE work_schedule (
    schedule_id INT IDENTITY(1,1) PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES [users](user_id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'ATTENDED', 'ABSENT', 'CANCELLED')),
    CONSTRAINT chk_shift_time CHECK (shift_start < shift_end)
);
GO

-- Giỏ hàng của người dùng
CREATE TABLE cart_item (
    cart_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES [users](user_id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('PACKAGE', 'SERVICE', 'PRODUCT')),
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Bài viết / Blog
CREATE TABLE blog (
    blog_id INT IDENTITY(1,1) PRIMARY KEY,
    author_id INT REFERENCES [users](user_id) ON DELETE SET NULL,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Loại phòng Resort
CREATE TABLE room_type (
    room_type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name NVARCHAR(100) NOT NULL UNIQUE,
    base_price DECIMAL(12, 2) NOT NULL CHECK (base_price >= 0),
    capacity INT NOT NULL CHECK (capacity > 0)
);
GO

-- Phòng cụ thể
CREATE TABLE room (
    room_id INT IDENTITY(1,1) PRIMARY KEY,
    room_type_id INT NOT NULL REFERENCES room_type(room_type_id) ON DELETE NO ACTION,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'))
);
GO

-- Gói nghỉ dưỡng (Retreat Package)
CREATE TABLE retreat_package (
    package_id INT IDENTITY(1,1) PRIMARY KEY,
    package_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    base_price DECIMAL(12, 2) NOT NULL CHECK (base_price >= 0)
);
GO

-- Đặt phòng (Master Booking)
CREATE TABLE room_booking (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES [users](user_id) ON DELETE NO ACTION,
    package_id INT REFERENCES retreat_package(package_id) ON DELETE SET NULL,
    check_in_date DATETIME NOT NULL,
    check_out_date DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    total_deposit DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_deposit >= 0),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT chk_booking_dates CHECK (check_in_date < check_out_date)
);
GO

-- Chi tiết đặt phòng (Nhiều phòng trong 1 booking)
CREATE TABLE room_booking_detail (
    detail_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES room_booking(booking_id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES room(room_id) ON DELETE NO ACTION,
    price_at_booking DECIMAL(12, 2) NOT NULL CHECK (price_at_booking >= 0)
);
GO

-- Khai báo thông tin khách lưu trú thực tế
CREATE TABLE room_guest_declaration (
    declaration_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_detail_id INT NOT NULL REFERENCES room_booking_detail(detail_id) ON DELETE CASCADE,
    guest_full_name NVARCHAR(255) NOT NULL,
    guest_id_passport_encrypted VARCHAR(MAX) NOT NULL,
    declared_at DATETIME DEFAULT GETDATE()
);
GO

-- Dịch vụ Spa
CREATE TABLE spa_service (
    spa_id INT IDENTITY(1,1) PRIMARY KEY,
    service_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0)
);
GO

-- Giới hạn dịch vụ Spa được kèm trong gói Retreat Package
CREATE TABLE package_spa_limit (
    package_spa_id INT IDENTITY(1,1) PRIMARY KEY,
    package_id INT NOT NULL REFERENCES retreat_package(package_id) ON DELETE CASCADE,
    spa_id INT NOT NULL REFERENCES spa_service(spa_id) ON DELETE CASCADE,
    quantity_included INT NOT NULL DEFAULT 1 CHECK (quantity_included > 0),
    CONSTRAINT uq_package_spa UNIQUE (package_id, spa_id)
);
GO

-- Phòng vật lý dùng cho Trị liệu/Spa
CREATE TABLE treatment_room (
    treatment_room_id INT IDENTITY(1,1) PRIMARY KEY,
    room_name NVARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'))
);
GO

-- Lịch đặt Spa/Trị liệu
CREATE TABLE spa_booking (
    spa_booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES [users](user_id) ON DELETE NO ACTION,
    room_booking_id INT REFERENCES room_booking(booking_id) ON DELETE CASCADE,
    spa_id INT NOT NULL REFERENCES spa_service(spa_id) ON DELETE NO ACTION,
    therapist_id INT REFERENCES [users](user_id) ON DELETE NO ACTION,
    treatment_room_id INT REFERENCES treatment_room(treatment_room_id) ON DELETE NO ACTION,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    price_at_booking DECIMAL(12, 2) NOT NULL CHECK (price_at_booking >= 0),
    is_package_included BIT NOT NULL DEFAULT 0,
    CONSTRAINT chk_spa_booking_dates CHECK (start_datetime < end_datetime)
);
GO

-- Đánh giá/Feedback của khách hàng
CREATE TABLE feedback (
    feedback_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES [users](user_id) ON DELETE CASCADE,
    room_booking_id INT REFERENCES room_booking(booking_id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    is_toxic BIT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- =========================================================================
-- INDEXES CHO SQL SERVER
-- =========================================================================
CREATE NONCLUSTERED INDEX idx_med_prof_user ON medical_profile(user_id);
CREATE NONCLUSTERED INDEX idx_work_sched_staff_date ON work_schedule(staff_id, work_date);
CREATE NONCLUSTERED INDEX idx_cart_user ON cart_item(user_id);
CREATE NONCLUSTERED INDEX idx_room_type ON room(room_type_id);
CREATE NONCLUSTERED INDEX idx_booking_user ON room_booking(user_id);
CREATE NONCLUSTERED INDEX idx_booking_dates ON room_booking(check_in_date, check_out_date);
CREATE NONCLUSTERED INDEX idx_booking_detail_booking ON room_booking_detail(booking_id);
CREATE NONCLUSTERED INDEX idx_booking_detail_room ON room_booking_detail(room_id);
CREATE NONCLUSTERED INDEX idx_guest_decl_detail ON room_guest_declaration(booking_detail_id);
CREATE NONCLUSTERED INDEX idx_spa_booking_user ON spa_booking(user_id);
CREATE NONCLUSTERED INDEX idx_spa_booking_room_booking ON spa_booking(room_booking_id);
CREATE NONCLUSTERED INDEX idx_spa_booking_therapist_time ON spa_booking(therapist_id, start_datetime);
CREATE NONCLUSTERED INDEX idx_feedback_booking ON feedback(room_booking_id);
GO