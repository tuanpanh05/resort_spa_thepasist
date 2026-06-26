# TDD - UC14: Cập nhật trạng thái buổi trị liệu (Update Session Status)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Spa booking progress.
* Requirements: Cho phép Therapist cập nhật trạng thái làm việc thực tế.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `STATUS-TC-001` — Cập nhật thành công sang COMPLETED
* **Đầu vào (Input)**: Gọi API đổi trạng thái của `spaBookingId = 12` từ `SCHEDULED` sang `COMPLETED` với role `THERAPIST`.
* **Kỳ vọng (Expected)**: API trả về `200 OK`, trạng thái trong DB cập nhật thành công.

### `STATUS-TC-002` — Chặn cập nhật đối với vai trò GUEST
* **Đầu vào (Input)**: Gọi API bằng Token của vai trò `GUEST`.
* **Kỳ vọng (Expected)**: API trả về `403 Forbidden`.

## 3. Xác Minh Code (Verification)
* Security rules on `SpaBookingController.updateSessionStatus`.
