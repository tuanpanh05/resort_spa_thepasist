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
    VALUES (19, N'Thải Độc Hệ Bạch Huyết Toàn Diện (Lymphatic Drainage)', N'Lymphatic Drainage', N'Liệu pháp kích thích tuần hoàn lưu thông bạch huyết cơ thể nhằm tăng cường hệ thống miễn dịch, giải quyết tình trạng ứ dịch và đào thải độc tố tích tụ.', 4, N'4 ngày 3 đêm', 4100000.00, 4100000.00, N'Massage dẫn lưu cơ học hệ bạch huyết toàn diện;Liệu pháp quấn nóng thải độc cơ thể bằng tảo biển;Thực đơn nước ép detox hữu cơ hàng ngày', N'THERAPY', 'ACTIVE', N'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80');

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

