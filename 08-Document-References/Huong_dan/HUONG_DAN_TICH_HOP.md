# Hướng Dẫn Tích Hợp Và Gộp Mã Nguồn (Module 1 & Module 5)

Tài liệu này hướng dẫn chi tiết các bước tải mã nguồn từ GitLab xuống, cách gộp (merge) mã nguồn giữa **Module 1 (Đăng nhập/Đăng ký/Profile)** và **Module 5 (Thanh toán VNPay/Feedback/Hóa đơn)**, cùng với các lưu ý quan trọng để tránh lỗi biên dịch và xung đột cơ sở dữ liệu.

---

## 1. Các bước lấy mã nguồn từ GitLab và giải quyết xung đột (Merge Conflict)

Khi bạn hoặc đồng đội đẩy code mới lên nhánh `feature/module1` trên GitLab, dưới đây là quy trình chuẩn để cập nhật mã nguồn về máy cục bộ mà không làm mất các chỉnh sửa hiện tại.

### Bước 1: Commit các thay đổi chưa lưu ở máy cục bộ
Trước khi tiến hành kéo (pull) code mới, hãy chắc chắn thư mục làm việc của bạn đã sạch (không có file sửa đổi dở dang):
```bash
git add .
git commit -m "Commit tạm thời các sửa đổi trước khi merge"
```

### Bước 2: Kéo code từ remote branch
Chạy lệnh pull để kéo mã nguồn mới nhất:
```bash
git pull origin feature/module1
```

### Bước 3: Giải quyết xung đột đổi tên thư mục (Rename/Delete Conflicts)
Do cấu trúc thư mục được dọn dẹp ở cả local và remote theo các cách khác nhau (ví dụ: `03.SourceCode/Backend` đổi tên thành `backend` hoặc `backend-old`), Git sẽ báo lỗi xung đột đường dẫn. Cách xử lý:
1. **Đối với thư mục Backend**:
   - Thư mục `backend/` (viết thường) cục bộ của bạn chứa toàn bộ mã nguồn hợp nhất đã sửa lỗi. Chúng ta sẽ ưu tiên giữ phiên bản local:
     ```bash
     git checkout --ours backend/
     git add backend/
     ```
   - Xóa bỏ các thư mục thừa hoặc trùng lặp bị đổi tên khác trên remote (như `Backend/` viết hoa hoặc `backend-old/`):
     ```bash
     git rm -rf Backend backend-old
     ```
2. **Đối với các file cấu hình và trang Thanh toán (Module 5)**:
   - Các file batch chạy dự án (`run-project.bat`, `run_all.bat`), file tài liệu cấu hình (`BAO_CAO_CLEAN_CONFIG.md`) và trang thanh toán chính (`frontend/src/pages/Payment.jsx`) đã được bạn code hoàn chỉnh ở local, hãy giữ lại:
     ```bash
     git checkout --ours run-project.bat run_all.bat BAO_CAO_CLEAN_CONFIG.md frontend/src/pages/Payment.jsx frontend/.env.example frontend/src/firebase.js
     git add run-project.bat run_all.bat BAO_CAO_CLEAN_CONFIG.md frontend/src/pages/Payment.jsx frontend/.env.example frontend/src/firebase.js
     ```
3. **Đối với các file chức năng của Module 1 (Login/Register/Profile)**:
   - Lấy phiên bản hoàn thành từ phía remote (phía GitLab) cho các trang đăng nhập, đăng ký, quên mật khẩu và trang profile:
     ```bash
     git checkout --theirs frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx frontend/src/pages/ForgotPassword.jsx frontend/src/pages/HealthProfile.jsx frontend/src/pages/ProfilePage.jsx frontend/src/components/Header.jsx
     git add frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx frontend/src/pages/ForgotPassword.jsx frontend/src/pages/HealthProfile.jsx frontend/src/pages/ProfilePage.jsx frontend/src/components/Header.jsx
     ```

### Bước 4: Hoàn thành commit merge
Khi `git status` không còn file nào báo đỏ ở trạng thái `Unmerged paths`:
```bash
git commit -m "Merge branch 'origin/feature/module1' and resolve conflicts"
```

---

## 2. Cách gộp Module 1 và Module 5 (Các bước tích hợp kỹ thuật)

Dưới đây là các bước kỹ thuật đã thực hiện để gộp hai Module này chạy chung một ứng dụng:

### 2.1 Cấu trúc thư mục thống nhất
Toàn bộ mã nguồn được đưa về cấu trúc chuẩn hóa dạng lowercase (chữ thường) để tránh lỗi phân biệt chữ hoa/thường trên Linux/Windows:
- `backend/`: Mã nguồn Spring Boot (Java) duy nhất.
- `frontend/`: Mã nguồn React + Vite (Javascript) duy nhất.
- `docs/`: Chứa các tài liệu SRS, tài liệu thiết kế và database.

### 2.2 Tích hợp Backend
1. **Hợp nhất class cấu hình Security (`SecurityConfig.java`)**:
   - Cho phép các truy cập công khai đến endpoint đăng nhập, đăng ký và callback/IPN của VNPay (`/api/invoices/vnpay-callback`, `/api/invoices/vnpay-ipn`).
   - Cấu hình phân quyền truy cập: Các API thanh toán hóa đơn và quản lý doanh thu được phân quyền cho `RECEPTIONIST` và `MANAGER`.
2. **Hợp nhất bộ bắt lỗi toàn cục (`GlobalExceptionHandler.java`)**:
   - Đảm bảo bắt cả các lỗi xác thực dữ liệu đầu vào (Validation) của API đăng ký/đăng nhập lẫn các lỗi logic thanh toán của VNPay (`BusinessException`).
3. **Tách cấu hình nhạy cảm sang biến môi trường (`.env` & `application.properties`)**:
   - Sử dụng `.env` ở thư mục gốc để khai báo URL kết nối DB, Tài khoản SMTP gửi mail OTP, và mã bảo mật VNPay (`VNP_TMN_CODE`, `VNP_HASH_SECRET`).
   - Cấu hình trong `application.properties` sẽ đọc động từ các biến môi trường này thông qua cú pháp dạng `${VNP_HASH_SECRET}`.

### 2.3 Tích hợp Frontend
1. **Định tuyến (Routing) trong `App.jsx`**:
   - Kết hợp các route của Module 1 (`/dang-nhap`, `/dang-ky`, `/tai-khoan/*`) và các route thanh toán Module 5 (`/payment`, `/payment-result`).
   - Lưu ý route `/tai-khoan/*` có ký tự `*` ở đuôi vì trang Profile có sử dụng các sub-routes con để phân chia các Tab chức năng (Thông tin cá nhân, Đổi mật khẩu, Lịch sử đặt chỗ).
2. **Tích hợp Header điều hướng (`Header.jsx`)**:
   - Kiểm tra trạng thái đăng nhập từ `localStorage` (hoặc token). Nếu người dùng đã đăng nhập, hiển thị tên của họ làm liên kết dẫn tới `/tai-khoan` cùng với nút Đăng xuất.
3. **Đồng bộ hóa API Base URL**:
   - Cấu hình file `frontend/src/api/axiosClient.js` và các file kết nối sử dụng biến `import.meta.env.VITE_API_BASE_URL` để gọi API lên backend thay vì hardcode `http://localhost:8080/api`.

---

## 3. Các lưu ý quan trọng khi triển khai và kiểm thử

> [!IMPORTANT]
> **1. Lỗi phân biệt Chữ hoa - Chữ thường trên Git (Windows Case-Insensitivity)**
> Hệ điều hành Windows coi `Backend` và `backend` là một thư mục, nhưng Git trên GitLab coi đó là hai thư mục hoàn toàn khác nhau. Khi thực hiện các lệnh di chuyển file (như `git mv`), hãy thực hiện qua hai bước trung gian (ví dụ đổi sang tên tạm thời) để tránh mất file trên đĩa cứng cục bộ.

> [!WARNING]
> **2. Xung đột vai trò trong Database Seeder**
> Ràng buộc kiểm tra vai trò người dùng trong SQL Server (`CK_users_role`) chỉ cho phép các vai trò: `ADMIN`, `STAFF`, `THERAPIST`, `GUEST`, `MANAGER`, `RECEPTIONIST`, `CHEF`, `CUSTOMER`.
> Hãy đảm bảo file `DatabaseSeeder.java` không seed bất kỳ người dùng nào có vai trò ngoài danh sách trên (ví dụ: vai trò `SPA`, `YOGA`, `PHYSIO` trước đây phải được đổi thành `THERAPIST`). Nếu không, backend sẽ crash ngay khi khởi động vì vi phạm khóa CHECK constraint.

> [!TIP]
> **3. Thất lạc thư viện Maven Wrapper do `.gitignore`**
> Vì file `.gitignore` mặc định bỏ qua tất cả các file có đuôi `.jar`, các file chạy cục bộ của Maven wrapper (`.mvn/wrapper/maven-wrapper.jar`) có thể bị Git xóa bỏ khi commit.
> - **Giải pháp**: Nếu lệnh chạy Backend báo lỗi không tìm thấy classpath, hãy giải nén lại Maven sạch từ file zip `03.SourceCode/apache-maven-3.9.6-bin.zip` vào thư mục `backend/maven-extracted` và trỏ đường dẫn biến `MAVEN_HOME` trong script chạy về thư mục này.

> [!CAUTION]
> **4. Tài khoản Đăng nhập SQL Server**
> File cấu hình backend mặc định sử dụng tài khoản `sa` và mật khẩu `123`.
> Nếu SQL Server local của bạn cài đặt bằng Windows Authentication, bạn cần mở cửa sổ dòng lệnh và chạy truy vấn sau để kích hoạt chế độ Mixed Mode và đặt mật khẩu cho `sa`:
> ```sql
> ALTER LOGIN sa WITH PASSWORD = '123';
> ALTER LOGIN sa ENABLE;
> ```
