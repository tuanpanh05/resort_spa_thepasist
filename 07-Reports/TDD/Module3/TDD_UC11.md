# TDD - UC11: Đặt lịch trị liệu trong gói (Schedule Spa/Therapy Session)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Package session scheduling.
* Requirements: Hạn mức số buổi theo gói, ràng buộc ngày hẹn trong khoảng lưu trú (BR-30).

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `SPAPKG-TC-001` — Đặt hẹn ngoài khoảng ngày lưu trú
* **Đầu vào (Input)**: Lưu trú `2026-07-10` đến `2026-07-13`. Đặt Spa ngày `2026-07-15`.
* **Kỳ vọng (Expected)**: Thất bại, ném `SPA-400` / `400 Bad Request`.

### `SPAPKG-TC-002` — Đặt vượt hạn mức số buổi trong gói
* **Đầu vào (Input)**: Gói có hạn mức tối đa 2 buổi. Thực hiện đặt buổi thứ 3.
* **Kỳ vọng (Expected)**: Thất bại, ném lỗi `SPA-400`.

## 3. Xác Minh Code (Verification)
* Unit tests in `SpaBookingServiceImplTest`.
