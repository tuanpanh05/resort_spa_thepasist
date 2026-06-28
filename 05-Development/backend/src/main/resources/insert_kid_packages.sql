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
