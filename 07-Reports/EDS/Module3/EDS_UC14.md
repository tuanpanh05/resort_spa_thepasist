# EDS - UC14: Cập nhật trạng thái buổi trị liệu (Update Session Status)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Kỹ thuật viên cập nhật tiến độ của buổi trị liệu từ bảng điều khiển công việc:
* `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED` / `NO_SHOW`.
* Trạng thái hoàn thành là điều kiện cần để hệ thống kiểm soát khóa Checkout lữ hành của lễ tân ở Module 5.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `PATCH /v1/spa-bookings/{id}/status?status=COMPLETED`
* **Database Tables**:
  * `spa_booking` (cột `status`)

---

# TDD - UC14: Cập nhật trạng thái buổi trị liệu

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `STAT-TC-001` — Kỹ thuật viên cập nhật trạng thái thành COMPLETED
* **Input**: `spaBookingId = 10`, `status = 'COMPLETED'`.
* **Expected**: Trả về `200 OK`, trạng thái trong DB đổi sang `COMPLETED`.

### `STAT-TC-002` — Tài khoản vai trò khác cố cập nhật trạng thái
* **Input**: Đăng nhập bằng tài khoản GUEST, gọi API cập nhật trạng thái buổi trị liệu.
* **Expected**: Trả về `403 Forbidden`.

## 2. Kết Quả Xác Minh (Verification Result)
* **API Tests**: `SpaBookingControllerTest` -> `PASS`
