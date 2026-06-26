# TDD - UC10: Thủ tục Check-in & Đăng ký lưu trú (Check-in Procedure & Keycard)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Front-desk operational check-in.
* Requirements: Đăng ký thẻ từ phòng nghỉ, chuyển trạng thái đặt phòng và phòng nghỉ tương ứng.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `CI-TC-001` — Check-in thành công gán thẻ từ
* **Đầu vào (Input)**: `bookingId = 2`, `keycardNumber = 'CARD-7771'`.
* **Kỳ vọng (Expected)**: Booking status chuyển thành `CHECKED_IN`, Room status của phòng chuyển thành `OCCUPIED`, lưu đúng keycard number. Trả về `200 OK`.

### `CI-TC-002` — Chặn check-in khi chưa đóng cọc phòng
* **Đầu vào (Input)**: Booking có trạng thái `PENDING_DEPOSIT`.
* **Kỳ vọng (Expected)**: Thất bại, ném `400 Bad Request`.

## 3. Xác Minh Code (Verification)
* Unit tests in `CheckInServiceImplTest`.
