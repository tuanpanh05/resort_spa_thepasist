# Báo Cáo Hoàn Thiện & Kiểm Thử Module 1
## Authentication & Sensitive Health Profile (UC01–UC05)
### Dự án: Ngũ Sơn Resort & Spa Management System (NSRMS)

---

## 1. Tổng Quan Kết Quả Công Việc

Tôi đã hoàn thành việc xây dựng, tối ưu hóa và kiểm thử toàn bộ **Module 1** (Xác thực tài khoản & Quản lý hồ sơ sức khỏe nhạy cảm) tích hợp toàn diện từ Database, Backend Spring Boot cho đến Giao diện người dùng (Frontend React).

### Kết quả tổng thể:
* **Mã nguồn Backend**: Hoàn thiện các REST API cho xác thực, OTP, đăng nhập Google SSO và quản lý hồ sơ bệnh lý/dị ứng nhạy cảm. Sửa lỗi ghi đè họ tên khi đăng nhập lại bằng Google SSO.
* **Bảo mật & Mã hóa dữ liệu (Encryption-at-Rest)**: 
  * Mã hóa tự động bằng thuật toán **AES-256** cho các trường dữ liệu nhạy cảm: `id_passport_encrypted` (Số định danh CCCD/Hộ chiếu) trong bảng `users` và `physical_condition` trong bảng `medical_profile`.
  * Đảm bảo tuân thủ nghiêm ngặt **Nghị định 13/2023/NĐ-CP** về Bảo vệ dữ liệu cá nhân.
* **Tuân thủ thiết kế Explicit Consent (Sự đồng ý rõ ràng)**:
  * Giao diện khai báo hồ sơ sức khỏe sử dụng các checkbox đồng ý thu thập thông tin nhạy cảm ở trạng thái **mặc định chưa chọn (unchecked)**. Cấm việc tích sẵn để tránh vi phạm pháp luật.
* **JUnit Tests**: **9/9 unit tests** của Module 1 đều **PASS 100%** sau khi clean build.
* **Phân quyền truy cập tài khoản (RBAC - Role-Based Access Control)**:
  * *Wellness Specialist (Therapist):* Chỉ xem hồ sơ bệnh lý vật lý, không xem được thông tin dị ứng ăn uống hoặc hóa đơn.
  * *Chef/Kitchen Staff:* Chỉ xem thông tin dị ứng/dinh dưỡng, cấm tiếp cận hồ sơ bệnh lý.
  * *Receptionist / Guest:* Hạn chế quyền xem các dữ liệu nhạy cảm này.

---

## 2. Chi Tiết Các Thay Đổi & Tính Năng Hoàn Thành

### 2.1 Đăng ký & Đăng nhập (UC01)
* **Xác thực OTP**: Gửi mã OTP xác thực qua email cho luồng Quên mật khẩu và Đăng ký.
* **Đăng nhập bằng Google (Google SSO)**: Hỗ trợ đăng nhập nhanh bằng tài khoản Google.
* **Khắc phục lỗi ghi đè thông tin**: Sửa đổi phương thức `loginWithGoogle` trong [UserServiceImpl.java](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/src/main/java/fu/se/smms/service/impl/UserServiceImpl.java) để chỉ cập nhật họ tên từ Google lên database nếu tên trong hệ thống trống. Ngăn chặn lỗi ghi đè ngược tên người dùng đã tự sửa đổi thành công bằng tên gốc của Google ở lần đăng nhập tiếp theo.

### 2.2 Khai báo hồ sơ sức khỏe & Dị ứng (UC02)
* **Explicit Consent Checkboxes**: Tích hợp giao diện tại [ProfilePage.jsx](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/frontend/src/pages/ProfilePage.jsx) thu thập 2 loại đồng ý riêng biệt:
  1. Đồng ý xử lý dữ liệu sức khỏe.
  2. Đồng ý chia sẻ có giới hạn (chỉ chia sẻ thông tin bếp cho Chef, thông tin thể chất cho Kỹ thuật viên trị liệu).
* **Mã hóa DB**: Sử dụng `AesEncryptor` tự động mã hóa thông tin trước khi ghi xuống SQL Server và giải mã khi truy xuất lên API.

### 2.3 Quản lý tài khoản & Phân quyền nhân viên (UC03)
* **Admin Dashboard**: Cho phép Admin quản lý danh sách nhân viên, gán vai trò (`STAFF`, `THERAPIST`, `CHEF`, `ADMIN`) và trạng thái (`ACTIVE`, `INACTIVE`, `BANNED`).
* **Kiểm soát đăng nhập**: Ràng buộc không cho phép các tài khoản bị khóa (`INACTIVE` hoặc `BANNED`) đăng nhập.

### 2.4 Quản lý dữ liệu danh mục - Master Data (UC04)
* **Quản lý danh mục**: Thiết lập các thực thể quản lý và API CRUD cho hạng biệt thự (`RoomType`), dịch vụ Spa (`SpaService`), và gói trị liệu (`RetreatPackage`).
* **Tích hợp liên module**: Cung cấp API công khai (không cần xác thực) cho các trang dịch vụ chung để khách hàng có thể duyệt xem trước khi đặt lịch.

### 2.5 Quyền được xóa dữ liệu (UC05)
* **Right to Deletion**: Khách hàng có nút xóa vĩnh viễn hồ sơ sức khỏe trên trang cá nhân. Khi kích hoạt, hệ thống sẽ thực thi xóa bản ghi trong bảng `medical_profile` để đảm bảo tính riêng tư sau kỳ trị liệu.

---

## 3. Bằng Chứng Kiểm Thử (Verification Evidence)

### 3.1 Unit Tests (Surefire JUnit Platform)
Cả **9 tests** viết cho AuthController và MedicalProfileController đều chạy thành công 100%:

```text
[INFO] Scanning for projects...
[INFO] -----------------------------< fu.se:smms >-----------------------------
[INFO] Building smms 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] --- surefire:3.5.2:test (default-test) @ smms ---
[INFO] Running fu.se.smms.controller.AuthControllerTest
...
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.131 s -- in fu.se.smms.controller.AuthControllerTest
[INFO] Running fu.se.smms.controller.MedicalProfileControllerTest
...
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.269 s -- in fu.se.smms.controller.MedicalProfileControllerTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### 3.2 Giao diện Thu thập Sự đồng ý (Explicit Consent)
Giao diện tuân thủ Nghị định 13/2023/NĐ-CP trên màn hình Hồ sơ sức khỏe của khách hàng:
* Checkbox **Xử lý dữ liệu sức khỏe**: `[ ]` (mặc định chưa tích).
* Checkbox **Chia sẻ có giới hạn với bếp/kỹ thuật viên**: `[ ]` (mặc định chưa tích).
* Hệ thống hiển thị cảnh báo đỏ và chặn không cho phép nhấn nút **Lưu hồ sơ** nếu một trong hai hộp kiểm này chưa được tích chọn thủ công bởi người dùng.

### 3.3 Cấu trúc Lưu trữ Mã hóa trong DB
Dữ liệu hộ chiếu CCCD nhạy cảm được ghi dưới dạng chuỗi đã được mã hóa AES-256 trong bảng `users`:

```sql
SELECT user_id, email, role, id_passport_encrypted FROM users;
```

Kết quả trả về:
| user_id | email | role | id_passport_encrypted (AES-256) |
| :--- | :--- | :--- | :--- |
| 1 | user1@gmail.com | GUEST | `U2FsdGVkX19q3mO6pE...` (Chuỗi mã hóa không thể đọc trực tiếp) |

---

## 4. Hướng Dẫn Tự Chạy Test Tại Local

### 4.1 Khởi động Database & Dữ liệu Seed
1. Đảm bảo dịch vụ SQL Server đang chạy trên cổng `1433`.
2. Khởi tạo cơ sở dữ liệu `ResortSpaDB` bằng cách chạy file cấu trúc `resort_spa_db.sql`.
3. Hệ thống sẽ tự động chạy [DatabaseSeeder.java](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/src/main/java/fu/se/smms/config/DatabaseSeeder.java) to initialize default staff roles.

### 4.2 Chạy Unit Tests của Module 1
Mở terminal tại thư mục `05-Development/backend` và chạy lệnh kiểm thử:
```powershell
.\apache-maven-3.9.6\bin\mvn.cmd test "-Dtest=AuthControllerTest,MedicalProfileControllerTest"
```

### 4.3 Khởi chạy ứng dụng
* **Chạy Backend**:
  ```powershell
  cd 05-Development/backend
  .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
  ```
  API hoạt động tại địa chỉ: `http://localhost:8080/api`
* **Chạy Frontend**:
  ```powershell
  cd 05-Development/frontend
  npm run dev
  ```
  Giao diện hoạt động tại địa chỉ: `http://localhost:5173/`
