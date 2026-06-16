# Báo Cáo Hoàn Thành Module 4: Dietary F&B Management (Quản Lý Ẩm Thực & Dinh Dưỡng)

## 1. Tổng Quan

Module 4 chịu trách nhiệm quản lý toàn bộ trải nghiệm ẩm thực dinh dưỡng tại resort, đặc biệt chú trọng vào việc cá nhân hóa bữa ăn và đảm bảo an toàn tuyệt đối trước các tác nhân gây dị ứng thực phẩm. Quá trình phát triển đã bám sát các yêu cầu từ Use Cases, Quy tắc nghiệp vụ (Business Rules) và tuân thủ chặt chẽ tiêu chuẩn bảo mật dữ liệu y tế (Nghị định 13/2023/NĐ-CP).

## 2. Chi Tiết Triển Khai Kiến Trúc Cơ Sở Dữ Liệu

Tất cả các bảng liên quan đến Module 4 đã được thiết kế và khởi tạo thành công trong `Resort.sql`, bao gồm:
*   **`food_menu`**: Lưu trữ danh sách món ăn, giá cả, thẻ dinh dưỡng (dietary_tags), và trạng thái (is_today_menu, sold_out).
*   **`package_food_limit`**: Quản lý giới hạn số lượng món ăn mỗi ngày theo từng gói retreat package.
*   **`food_order` & `food_order_detail`**: Quản lý thông tin đặt món (order_time, status, total_amount) và chi tiết từng món được đặt, liên kết chặt chẽ với thông tin phòng (`room_booking_id`).
*   **`medical_profile`**: Hồ sơ y tế chứa thông tin dị ứng thực phẩm (`food_allergies_encrypted`) được mã hóa AES, đi kèm cờ xác nhận đồng ý cung cấp dữ liệu (`explicit_consent_signed`).

## 3. Triển Khai Backend (Spring Boot)

Các API Controller và Services đã được xây dựng để phục vụ cho hai đối tượng chính: Guest và Chef.

### Guest Meal API (`GuestMealController.java`)
*   **Quản lý Menu & Cảnh báo Dị ứng (`GET /guest/menu`)**: Trả về danh sách món ăn. Hệ thống tự động phân tích thành phần món ăn và đối chiếu với hồ sơ dị ứng (đã giải mã AES) của khách hàng để hiển thị cảnh báo (Warning Message) nếu phát hiện nguy cơ dị ứng (ví dụ: hải sản, đậu phộng, cay).
*   **Đặt món trước (`POST /guest/preselect-meals`)**: Cho phép khách hàng lên lịch món ăn (Pre-select) cho các ngày lưu trú. Hệ thống kiểm tra `packageFoodLimit` để tính toán chi phí phụ trội nếu khách đặt vượt định mức gói. Đặc biệt, có logic chặn đặt món sau giờ hạn chót (Cut-off Time).
*   **Gọi món thêm (`POST /guest/order-extra`)**: Xử lý tính năng Order Extra F&B (Room Service).
*   **Consent Management (`POST /guest/consent`)**: Xử lý việc khách hàng ký xác nhận chia sẻ dữ liệu y tế.

### Chef Meal API (`ChefMealController.java`)
*   **Quản lý Thực đơn hôm nay**: API bật/tắt hiển thị món ăn cho ngày hôm nay và cập nhật trạng thái "Hết hàng" (Sold Out).
*   **Giám sát Đơn hàng & Tiến độ**: API cập nhật trạng thái chuẩn bị món ăn (Pending -> Preparing -> Delivering -> Completed).
*   **Bảo mật Thông tin Dị ứng (`GET /guest/chef/allergies`)**: Triển khai nguyên tắc tối thiểu hóa dữ liệu (Data Minimization). Đầu bếp chỉ nhận được danh sách khách hàng cùng thông tin **dị ứng thực phẩm** (đã giải mã), trong khi lịch sử bệnh lý vật lý hoàn toàn bị che giấu.

## 4. Triển Khai Frontend (ReactJS)

### Chef Dashboard (`ChefDashboard.jsx`)
Giao diện trực quan và chuyên nghiệp dành cho Bếp trưởng (Kitchen Hub) với các chức năng nổi bật:
1.  **Bảng Giám Sát Tổng Quan**: Dashboard theo dõi số lượng đơn hàng, tiến độ nấu ăn.
2.  **Giám Sát Dị Ứng (Allergen Monitor)**: Hiển thị danh sách khách đang lưu trú cùng các thẻ dị ứng nổi bật, tự động cảnh báo chéo khi đơn hàng chứa thành phần khách bị dị ứng.
3.  **Quản lý Thực Đơn**: Nút gạt Toggle để nhanh chóng bật/tắt món ăn phục vụ trong ngày hoặc báo hết nguyên liệu.
4.  **Cập Nhật Đơn Hàng (KDS - Kitchen Display System)**: Hệ thống quản lý đơn hàng với tính năng nổi bật: **KDS Voice Synthesizer Alert**. Hệ thống tự động phát âm thanh thông báo bằng giọng nói (Tiếng Việt) mỗi khi trạng thái đơn hàng thay đổi để báo cho nhân viên giao đồ.
5.  **Giao diện Mobile-Responsive**: Thiết kế thanh điều hướng có khả năng thu gọn, phù hợp sử dụng trên máy tính bảng hoặc màn hình trong nhà bếp.

## 5. Đánh Giá Mức Độ Hoàn Thành & Tuân Thủ

*   **UC16 (Pre-select Daily Meals)**: Hoàn thành - Có kiểm tra giới hạn gói và kiểm tra hạn chót giờ đặt (Cut-off time).
*   **UC17 (Daily Meal Prep Dashboard)**: Hoàn thành - ChefDashboard cung cấp cái nhìn toàn diện.
*   **UC18 (Update Meal Order Status)**: Hoàn thành - API và UI cho phép cập nhật nhanh trạng thái.
*   **UC19 (Order Extra F&B Items)**: Hoàn thành - Tính phí phụ trội và đẩy vào hóa đơn phòng.
*   **UC20 (Mask Medical History)**: Hoàn thành xuất sắc - Sử dụng mã hóa AES ở Database và giải mã có chọn lọc tại Controller.

**Kết luận:** Module 4 đã được xây dựng hoàn thiện từ Database, Backend API cho đến Frontend UI, giải quyết triệt để các rủi ro về sức khỏe (dị ứng) và tối ưu quy trình làm việc của nhà bếp (Kitchen Hub).
