# EDS - UC03: Quản lý tài khoản & Phân quyền nhân viên (RBAC)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Admin quản lý thông tin tài khoản nhân viên, phân quyền truy cập theo vai trò công việc và thực hiện khóa/mở khóa tài khoản khi cần thiết.
* **Quy tắc RBAC**: Đảm bảo nguyên tắc đặc quyền tối thiểu (Least Privilege).
* **Quy tắc Block Login**: Chặn truy cập hệ thống ngay lập tức đối với tài khoản có trạng thái `INACTIVE` hoặc `BANNED`.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /api/admin/users` (Xem danh sách tài khoản - Chỉ ADMIN)
  * `PATCH /api/admin/users/{id}/status` (Cập nhật trạng thái khóa/mở tài khoản)
  * `PATCH /api/admin/users/{id}/role` (Gán vai trò nhân viên)
* **Database Tables**:
  * `users` (`user_id`, `role`, `status`)

---

# TDD - UC03: Quản lý tài khoản & Phân quyền nhân viên

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `RBAC-TC-001` — Nhân viên có vai trò khác ADMIN cố truy cập trang Admin Dashboard
* **Input**: Request `GET /api/admin/users` với JWT của `role = STAFF`.
* **Expected**: Trả về `403 Forbidden`.

### `RBAC-TC-002` — Tài khoản bị khóa (status = INACTIVE) đăng nhập hệ thống
* **Input**: Email `locked_staff@ngusonresort.com`, password đúng.
* **Expected**: Trả về `403 Forbidden` hoặc `401 Unauthorized` kèm thông báo tài khoản đã bị khóa.

## 2. Kết Quả Xác Minh (Verification Result)
* **Integration Tests**: `AdminControllerTest` -> `PASS`
