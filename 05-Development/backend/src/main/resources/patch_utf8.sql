-- Fix Users
UPDATE dbo.users SET full_name = N'Nguyễn Quản Lý' WHERE email = 'manager@nguson.vn';
UPDATE dbo.users SET full_name = N'Lê Lễ Tân' WHERE email = 'reception@nguson.vn';
UPDATE dbo.users SET full_name = N'Bác Sĩ Hải - Trị Liệu' WHERE email = 'therapist1@nguson.vn';
UPDATE dbo.users SET full_name = N'Phạm Bếp Trưởng' WHERE email = 'chef@nguson.vn';
UPDATE dbo.users SET full_name = N'Trần Khách Hàng' WHERE email = 'guest1@gmail.com';
UPDATE dbo.users SET full_name = N'Lê Minh Châu' WHERE email = 'guest2@gmail.com';
UPDATE dbo.users SET full_name = N'Hoàng Nam Anh' WHERE email = 'guest3@gmail.com';

-- Fix Retreat Packages
UPDATE dbo.retreat_packages SET name = N'5-day Detox Journey', package_name = N'5-day Detox Journey', description = N'Gói giải độc cơ thể toàn diện 5 ngày 4 đêm, bao gồm ẩm thực dưỡng sinh riêng biệt và 3 buổi trị liệu chuyên sâu.', duration_text = N'5 ngày 4 đêm', goal = N'Thải độc (Detox)' WHERE package_id = 1;
UPDATE dbo.retreat_packages SET name = N'Mindfulness & Yoga Weekend', package_name = N'Mindfulness & Yoga Weekend', description = N'Gói thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm, hỗ trợ giảm stress và tái tạo năng lượng.', duration_text = N'3 ngày 2 đêm', goal = N'Yoga & Thiền' WHERE package_id = 2;
UPDATE dbo.retreat_packages SET name = N'Weight Loss & Slimming Journey', package_name = N'Weight Loss & Slimming Journey', description = N'Liệu trình giảm cân & thon gọn dáng vóc 7 ngày 6 đêm với chế độ ăn uống khoa học kết hợp bài tập đốt mỡ.', duration_text = N'7 ngày 6 đêm', goal = N'Thải độc (Detox)' WHERE package_id = 3;
UPDATE dbo.retreat_packages SET name = N'Deep Stress Relief & Forest Bathing', package_name = N'Deep Stress Relief & Forest Bathing', description = N'Trải nghiệm giảm căng thẳng và kết nối thiên nhiên sâu qua hoạt động tắm rừng kết hợp trị liệu âm thanh.', duration_text = N'2 ngày 1 đêm', goal = N'Giảm căng thẳng (Stress Relief)' WHERE package_id = 4;
UPDATE dbo.retreat_packages SET name = N'Spine Recovery & Physical Therapy', package_name = N'Spine Recovery & Physical Therapy', description = N'Gói trị liệu phục hồi cột sống chuyên sâu 4 ngày 3 đêm, chẩn đoán bởi bác sĩ chuyên khoa xương khớp.', duration_text = N'4 ngày 3 đêm', goal = N'Chữa lành & Trị liệu' WHERE package_id = 5;

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
(5, N'Tắm ngâm thảo dược cổ truyền Dao Đỏ');

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
(5, N'Súp sâm yến mạch thực dưỡng mỗi tối');

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
