# TDD - UC06: Tìm kiếm & Kiểm tra phòng trống (Room Availability Engine)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Room inventory management.
* Requirements: Tìm kiếm biệt thự trống không bị gán lịch đặt phòng trước đó.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `ROOM-TC-001` — Lọc phòng trống theo ngày
* **Đầu vào (Input)**: Khung ngày `checkInDate = 2026-07-01`, `checkOutDate = 2026-07-05`.
* **Kỳ vọng (Expected)**: Kết quả trả về danh sách các phòng trống. Phòng `Villa-101` đã được đặt trước đó vào ngày `2026-07-02` sẽ không hiển thị trong kết quả.

### `ROOM-TC-002` — Kiểm tra tính hợp lệ ngày nhập
* **Đầu vào (Input)**: `checkInDate = 2026-07-10`, `checkOutDate = 2026-07-08` (ngày đi trước ngày đến).
* **Kỳ vọng (Expected)**: Trả về lỗi `400 Bad Request` chặn tìm kiếm.

## 3. Xác Minh Code (Verification)
* Unit tests in `BookingServiceImplTest`.
