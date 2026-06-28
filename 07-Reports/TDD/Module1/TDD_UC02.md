# TDD - UC02: Khai báo hồ sơ sức khỏe & Dị ứng (Sensitive Health Profile & Explicit Consent)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Sensitive PII management.
* Requirements: Nghị định 13/2023/NĐ-CP (Explicit consent checkboxes, AES-256 database encryption at rest).

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `MED-TC-001` — Chặn lưu hồ sơ sức khỏe khi không ký cam kết đồng ý (Consent)
* **Đầu vào (Input)**: `physicalCondition = 'Thoát vị đĩa đệm'`, `explicitConsentSigned = false`.
* **Kỳ vọng (Expected)**: Thất bại, ném `BusinessException` với HTTP Status `400 Bad Request` và thông điệp yêu cầu đồng ý các điều khoản.

### `MED-TC-002` — Tự động mã hóa thông tin bệnh lý nhạy cảm trong Database
* **Đầu vào (Input)**: Lưu hồ sơ sức khỏe thành công với `physicalCondition = 'Thoát vị đĩa đệm'`, `explicitConsentSigned = true`.
* **Kỳ vọng (Expected)**: Bản ghi lưu trong bảng SQL Server có trường `physical_condition_encrypted` dạng chuỗi mã hóa AES-256, không chứa văn bản thô.

## 3. Xác Minh Code (Verification)
* JUnit Test Class: `fu.se.smms.controller.MedicalProfileControllerTest` -> `testSaveProfileWithoutConsent` & `testDbEncryption`
