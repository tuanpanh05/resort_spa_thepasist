# EDS - UC06: Tìm kiếm & Kiểm tra phòng trống (Room Availability Engine)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng hoặc Lễ tân tìm kiếm các biệt thự (`Villa`) còn trống trong một khoảng thời gian lưu trú cụ thể (từ ngày `checkInDate` đến `checkOutDate`).
* **Ràng buộc Chống Đặt Quá Phòng (Overbooking)**: Phòng được coi là trống nếu nó không có lịch đặt phòng nào khác trùng lặp ở các trạng thái hoạt động (`CONFIRMED`, `CHECKED_IN`).

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /api/villas/available` (Lấy danh sách biệt thự trống kèm khoảng ngày)
* **Database Tables**:
  * `villas`, `room_bookings`
* **SQL Query Logic**:
  * Tìm kiếm phòng trống thông qua đối chiếu khoảng ngày loại trừ các booking trùng thời gian.

---

# TDD - UC06: Tìm kiếm & Kiểm tra phòng trống

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `ROOM-TC-001` — Tìm kiếm phòng với khoảng ngày hợp lệ
* **Input**: `checkInDate = 2026-07-01`, `checkOutDate = 2026-07-05`.
* **Expected**: Trả về `200 OK` cùng danh sách phòng không có lịch đặt trùng khớp.

### `ROOM-TC-002` — Chặn tìm kiếm với ngày check-out trước ngày check-in
* **Input**: `checkInDate = 2026-07-05`, `checkOutDate = 2026-07-01`.
* **Expected**: Trả về `400 Bad Request`.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.BookingServiceImplTest` -> `PASS`
