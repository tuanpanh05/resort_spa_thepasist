# TDD - UC07: Đặt phòng & Chọn Gói trị liệu (Room Booking & Package Selection)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Room booking transaction.
* Requirements: Khởi tạo đặt phòng lưu trú kèm gói trị liệu phục hồi.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `BK-TC-001` — Đặt phòng kèm gói trị liệu hợp lệ
* **Đầu vào (Input)**: `userId = 3`, `roomId = 1`, `packageId = 2` (Mindfulness Weekend), `checkIn = 2026-07-15`, `checkOut = 2026-07-18`.
* **Kỳ vọng (Expected)**: Đơn hàng tạo thành công ở trạng thái `PENDING_DEPOSIT`.

### `BK-TC-002` — Đặt phòng đã bị book bởi người khác
* **Đầu vào (Input)**: Trùng thời gian với một đặt phòng đã xác nhận (status `CONFIRMED`).
* **Kỳ vọng (Expected)**: Thất bại, ném `409 Conflict`.

## 3. Xác Minh Code (Verification)
* Unit tests in `BookingServiceImplTest`.
