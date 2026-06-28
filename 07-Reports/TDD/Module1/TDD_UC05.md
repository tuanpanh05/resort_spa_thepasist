# TDD - UC05: Quyền được xóa dữ liệu sức khỏe (Right to Deletion)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Data minimization privacy compliance.
* Requirements: Xóa sạch thông tin bệnh lý/dị ứng nhạy cảm của khách lữ hành.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `DEL-TC-001` — Khách xóa thành công hồ sơ sức khỏe
* **Đầu vào (Input)**: Gọi API `DELETE /api/medical-profile/my-profile` bằng tài khoản Guest.
* **Kỳ vọng (Expected)**: DB thực thi xóa bản ghi trong bảng `medical_profile` tương ứng. API trả về `200 OK`.

### `DEL-TC-002` — Tài khoản Guest B cố xóa hồ sơ của Guest A
* **Đầu vào (Input)**: Gọi API xóa hồ sơ sức khỏe với ID của Guest A bằng Token của Guest B.
* **Kỳ vọng (Expected)**: API chỉ xóa hồ sơ của Guest B hoặc trả về `403 Forbidden` nếu chỉ định ID cụ thể.

## 3. Xác Minh Code (Verification)
* Unit tests in `MedicalProfileServiceImplTest`.
