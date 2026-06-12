# 🌿 Module 4: Dietary F&B Management
**Vai trò:** Student 4 (Full-stack: DB -> DAO -> Controller -> UI)

---

## 1. Tổng quan Module
Module 4 chịu trách nhiệm quản lý toàn bộ trải nghiệm ẩm thực dinh dưỡng tại resort. Đặc thù của resort trị liệu là các bữa ăn được cá nhân hóa cao độ để vừa đảm bảo an toàn tuyệt đối trước các tác nhân gây dị ứng thực phẩm, vừa hỗ trợ cải thiện sức khỏe của khách hàng theo phác đồ dinh dưỡng riêng biệt.

---

## 2. Chi tiết Yêu cầu Chức năng (Use Cases)

| Mã UC (Đề bài) | Mã UC (SRS Nhóm 3) | Tên Use Case | Mô tả chi tiết hành vi |
| :--- | :--- | :--- | :--- |
| **UC16** | UC-16 | Lên kế hoạch thực đơn dinh dưỡng (Pre-select Daily Meals) | Khách lựa chọn trước các bữa ăn hàng ngày từ thực đơn của resort. Hệ thống sẽ tự động lọc bỏ các món không an toàn dựa trên dị ứng thực phẩm của họ. |
| **UC17** | UC-20 | Bảng chuẩn bị món ăn hàng ngày cho bếp (Daily Meal Prep Dashboard) | Đầu bếp (Chef) theo dõi danh sách tổng hợp món ăn cần chế biến trong ngày, phân chia theo khung giờ giao hàng và hiển thị nổi bật cảnh báo dị ứng đi kèm từng món. |
| **UC18** | UC-21 | Cập nhật tiến độ chuẩn bị món (Update Meal Order Status) | Đầu bếp cập nhật trạng thái của món ăn trong quá trình chuẩn bị (Đang chuẩn bị - Preparing, Đã sẵn sàng giao - Ready for Delivery). |
| **UC19** | UC-10 | Gọi thêm đồ ăn uống ngoài gói (Order Extra F&B Items) | Khách đặt thêm đồ ăn/thức uống trả phí ngoài thực đơn tiêu chuẩn của gói trị liệu. Chi phí phát sinh tự động đẩy vào hóa đơn tổng của phòng lưu trú. |
| **UC20** | UC-20/21 (Hệ thống) | Che giấu bệnh lý nhạy cảm đối với bếp (Mask Medical History) | Hệ thống tự động lọc dữ liệu sức khỏe, chỉ hiển thị thông tin dị ứng ăn uống cho đầu bếp và ẩn hoàn toàn lịch sử bệnh lý vật lý của khách hàng. |

---

## 3. Quy tắc Nghiệp vụ (Business Rules) & Ràng buộc Hệ thống
1. **BR-10 (Meal Selection Deadline):** Khách hàng phải gửi lựa chọn món ăn trước thời gian hạn chót (Cut-off Time) đã được cấu hình trong hệ thống để bếp chuẩn bị nguyên liệu.
2. **BR-11 (Allergy Warning):** Hệ thống bắt buộc phải hiển thị cảnh báo dị ứng rõ ràng trên giao diện chọn món của khách hàng và trên bảng điều khiển của bếp nếu phát hiện món ăn chứa nguyên liệu gây dị ứng của khách.
3. **BR-16 (Extra Service Eligibility):** Chỉ những khách hàng có trạng thái phòng là "Occupied" (Đã nhận phòng) mới được phép sử dụng dịch vụ gọi món ngoài gói (Extra F&B Orders).
4. **BR-30 (Booking Timeline Consistency):** Ngày đặt món ăn phải nằm trong khoảng thời gian lưu trú hợp lệ.

---

## 4. Tiêu chuẩn miền & Tuân thủ Pháp lý (Compliance & Standards)
* **Quy tắc Tối thiểu hóa Dữ liệu (Data Minimization - Nghị định 13/2023/NĐ-CP):**
   - Đầu bếp chỉ được tiếp cận thông tin dị ứng thực phẩm (ví dụ: dị ứng đậu phộng, dị ứng hải sản, ăn chay trường) để phục vụ chế biến an toàn.
   - Các thông tin y tế vật lý khác (như đau lưng, thoát vị đĩa đệm) và thông tin cá nhân (như số hộ chiếu) phải được che giấu hoàn toàn khỏi giao diện của nhà bếp.

---

## 5. Tổng hợp các Vấn đề & Khoảng trống (Gaps / Issues)

> [!WARNING]
> **Các điểm xung đột và thiếu sót giữa Đề bài (HOS-03) và Đặc tả SRS chính thức:**

1. **Thiếu định nghĩa thời gian hạn chót đặt món (Cut-off Time):**
   Tài liệu SRS quy định khách hàng phải đặt trước món ăn trước hạn chót (BR-10), nhưng chưa đưa ra con số cụ thể (ví dụ: trước 22:00 của ngày hôm trước, hay 24 tiếng trước giờ ăn). Nếu không khóa cứng quy định này, khách hàng có thể đặt món quá sát giờ, khiến nhà bếp không thể đáp ứng được các chế độ ăn kiêng đặc thù.
2. **Thiếu cơ sở thiết kế bộ máy lọc thực đơn tự động (Menu Filtering Engine):**
   Đặc tả yêu cầu hệ thống tự động lọc món ăn không an toàn cho khách, nhưng cơ sở dữ liệu hiện tại trong SRS chưa thiết kế mối quan hệ (Mapping) giữa:
   - Các nguyên liệu thành phần của món ăn (ví dụ: món X chứa bột mì, tôm, đậu phộng).
   - Danh mục dị ứng của khách hàng (ví dụ: Khách Y dị ứng Gluten và Đậu phộng).
   Thiếu cấu trúc dữ liệu liên kết này sẽ khiến lập trình viên không thể code tính năng tự động lọc món an toàn.
3. **Chưa có thiết kế màn hình xử lý cảnh báo dị ứng khẩn cấp:**
   Nếu khách hàng vô tình chọn một món ăn ngoài gói có nguy cơ gây dị ứng cao (qua tính năng Order Extra F&B), hệ thống cần hiển thị cảnh báo ngăn chặn hoặc bắt buộc khách hàng xác nhận rủi ro trước khi đặt. SRS chưa chỉ định thiết kế giao diện cảnh báo này ở Frontend.
4. **Thiếu quy trình thanh toán phát sinh và kiểm soát nợ:**
   Các đơn hàng ăn uống phát sinh (UC10) cần được liên kết chặt chẽ với hóa đơn buồng phòng (Folio) để thanh toán lúc Check-out. SRS cần mô tả rõ cơ chế đồng bộ tức thời để đảm bảo khi khách Check-out, Lễ tân không bỏ sót các hóa đơn ăn uống chưa thanh toán (liên kết với Module 5).
