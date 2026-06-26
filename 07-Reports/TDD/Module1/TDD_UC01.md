# TDD - UC01: Đăng ký & Đăng nhập (Traditional Registration & Google SSO)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: User access authentication.
* Requirements: UC01 Đăng ký, OTP Verification, Đăng nhập truyền thống & Google SSO.
* Rule: Tránh Google login ghi đè họ tên của người dùng đã chỉnh sửa trên hệ thống.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `AUTH-TC-001` — Đăng ký tài khoản hợp lệ
* **Đầu vào (Input)**: `email = 'new_guest@ngusonresort.com'`, `password = 'SecurePass123'`, `fullName = 'Lê Văn B'`.
* **Kỳ vọng (Expected)**: DB lưu User có status = `INACTIVE`, nạp mã OTP và gửi email xác thực thành công. Trả về `201 Created`.

### `AUTH-TC-002` — Đăng nhập Google SSO lần đầu (Tạo tài khoản mới)
* **Đầu vào (Input)**: ID Token hợp lệ từ Google với `email = 'google_user@gmail.com'`, `name = 'Google User'`.
* **Kỳ vọng (Expected)**: Hệ thống tự động tạo User mới với status = `ACTIVE`, `fullName = 'Google User'`. Trả về JWT Token.

### `AUTH-TC-003` — Đăng nhập Google SSO không ghi đè họ tên hiện tại
* **Điều kiện trước (Pre-conditions)**: User đã tồn tại trong DB với `email = 'guest_modified@gmail.com'` và `fullName = 'Tên Đã Sửa'`.
* **Đầu vào (Input)**: Đăng nhập Google với cùng email, payload từ Google chứa `name = 'Tên Google Gốc'`.
* **Kỳ vọng (Expected)**: DB giữ nguyên `fullName` là `Tên Đã Sửa`. API trả về thành công.

## 3. Xác Minh Code (Verification)
* JUnit Test Class: `fu.se.smms.controller.AuthControllerTest` -> `testGoogleLoginDoesNotOverwriteName`
