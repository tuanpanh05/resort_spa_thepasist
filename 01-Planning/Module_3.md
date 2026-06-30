# 🌿 Module 3: Spa & Therapy Scheduling Engine
**Vai trò:** Student 3 - Độ phức tạp cao (High Complexity) (Full-stack: DB -> DAO -> Controller -> UI)

---

## 1. Tổng quan Module
Module 3 là trái tim vận hành trải nghiệm sức khỏe của resort, chịu trách nhiệm quản lý việc đặt và sắp xếp lịch trình trị liệu Spa, Vật lý trị liệu và các lớp Yoga. Module này đòi hỏi giải thuật lập lịch thông minh để tối ưu hóa nguồn lực nhân sự (Therapists) và không gian vật lý (Treatment Rooms) trong thời gian thực, tránh xung đột lịch đặt chéo.

---

## 2. Chi tiết Yêu cầu Chức năng (Use Cases)

| Mã UC (Đề bài) | Mã UC (SRS Nhóm 3) | Tên Use Case                                                           | Mô tả chi tiết hành vi                                                                                                                                               |
| :---------------| :-------------------| :-----------------------------------------------------------------------| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **UC11**       | UC-12              | Đặt lịch trị liệu trong gói (Schedule Spa/Therapy Session)             | Khách hàng đã đặt gói trị liệu tiến hành chọn ngày, giờ để thực hiện các buổi Spa/Therapy có sẵn trong gói của mình.                                                 |
| **UC12**       | UC-12 (Hệ thống)   | Tự động ghép lịch thông minh (Auto-match Therapist & Room)             | Hệ thống tự động truy vấn DB và đề xuất khung giờ khả thi bằng cách ghép cặp đồng thời một Chuyên gia trị liệu trống lịch và một Phòng trị liệu còn trống.           |
| **UC13**       | UC-18              | Xem lịch làm việc & Hồ sơ trị liệu (View Daily Schedule & Guest Notes) | Kỹ thuật viên (Therapist) xem lịch làm việc hàng ngày của mình và đọc ghi chú sức khỏe vật lý nhạy cảm (đau cột sống, chấn thương...) của khách hàng mình phụ trách. |
| **UC14**       | UC-19              | Cập nhật trạng thái buổi trị liệu (Update Session Status)              | Kỹ thuật viên cập nhật tiến độ của buổi trị liệu (Đã đặt lịch - Scheduled, Đang tiến hành - In Progress, Đã hoàn thành - Completed, Khách không đến - No Show).      |
| **UC15**       | UC-08              | Lễ tân đặt thêm dịch vụ Spa ngoài gói (Book Extra Spa Service)         | Lễ tân (hoặc chính khách hàng) đặt thêm các dịch vụ Spa trả phí ngoài gói trị liệu chính. Chi phí này tự động đẩy vào hóa đơn tổng (Folio) của Villa khách đang ở.   |

---

## 3. Quy tắc Nghiệp vụ (Business Rules) & Ràng buộc Hệ thống
1. **Ràng buộc Chặn Đặt trùng Lịch 2 chiều (2-Dimensional Double-Booking Prevention):** 
   - Một buổi trị liệu chỉ hợp lệ nếu cả Chuyên gia trị liệu (Therapist) được chỉ định **VÀ** Phòng trị liệu (Treatment Room) đều trống tại thời điểm đó.
   - Hệ thống bắt buộc phải áp dụng cơ chế khóa giao dịch cơ sở dữ liệu (**Database Transaction Locks**) để đảm bảo không bị lỗi đặt trùng lịch khi nhiều khách hàng thao tác cùng lúc trên một khung giờ.
2. **BR-07 (Health Profile Requirement):** Khách hàng bắt buộc phải hoàn thành hồ sơ sức khỏe (Module 1) trước khi được phép đặt lịch hẹn trị liệu Spa.
3. **BR-08 (Therapist Availability) & BR-09 (Therapy Room Availability):** Chuyên gia và Phòng trị liệu không được phép gán cho các lịch hẹn bị chồng chéo thời gian.
4. **BR-30 (Booking Timeline Consistency):** Giờ hẹn trị liệu phải nằm hoàn toàn trong khoảng thời gian Check-in và Check-out của khách.

---

## 4. Tiêu chuẩn miền & Tuân thủ Pháp lý (Compliance & Standards)
* **Quy tắc Tối thiểu hóa Dữ liệu (Data Minimization - Nghị định 13/2023/NĐ-CP):**
   - Kỹ thuật viên Spa chỉ được quyền xem các thông tin sức khỏe vật lý ảnh hưởng trực tiếp đến quy trình trị liệu (ví dụ: tiền sử thoát vị đĩa đệm, đau khớp gối). 
   - Tuyệt đối cấm hiển thị thông tin dị ứng thức ăn (của nhà bếp) hoặc thông tin tài chính cá nhân của khách hàng trên giao diện của Kỹ thuật viên.
* **Tích hợp API lịch và truyền thông bên ngoài:**
   - **Google Calendar API:** Đồng bộ hóa tự động lịch trị liệu đã đặt vào lịch cá nhân của khách hàng.
   - **SendGrid API:** Gửi email nhắc nhở tự động cho khách hàng trước giờ trị liệu chính xác **1 tiếng**.

---

## 5. Tổng hợp các Vấn đề & Khoảng trống (Gaps / Issues)

> [!WARNING]
> **Các điểm xung đột và thiếu sót giữa Đề bài (HOS-03) và Đặc tả SRS chính thức:**

1. **Thiếu thiết kế kỹ thuật chống trùng lịch đồng thời (Race Condition):**
   Đặc tả SRS mới dừng lại ở việc nêu quy tắc nghiệp vụ "không trùng phòng, không trùng chuyên gia". Tuy nhiên, chưa có thiết kế kỹ thuật ở tầng Database/Backend để xử lý bài toán **Concurrency (đồng thời)**. Cần định nghĩa rõ giải pháp khóa dòng dữ liệu (ví dụ: Pessimistic Locking - `SELECT ... FOR UPDATE` trong Transaction) để đảm bảo tính toàn vẹn khi hệ thống có lượng truy cập cao.
2. **Nguy cơ rò rỉ dữ liệu nhạy cảm ở phía API:**
   Trong UC18 (View Daily Schedule), SRS viết "System retrieves related guest health notes" nhưng chưa chỉ rõ cơ chế lọc thông tin. Nếu API trả về toàn bộ trường dữ liệu của khách hàng, lập trình viên frontend rất dễ vô tình hiển thị cả các thông tin không liên quan (dị ứng, số CCCD, hộ chiếu), vi phạm nghiêm trọng luật bảo mật và phân quyền RBAC.
3. **Thiếu cơ chế xử lý lỗi tích hợp bên thứ ba (Error Handling for External APIs):**
   Việc tích hợp Google Calendar và SendGrid yêu cầu kết nối mạng ra bên ngoài. Tài liệu SRS chưa định nghĩa luồng xử lý ngoại lệ (Exception Flow) khi các dịch vụ này bị lỗi hoặc chậm phản hồi. Cần thiết kế hàng đợi tin nhắn (Message Queue) hoặc tác vụ nền (Background Worker) để thử lại (Retry Mechanism) nhằm tránh làm nghẽn luồng đặt lịch chính của khách hàng.
4. **Quy định về thời gian chạy Cron Job gửi Email:**
   Đề bài yêu cầu gửi email nhắc nhở trước 1 giờ. SRS chưa xác định cơ chế quét định kỳ của Cron job (ví dụ: chạy 5 phút một lần để tìm các lịch hẹn bắt đầu sau 60-65 phút nữa).
