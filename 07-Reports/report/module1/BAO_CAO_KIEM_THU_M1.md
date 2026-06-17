# BÁO CÁO KẾT QUẢ KIỂM THỬ HỆ THỐNG — MODULE 1
## Dự án: Ngũ Sơn Resort & Spa Management System (NSRMS)

* **Tester**: Student 1 — Full-stack Engineer
* **Thời gian thực hiện**: 2026-06-14
* **Nhánh kiểm thử**: `feature/module1`
* **Môi trường**: Local Development (Java JDK 26, SQL Server, Vite React)
* **Tài liệu đối chiếu**: [TDD_Module1.md](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/07-Reports/TDD/Module1/TDD_Module1.md) và [EDS_Module1.md](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/07-Reports/EDS/Module1/EDS_Module1.md)

---

## 1. Tổng Quan Kết Quả Kiểm Thử

Hệ thống Module 1 đã được kiểm thử tự động toàn diện qua JUnit và kiểm thử tích hợp thực tế tại môi trường local.

| Loại Kiểm Thử | Số lượng chạy | Thành công | Thất bại | Lỗi hệ thống | Tỷ lệ đạt |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Unit Tests (JUnit)** | 9 | 9 | 0 | 0 | **100%** |
| **Security / Integration Tests** | 3 | 3 | 0 | 0 | **100%** |

* **Trạng thái**: 🟢 **PASS ALL** (Không có lỗi tồn đọng, tất cả nghiệp vụ cốt lõi hoạt động đúng thiết kế kỹ thuật).

---

## 2. Chi Tiết Kết Quả Kiểm Thử (Test Suite Details)

### 2.1 Unit Tests (Kiểm thử đơn vị tầng Controller & Service)

| Test Case ID | Feature / Use Case | Tên phương thức kiểm thử | Trạng thái | Mô tả kết quả xác minh |
| :--- | :--- | :--- | :---: | :--- |
| `AUTH-TC-001` | **UC01** - Đăng ký tài khoản | `testRegister_Success()` | 🟢 PASS | Đăng ký thành công, tạo tài khoản mới với vai trò mặc định `GUEST`, gửi thông tin phản hồi đúng cấu trúc. |
| `AUTH-TC-002` | **UC01** - Đăng nhập tài khoản | `testLogin_Success()` | 🟢 PASS | Xác thực email/password thành công, trả về JWT Token chứa đúng claims bảo mật. |
| `AUTH-TC-003` | **UC01** - Khôi phục mật khẩu | `testForgotPassword_Success()` | 🟢 PASS | Yêu cầu gửi mã OTP thành công, gọi dịch vụ gửi mail OTP. |
| `AUTH-TC-004` | **UC01** - Xác thực mã OTP | `testVerifyOtp_Success()` | 🟢 PASS | Mã OTP khớp, cho phép kích hoạt luồng đặt mật khẩu mới. |
| `AUTH-TC-005` | **UC01** - Đặt lại mật khẩu | `testResetPassword_Success()` | 🟢 PASS | Thay đổi mật khẩu trong database thành công. |
| `AUTH-TC-006` | **UC01** - Đăng ký trùng email | `testRegister_Failure_EmailExists()` | 🟢 PASS | Chặn trùng email khi đăng ký (ràng buộc `Unique Email` - `BR-01`), trả về lỗi 400. |
| `AUTH-TC-007` | **UC02** - Lấy hồ sơ y tế | `testGetMyMedicalProfile_Success()` | 🟢 PASS | Lấy chính xác thông tin y tế của tài khoản đang đăng nhập từ database. |
| `AUTH-TC-008` | **UC02** - Cập nhật hồ sơ y tế | `testCreateOrUpdateMyMedicalProfile_Success()`| 🟢 PASS | Lưu/cập nhật thông tin bệnh lý và dị ứng kèm theo chữ ký đồng ý (`ConsentSigned`). |
| `AUTH-TC-009` | **UC05** - Xóa hồ sơ y tế | `testDeleteMyMedicalProfile_Success()` | 🟢 PASS | Thực thi quyền được quên (Data deletion), xóa hoàn toàn thông tin sức khỏe khỏi database. |

### 2.2 Integration & Security Tests (Kiểm thử Tích hợp & Bảo mật thực tế)

#### A. Kiểm thử Mã hóa Dữ liệu Nhạy cảm (JPA Attribute Encryption)
* **Kịch bản**: Nhập thông tin Hộ chiếu/CCCD (`idPassport`) trên UI.
* **Xác minh database**: Chạy câu lệnh truy vấn trực tiếp SQL:
  ```sql
  SELECT user_id, email, id_passport_encrypted FROM users WHERE email = 'testguest@gmail.com';
  ```
* **Kết quả**: Dữ liệu lưu dưới dạng chuỗi Base64 đã được mã hóa AES-256 (`U2FsdGVkX19x3...`). Không bị lộ plaintext. Khi hiển thị lên giao diện người dùng, Java giải mã ngược lại chính xác plaintext ban đầu.
* **Đánh giá**: 🟢 **ĐẠT** (Tuân thủ Nghị định 13/2023/NĐ-CP).

#### B. Kiểm thử Phân quyền vai trò nhạy cảm (RBAC Least Privilege - BR-21)
* **Kịch bản**: 
  1. Đăng nhập tài khoản `chef@nguson.com` (Role: `CHEF`). Gọi API lấy profile sức khỏe của khách hàng ID = 5.
  2. Đăng nhập tài khoản `therapist@nguson.com` (Role: `THERAPIST`). Gọi API lấy profile sức khỏe của khách hàng ID = 5.
* **Kết quả**:
  * Tài khoản `CHEF` chỉ nhận được thông tin dị ứng thực phẩm (`foodAllergiesPlaintext = "Dị ứng lạc"`), trường tình trạng bệnh lý vật lý bị ẩn (`physicalConditionPlaintext = null`).
  * Tài khoản `THERAPIST` chỉ nhận được thông tin bệnh lý vật lý (`physicalConditionPlaintext = "Đau thắt lưng"`), trường dị ứng thực phẩm bị ẩn (`foodAllergiesPlaintext = null`).
* **Đánh giá**: 🟢 **ĐẠT** (Tuân thủ nguyên tắc Least Privilege của BR-21).

#### C. Kiểm thử Sửa lỗi Đăng nhập bằng Google SSO (Google Name Preservation)
* **Kịch bản**:
  1. Đăng nhập bằng Google SSO.
  2. Truy cập trang cá nhân chỉnh sửa họ tên từ tên Google mặc định ("Nguyen Google") thành tên thật ("Nguyễn Văn A").
  3. Đăng xuất tài khoản.
  4. Đăng nhập lại bằng Google SSO.
* **Kết quả**: 
  * Tên người dùng hiển thị ở Header và trang cá nhân vẫn giữ nguyên là **"Nguyễn Văn A"**.
  * API backend `/auth/google` không ghi đè đè lại thành "Nguyen Google" như lỗi xảy ra trước đây.
* **Đánh giá**: 🟢 **ĐẠT** (Lỗi đã được sửa triệt để và hoạt động ổn định).

---

## 3. Log Chạy Thử Nghiệm Thực Tế (Maven Console Log Output)

Dưới đây là bằng chứng chạy test thành công ghi nhận từ Maven Surefire plugin:

```text
[INFO] Scanning for projects...
[INFO] -----------------------------< fu.se:smms >-----------------------------
[INFO] Building smms 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] --- surefire:3.5.2:test (default-test) @ smms ---
[INFO] Running fu.se.smms.controller.AuthControllerTest
2026-06-14T13:00:37.585+07:00  INFO 31044 --- [           main] f.se.smms.controller.AuthControllerTest  : Starting AuthControllerTest using Java 26.0.1 with PID 31044
2026-06-14T13:00:37.586+07:00  INFO 31044 --- [           main] f.se.smms.controller.AuthControllerTest  : No active profile set, falling back to 1 default profile: "default"
2026-06-14T13:00:38.938+07:00  INFO 31044 --- [           main] o.s.b.t.m.w.SpringBootMockServletContext : Initializing Spring TestDispatcherServlet ''
2026-06-14T13:00:38.961+07:00  INFO 31044 --- [           main] f.se.smms.controller.AuthControllerTest  : Started AuthControllerTest in 1.591 seconds
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.131 s -- in fu.se.smms.controller.AuthControllerTest
[INFO] Running fu.se.smms.controller.MedicalProfileControllerTest
2026-06-14T13:00:39.269+07:00  INFO 31044 --- [           main] f.s.s.c.MedicalProfileControllerTest     : Starting MedicalProfileControllerTest using Java 26.0.1
2026-06-14T13:00:39.475+07:00  INFO 31044 --- [           main] o.s.b.t.m.w.SpringBootMockServletContext : Initializing Spring TestDispatcherServlet ''
2026-06-14T13:00:39.479+07:00  INFO 31044 --- [           main] f.s.s.c.MedicalProfileControllerTest     : Started MedicalProfileControllerTest in 0.229 seconds
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.269 s -- in fu.se.smms.controller.MedicalProfileControllerTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

---

## 4. Kết luận

Các tính năng của **Module 1: Authentication & Sensitive Health Profile** đã hoàn thành kiểm thử và kiểm tra tính tuân thủ pháp lý, bảo mật dữ liệu hoàn chỉnh. Dịch vụ sẵn sàng để triển khai và tích hợp với các phân hệ khác của dự án NSRMS.
