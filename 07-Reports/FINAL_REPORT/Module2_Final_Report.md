# BÁO CÁO HOÀN THIỆN & KIỂM THỬ MODULE 2
## Room Booking & Check-in Engine (UC06–UC10)
### Dự án: Ngũ Sơn Resort & Spa Management System (NSRMS)

---

## 1. Tổng Quan Kết Quả Công Việc

Module 2 quản lý toàn bộ vòng đời đặt phòng nghỉ, gán gói trị liệu (`RetreatPackage`), tính toán đặt cọc 30% trực tuyến và xử lý quy trình Check-in đăng ký lưu trú của khách hàng.

### Kết quả tổng thể:
* **Backend Spring Boot**: Hoàn thiện API đặt phòng, kiểm tra phòng trống (Room Availability Engine), và thủ tục Check-in.
* **Giao dịch tài chính đặt cọc**: Tự động tính toán số tiền đặt cọc 30% bắt buộc cho mỗi phòng đặt trực tuyến theo cấu hình hệ thống.
* **Quy trình Check-in**: Lễ tân đăng ký thẻ từ (`Keycard`), ghi nhận thông tin lưu trú của khách lên cơ sở dữ liệu và chuyển trạng thái phòng sang `OCCUPIED`.
* **JUnit Tests**: **15/15 tests PASS 100%**.

---

## 2. Chi Tiết Các Tính Năng Hoàn Thành

### 2.1 Tìm kiếm & Kiểm tra phòng trống (UC06)
* Hệ thống tự động lọc phòng trống theo khoảng ngày `checkInDate` và `checkOutDate`. 
* Ngăn chặn tình trạng đặt phòng quá công suất (Overbooking) thông qua kiểm tra trùng lặp lịch biểu tại tầng SQL.

### 2.2 Đặt phòng & Chọn Gói trị liệu (UC07)
* Khách hàng chọn biệt thự (`Villa`) và đính kèm gói trị liệu phục hồi (`RetreatPackage`).
* Lưu thông tin giá phòng và giá gói tại thời điểm đặt để tránh biến động giá trong tương lai.

### 2.3 Thanh toán đặt cọc 30% (UC08)
* Tính toán 30% giá trị đặt phòng làm khoản đặt cọc bắt buộc.
* Tích hợp cổng thanh toán trực tuyến để ghi nhận đặt cọc trước khi xác nhận booking.

### 2.4 Quản lý đặt phòng (UC09)
* Khách hàng hoặc Lễ tân có thể xem danh sách đặt phòng, cập nhật trạng thái hủy hoặc thay đổi thông tin lưu trú nếu hợp lệ.

### 2.5 Thủ tục Check-in & Đăng ký lưu trú (UC10)
* Lễ tân thực hiện kiểm tra giấy tờ tùy thân, đăng ký thẻ từ phòng nghỉ, chuyển trạng thái đặt phòng sang `CHECKED_IN` và trạng thái phòng sang `OCCUPIED`.

---

## 3. Bằng Chứng Kiểm Thử (Verification Evidence)

### 3.1 Kết quả JUnit Tests
```text
[INFO] Running fu.se.smms.service.impl.BookingServiceImplTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running fu.se.smms.service.impl.CheckInServiceImplTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 3.2 Luồng Check-in & Trạng thái phòng nghỉ
Khi khách làm thủ tục Check-in cho Villa-101:
* Trạng thái `RoomBooking` cập nhật từ `CONFIRMED` sang `CHECKED_IN`.
* Trạng thái `Room` cập nhật từ `AVAILABLE` sang `OCCUPIED`.
* Số thẻ từ (`Keycard`) được lưu chính xác vào hệ thống lữ hành.
