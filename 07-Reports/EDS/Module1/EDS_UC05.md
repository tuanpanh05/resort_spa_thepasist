# EDS - UC05: Quyền được xóa dữ liệu sức khỏe (Right to Deletion / Data Minimization)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng có quyền yêu cầu xóa vĩnh viễn hồ sơ sức khỏe nhạy cảm của mình khỏi hệ thống lữ hành sau khi kết thúc kỳ nghỉ để bảo vệ quyền riêng tư cá nhân (tuân thủ Nghị định 13/2023/NĐ-CP).
* **Quy tắc dọn sạch**: Xóa hoàn toàn bản ghi trong bảng `medical_profile` liên quan đến `user_id` của khách hàng.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `DELETE /api/medical-profile/my-profile` (Xóa hồ sơ sức khỏe hiện tại của Khách)
* **Database Tables**:
  * `medical_profile`

---

# TDD - UC05: Quyền được xóa dữ liệu sức khỏe

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `DEL-TC-001` — Khách hàng thực hiện quyền xóa thông tin sức khỏe cá nhân
* **Input**: Đăng nhập bằng tài khoản Khách hàng A, gửi request `DELETE /api/medical-profile/my-profile`.
* **Expected**: Trả về `200 OK` hoặc `204 No Content`. Bản ghi trong bảng `medical_profile` của khách hàng biến mất hoàn toàn.

### `DEL-TC-002` — Tài khoản khác cố tình xóa hồ sơ sức khỏe của khách
* **Input**: Đăng nhập bằng tài khoản Khách hàng B, gửi request xóa hồ sơ sức khỏe kèm ID của Khách hàng A.
* **Expected**: Trả về `403 Forbidden` hoặc hệ thống tự động chỉ xóa hồ sơ của chính người gửi request (B).

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.MedicalProfileServiceImplTest` -> `PASS`
