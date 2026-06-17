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
