# BÁO CÁO HOÀN THIỆN & KIỂM THỬ MODULE 1
## Authentication & Sensitive Health Profile (UC01–UC05)
### Dự án: Ngũ Sơn Resort & Spa Management System (NSRMS)

---

## 1. Tổng Quan Kết Quả Công Việc

Module 1 chịu trách nhiệm thiết lập nền tảng bảo mật cho NSRMS, bao gồm xác thực người dùng, OTP, Google SSO, phân quyền vai trò (RBAC), quản lý dữ liệu danh mục (Master Data), và quản lý hồ sơ sức khỏe nhạy cảm bảo mật theo Nghị định 13/2023/NĐ-CP.

### Kết quả tổng thể:
* **Backend Spring Boot**: REST API hoàn thiện và bảo mật tuyệt đối với Spring Security + JWT Token.
* **Mã hóa Dữ liệu (Encryption-at-Rest)**: Tự động mã hóa AES-256 đối với CCCD/Hộ chiếu, Bệnh lý và Dị ứng ăn uống khi lưu xuống SQL Server.
* **Explicit Consent (Đồng thuận rõ ràng)**: UI hiển thị checkbox cam kết sức khỏe trống mặc định, bắt buộc tích chọn thủ công mới cho phép lưu trữ.
* **RBAC Guard**: Therapist chỉ truy cập được bệnh lý thể chất; Chef chỉ tiếp cận dị ứng ăn uống; Receptionist không được phép xem cả hai dữ liệu nhạy cảm này.
* **JUnit Tests**: **9/9 tests PASS 100%**.

---

## 2. Chi Tiết Các Tính Năng Hoàn Thành

### 2.1 Đăng ký & Đăng nhập (UC01)
* Xác thực truyền thống qua email + mã OTP gửi tự động.
* Đăng nhập một chạm Google SSO.
* Sửa lỗi tự động ghi đè họ tên: Nếu người dùng thay đổi họ tên trên hệ thống, lần đăng nhập Google SSO tiếp theo sẽ **không** ghi đè tên cũ từ tài khoản Google lên tên mới đã sửa đổi.

### 2.2 Khai báo hồ sơ sức khỏe & Dị ứng (UC02)
* Checkbox đồng thuận xử lý thông tin nhạy cảm trống mặc định. Nếu không tích chọn, hệ thống chặn lưu và báo lỗi.
* Mã hóa dữ liệu tự động ở tầng JPA AttributeConverter. Dữ liệu thô trong Database là chuỗi nhị phân mã hóa không thể đọc trực tiếp.

### 2.3 Quản lý tài khoản & Phân quyền nhân viên (UC03)
* Admin Dashboard quản lý nhân viên, gán vai trò (`STAFF`, `THERAPIST`, `CHEF`, `ADMIN`) và trạng thái hoạt động.
* Chặn đăng nhập đối với các tài khoản bị khóa (`INACTIVE` hoặc `BANNED`).

### 2.4 Quản lý dữ liệu danh mục - Master Data (UC04)
* Thiết lập API CRUD cho loại phòng (`RoomType`), dịch vụ Spa (`SpaService`), và gói trị liệu (`RetreatPackage`).

### 2.5 Quyền được xóa dữ liệu (UC05)
* Cho phép khách hàng yêu cầu xóa vĩnh viễn hồ sơ sức khỏe (Data Minimization) sau khi kết thúc kỳ nghỉ, tự động dọn sạch dữ liệu nhạy cảm khỏi DB.

---

## 3. Bằng Chứng Kiểm Thử (Verification Evidence)

### 3.1 Kết quả JUnit Tests
```text
[INFO] Running fu.se.smms.controller.AuthControllerTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running fu.se.smms.controller.MedicalProfileControllerTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 3.2 Minh họa dữ liệu mã hóa trong SQL Server
```sql
SELECT email, role, id_passport_encrypted FROM users WHERE email = 'guest1@gmail.com';
-- Kết quả: 'guest1@gmail.com', 'GUEST', 'U2FsdGVkX19q3mO6pEc...' (AES-256 encrypted)
```
