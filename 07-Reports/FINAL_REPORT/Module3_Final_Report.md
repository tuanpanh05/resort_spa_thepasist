# BÁO CÁO HOÀN THIỆN & KIỂM THỬ MODULE 3
## Spa & Therapy Scheduling Engine (UC11–UC15)
### Dự án: Ngũ Sơn Resort & Spa Management System (NSRMS)

---

## 1. Tổng Quan Kết Quả Công Việc

Module 3 là trái tim vận hành trải nghiệm phục hồi sức khỏe của resort, chịu trách nhiệm tự động sắp xếp lịch trình trị liệu Spa, Vật lý trị liệu và Yoga, chặn đặt trùng lịch 2 chiều và tích hợp lịch làm việc cho kỹ thuật viên.

### Kết quả tổng thể:
* **Auto-match Engine**: Tự động ghép nối chuyên gia và phòng trị liệu còn trống theo chuyên môn cụ thể (`specialty`) và khung thời gian yêu cầu.
* **Double-Booking Prevention**: Sử dụng cơ chế khóa dòng DB bi quan (Pessimistic Lock) chặn tuyệt đối việc gán trùng lịch chuyên gia hoặc phòng trị liệu khi có nhiều giao dịch đặt lịch đồng thời.
* **Bảo vệ quyền riêng tư nhạy cảm**: Kỹ thuật viên chỉ xem được ghi chú thể chất (`physicalCondition`), ẩn hoàn toàn thông tin dị ứng ăn uống hay tài chính cá nhân của khách.
* **Asynchronous Integration**: Đồng bộ hóa phi tuần tự lịch đặt với Google Calendar API của khách và kích hoạt SendGrid gửi email nhắc nhở trước giờ trị liệu.
* **JUnit Tests**: **12/12 tests PASS 100%**.

---

## 2. Chi Tiết Các Tính Năng Hoàn Thành

### 2.1 Đặt lịch trị liệu trong gói (UC11)
* Khách hàng đặt lịch trị liệu miễn phí đi kèm trong Retreat Package.
* Giới hạn nghiêm ngặt số buổi được phép book theo từng loại gói đã đăng ký (Ví dụ: Gói Royal Spa tối đa 2 buổi).
* Ràng buộc giờ hẹn trị liệu bắt buộc phải nằm trong khoảng thời gian Check-in và Check-out của kỳ lưu trú (BR-30).

### 2.2 Tự động ghép lịch thông minh (UC12)
* Thuật toán tự động ghép chuyên gia và phòng còn trống.
* Tự động ưu tiên ghép theo chuyên môn trị liệu (`SPA`, `YOGA`, `PHYSIO`). Nếu danh sách chuyên gia theo chuyên môn bị trống, hệ thống sẽ tự động hạ cấp tìm kiếm (fallback) sang chuyên gia tổng quát để đảm bảo trải nghiệm khách hàng không bị gián đoạn.

### 2.3 Xem lịch làm việc & Hồ sơ trị liệu (UC13)
* Kỹ thuật viên (Therapist) xem lịch làm việc hàng ngày của họ.
* Hệ thống chỉ hiển thị thông tin thể chất nhạy cảm (Đau vai gáy, thoát vị đĩa đệm), ẩn toàn bộ dị ứng ăn uống để tuân thủ quy tắc tối thiểu hóa dữ liệu (NĐ 13/2023/NĐ-CP).

### 2.4 Cập nhật trạng thái buổi trị liệu (UC14)
* Cho phép Kỹ thuật viên cập nhật trạng thái buổi trị liệu (`SCHEDULED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED` / `NO_SHOW`).

### 2.5 Lễ tân đặt thêm dịch vụ Spa ngoài gói (UC15)
* Lễ tân (hoặc khách hàng) đặt thêm dịch vụ Spa trả phí ngoài gói. Chi phí này tự động dồn về hóa đơn tổng hợp (Folio) của phòng lữ hành liên quan.

---

## 3. Bằng Chứng Kiểm Thử (Verification Evidence)

### 3.1 Kết quả JUnit Tests
```text
[INFO] Running fu.se.smms.service.impl.SpaBookingServiceImplTest
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 3.2 Tích hợp Lịch biểu & Email reminders
* **Google Calendar API**: Sau khi đặt lịch thành công, API trả về `google_calendar_event_id` được ghi nhận trực tiếp vào bảng `spa_booking`. Lịch cá nhân của khách tự xuất hiện sự kiện trị liệu.
* **SendGrid API**: Kiểm thử gửi mail thành công, mail template chứa đầy đủ tên khách, tên dịch vụ, giờ hẹn và tên kỹ thuật viên chịu trách nhiệm.
