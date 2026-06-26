# TDD - UC03: Quản lý tài khoản & Phân quyền nhân viên (RBAC)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Security Role-Based Access Control.
* Requirements: Phân quyền vai trò nhân viên, chặn đăng nhập tài khoản bị khóa.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `USER-TC-001` — Chặn người dùng vai trò STAFF thực hiện thao tác quản trị tài khoản
* **Đầu vào (Input)**: Gửi request `GET /api/admin/users` kèm theo token của tài khoản STAFF.
* **Kỳ vọng (Expected)**: API trả về `403 Forbidden`.

### `USER-TC-002` — Tài khoản locked (status = INACTIVE) cố đăng nhập
* **Đầu vào (Input)**: Gọi API đăng nhập truyền thống bằng tài khoản có trạng thái `INACTIVE`.
* **Kỳ vọng (Expected)**: API trả về `403 Forbidden` ngăn chặn truy cập.

## 3. Xác Minh Code (Verification)
* Security configurations in `fu.se.smms.config.SecurityConfig` and `fu.se.smms.controller.AdminControllerTest`.
