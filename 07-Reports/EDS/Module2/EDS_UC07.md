# EDS - UC07: Đặt phòng & Chọn Gói trị liệu (Room Booking & Package Selection)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng tiến hành đặt phòng lưu trú và lựa chọn đi kèm một Gói trị liệu phục hồi sức khỏe (`RetreatPackage`).
* **Quy tắc tính giá**: Giá phòng và giá gói tại thời điểm đặt lịch phải được đóng băng ghi nhận vào DB để phòng ngừa biến động giá trong tương lai.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /api/bookings/create` (Tạo đặt phòng mới)
* **Database Tables**:
  * `room_bookings` (`booking_id`, `user_id`, `room_id`, `package_id`, `check_in_date`, `check_out_date`, `room_price_at_booking`, `package_price_at_booking`, `status`)

---

# TDD - UC07: Đặt phòng & Chọn Gói trị liệu

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `BOOK-TC-001` — Đặt phòng thành công kèm gói trị liệu hợp lệ
* **Input**: `userId = 3`, `roomId = 2`, `packageId = 1`, `checkInDate = 2026-07-10`, `checkOutDate = 2026-07-14`.
* **Expected**: Trả về `201 Created`, trạng thái booking = `PENDING_DEPOSIT`.

### `BOOK-TC-002` — Đặt phòng trùng lặp lịch biểu
* **Input**: Đặt phòng nghỉ đã được đặt bởi người khác trong cùng khoảng ngày.
* **Expected**: Trả về `409 Conflict`.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.BookingServiceImplTest` -> `PASS`
