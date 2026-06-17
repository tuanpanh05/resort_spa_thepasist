USE ResortSpaDB;
GO

-- Update Service ID 1
UPDATE dbo.spa_services
SET name = N'Massage Trị Liệu Đá Núi Lửa',
    description = N'Sử dụng những viên đá bazan tự nhiên được hấp nóng trong tinh dầu thảo dược để massage sâu vào mô cơ. Phục hồi hoàn toàn cơ bắp bị căng cứng, kích thích tuần hoàn máu và đem lại giấc ngủ sâu.',
    category = 'BODY',
    price = 1200000.00,
    duration_minutes = 90
WHERE service_id = 1;

-- Update Service ID 2
UPDATE dbo.spa_services
SET name = N'Tắm Ngâm Lá Thảo Dược Dao Đỏ',
    description = N'Bản sắc chăm sóc sức khỏe độc đáo sử dụng hơn 30 loại lá thuốc tươi hái trực tiếp từ độ cao 1.500m. Nước ngâm nóng thảo dược giúp thư giãn mạch máu, giảm đau mỏi xương khớp và nuôi dưỡng làn da căng mượt.',
    category = 'BODY',
    price = 600000.00,
    duration_minutes = 45
WHERE service_id = 2;

-- Update Service ID 3
UPDATE dbo.spa_services
SET name = N'Liệu Trình Trẻ Hóa Da Tự Nhiên',
    description = N'Chăm sóc da mặt chuyên sâu kết hợp thảo mộc organic tươi (nghệ tây, mật ong rừng Ngũ Sơn, cám gạo sữa) và phương pháp massage bấm huyệt Kobi-Do giúp lưu thông bạch huyết, săn chắc cơ mặt.',
    category = 'FACE',
    price = 800000.00,
    duration_minutes = 75
WHERE service_id = 3;

-- Insert other spa services (if they don't exist yet)
IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE name = N'Trị Liệu Chuông Xoay Tây Tạng')
BEGIN
    INSERT INTO dbo.spa_services (name, description, category, price, duration_minutes, status)
    VALUES (
        N'Trị Liệu Chuông Xoay Tây Tạng', 
        N'Sử dụng tần số âm thanh từ chuông xoay Tây Tạng giúp làm sạch tâm trí, xoa dịu hệ thần kinh và đưa cơ thể vào trạng thái thiền sâu.',
        'Mindfulness', 
        1000000.00, 
        60, 
        'ACTIVE'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE name = N'Ủ Thảo Dược Thải Độc Thảo Mộc')
BEGIN
    INSERT INTO dbo.spa_services (name, description, category, price, duration_minutes, status)
    VALUES (
        N'Ủ Thảo Dược Thải Độc Thảo Mộc', 
        N'Ủ dưỡng giải độc da và thanh lọc cơ thể bằng hỗn hợp thảo mộc organic tươi kết hợp xông hơi thảo dược giúp loại bỏ độc tố.',
        'Detox', 
        900000.00, 
        75, 
        'ACTIVE'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE name = N'Massage Ấn Huyệt Trị Liệu Cổ Vai Gáy')
BEGIN
    INSERT INTO dbo.spa_services (name, description, category, price, duration_minutes, status)
    VALUES (
        N'Massage Ấn Huyệt Trị Liệu Cổ Vai Gáy', 
        N'Massage bấm huyệt chuyên sâu vùng cổ, vai, gáy giải tỏa điểm cơ xơ cứng, cải thiện chứng đau mỏi vai gáy do ngồi lâu.',
        'Therapy', 
        850000.00, 
        60, 
        'ACTIVE'
    );
END;

-- Also insert the physiotherapy back under its new name
IF NOT EXISTS (SELECT 1 FROM dbo.spa_services WHERE name = N'Liệu Trình Nắn Chỉnh Cột Sống')
BEGIN
    INSERT INTO dbo.spa_services (name, description, category, price, duration_minutes, status)
    VALUES (
        N'Liệu Trình Nắn Chỉnh Cột Sống',
        N'Liệu trình nắn chỉnh và kéo giãn cột sống thắt lưng chống đau mỏi thoái hóa.',
        'PHYSIO',
        1500000.00,
        60,
        'ACTIVE'
    );
END;

-- Update existing packages includes and description
UPDATE dbo.retreat_packages
SET 
    includes = N'Tắm Ngâm Lá Thảo Dược Dao Đỏ;Ủ Thảo Dược Thải Độc Thảo Mộc;Massage Trị Liệu Đá Núi Lửa'
WHERE package_id = 1;

UPDATE dbo.retreat_packages
SET 
    includes = N'Trị Liệu Chuông Xoay Tây Tạng;Tắm Ngâm Lá Thảo Dược Dao Đỏ;Massage Ấn Huyệt Trị Liệu Cổ Vai Gáy'
WHERE package_id = 2;

-- Insert new packages to fully populate all needs
IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE name = N'7-day Slim & Fit Clinic')
BEGIN
    INSERT INTO dbo.retreat_packages (name, description, duration_days, price, includes, status)
    VALUES (
        N'7-day Slim & Fit Clinic',
        N'Chương trình giảm béo, săn chắc cơ thể toàn diện trong 7 ngày 6 đêm kết hợp các liệu pháp massage thải độc, đắp thảo dược và chế độ tập luyện, dinh dưỡng khoa học.',
        7,
        18500000.00,
        N'Ủ Thảo Dược Thải Độc Thảo Mộc;Massage Trị Liệu Đá Núi Lửa;Tắm Ngâm Lá Thảo Dược Dao Đỏ',
        'ACTIVE'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE name = N'3-day De-stress Retreat')
BEGIN
    INSERT INTO dbo.retreat_packages (name, description, duration_days, price, includes, status)
    VALUES (
        N'3-day De-stress Retreat',
        N'Gói trị liệu thư giãn tâm trí, giảm stress ngắn ngày 3 ngày 2 đêm, thích hợp giải tỏa căng thẳng công việc và phục hồi hệ thần kinh.',
        3,
        6900000.00,
        N'Trị Liệu Chuông Xoay Tây Tạng;Tắm Ngâm Lá Thảo Dược Dao Đỏ;Massage Trị Liệu Đá Núi Lửa',
        'ACTIVE'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retreat_packages WHERE name = N'5-day Wellness Harmony')
BEGIN
    INSERT INTO dbo.retreat_packages (name, description, duration_days, price, includes, status)
    VALUES (
        N'5-day Wellness Harmony',
        N'Chương trình cân bằng sức khỏe tổng quát 5 ngày 4 đêm giúp nạp lại sinh khí, tăng cường thể trạng và cải thiện chất lượng cuộc sống.',
        5,
        11000000.00,
        N'Liệu Trình Trẻ Hóa Da Tự Nhiên;Massage Trị Liệu Đá Núi Lửa;Tắm Ngâm Lá Thảo Dược Dao Đỏ',
        'ACTIVE'
    );
END;

-- Update staff password hash
UPDATE dbo.users
SET password_hash = '$2a$12$oBPKaqJNETVOAqKqA/XQz.kz/LGfLxieVtmIbbDRxLP3XlNmeeqCe'
WHERE email = 'staff@nguson.com';
GO
