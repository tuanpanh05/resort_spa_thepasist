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
