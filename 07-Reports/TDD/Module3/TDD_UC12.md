# TDD - UC12: Tự động ghép lịch thông minh (Auto-match Specialist & Room)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Auto-matching scheduling engine.
* Requirements: Ghép chuyên gia và phòng trống theo chuyên môn cụ thể.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `MATCH-TC-001` — Ghép tự động đúng chuyên gia trị liệu
* **Đầu vào (Input)**: Khách chọn dịch vụ có category = `SPA`.
* **Kỳ vọng (Expected)**: Hệ thống tự động chọn kỹ thuật viên có specialty = `SPA` và phòng trị liệu thuộc danh mục `SPA`.

### `MATCH-TC-002` — Graceful fallback khi hết chuyên gia chuyên môn
* **Đầu vào (Input)**: Đặt dịch vụ `YOGA` nhưng tất cả HLV Yoga đều bận.
* **Kỳ vọng (Expected)**: Hệ thống tự động fallback tìm kiếm chuyên gia tổng quát (specialty = `SPA` hoặc rảnh rỗi bất kỳ) để đề xuất.

## 3. Xác Minh Code (Verification)
* Unit tests in `SpaBookingServiceImplTest` -> `testAutoMatchFallbacks`.
