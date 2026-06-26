# TDD - UC09: Quản lý đặt phòng (Booking Management)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Room booking lifetime management.
* Requirements: Hủy/Sửa đặt phòng lưu trú.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `MNG-TC-001` — Khách hàng tự hủy booking hợp lệ
* **Đầu vào (Input)**: Booking status = `CONFIRMED`, ngày check-in sau 5 ngày nữa. Khách gửi yêu cầu hủy.
* **Kỳ vọng (Expected)**: Hủy thành công, status cập nhật sang `CANCELLED`.

### `MNG-TC-002` — Chặn hủy booking khi đã check-in
* **Đầu vào (Input)**: Booking status = `CHECKED_IN`, gửi yêu cầu hủy.
* **Kỳ vọng (Expected)**: Thất bại, ném `400 Bad Request`.

## 3. Xác Minh Code (Verification)
* Unit tests in `BookingServiceImplTest`.
