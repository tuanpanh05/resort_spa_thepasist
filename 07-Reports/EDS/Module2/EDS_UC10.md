# EDS - UC10: Thủ tục Check-in & Đăng ký lưu trú (Check-in Procedure & Keycard)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khi khách đến resort, Lễ tân thực hiện thủ tục Check-in:
* Xác minh danh tính của khách hàng (hộ chiếu/CCCD đã được mã hóa).
* Cấp và đăng ký mã số thẻ từ (`keycard_number`).
* Chuyển trạng thái booking sang `CHECKED_IN` và trạng thái phòng sang `OCCUPIED`.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /api/check-in/perform` (Thực hiện thủ tục check-in)
* **Database Tables**:
  * `room_bookings` (`status`, `keycard_number`), `rooms` (`status` = `OCCUPIED`)

---

# TDD - UC10: Thủ tục Check-in & Đăng ký lưu trú

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `CI-TC-001` — Check-in thành công với mã thẻ từ hợp lệ
* **Input**: `bookingId = 5`, `keycardNumber = 'CARD-99912'`.
* **Expected**: Trả về `200 OK`, trạng thái đặt phòng chuyển sang `CHECKED_IN`, trạng thái phòng nghỉ chuyển sang `OCCUPIED`.

### `CI-TC-002` — Check-in đơn đặt phòng chưa thanh toán cọc
* **Input**: Booking có trạng thái `PENDING_DEPOSIT`, gọi API check-in.
* **Expected**: Trả về `400 Bad Request` chặn không cho check-in.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.CheckInServiceImplTest` -> `PASS`
