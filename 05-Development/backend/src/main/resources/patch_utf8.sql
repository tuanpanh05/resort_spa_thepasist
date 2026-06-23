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

-- Fix Treatment Rooms
UPDATE dbo.treatment_room SET room_name = N'Therapy Room A' WHERE treatment_room_id = 1;
UPDATE dbo.treatment_room SET room_name = N'Therapy Room B' WHERE treatment_room_id = 2;
UPDATE dbo.treatment_room SET room_name = N'Red Dao Bath Room 1' WHERE treatment_room_id = 3;

-- Fix Spa Services
UPDATE dbo.spa_services SET name = N'Hot Volcanic Stone Massage', description = N'Massage trị liệu toàn thân bằng đá núi lửa nóng giúp giảm đau mỏi cơ xương khớp.' WHERE service_id = 1;
UPDATE dbo.spa_services SET name = N'Dao Red Leaf Herbal Bath', description = N'Tắm lá thuốc người Dao Đỏ hỗ trợ lưu thông khí huyết và thư giãn ngủ ngon.' WHERE service_id = 2;
UPDATE dbo.spa_services SET name = N'Spinal Adjustment Therapy', description = N'Liệu trình nắn chỉnh và kéo giãn cột sống thắt lưng chống đau mỏi thoái hóa.' WHERE service_id = 3;

-- Fix Food Menu
UPDATE dbo.food_menu SET dish_name = N'Organic Avocado Quinoa Salad', description = N'Salad diêm mạch hữu cơ với bơ sáp cắt lát, hạt bí ngô và sốt chanh mật ong.', dietary_tags = N'Vegan, Gluten-Free' WHERE food_id = 1;
UPDATE dbo.food_menu SET dish_name = N'Ginseng Chicken Soup', description = N'Canh gà hầm sâm và táo đỏ bổ trung ích khí, hỗ trợ phục hồi sức khỏe.', dietary_tags = N'Keto, Healthy' WHERE food_id = 2;
UPDATE dbo.food_menu SET dish_name = N'Green Detox Juice', description = N'Nước ép giải độc gan từ cần tây hữu cơ, táo xanh, cải xoăn và gừng.', dietary_tags = N'Vegan, Detox' WHERE food_id = 3;

-- Fix Feedback
UPDATE dbo.feedback SET comment = N'Dịch vụ nghỉ dưỡng trị liệu tuyệt vời! Đội ngũ nhân viên y tế chu đáo, thực đơn sạch sẽ và chuyên sâu.' WHERE feedback_id = 1;
