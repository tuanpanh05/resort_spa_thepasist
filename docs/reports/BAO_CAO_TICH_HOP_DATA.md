# BÁO CÁO CẬP NHẬT TÍCH HỢP DATA THẬT & LOẠI BỎ OFFLINE FALLBACK

Kính gửi các thành viên trong đội ngũ phát triển,

Dưới đây là báo cáo chi tiết về việc cập nhật kết nối dữ liệu thật (real data) và loại bỏ chế độ ngoại tuyến giả lập (offline fallback) trên môi trường kiểm thử Front-end.

---

## 1. Các thay đổi chính (Cập nhật ngày 12/06/2026)

### 🔴 Loại bỏ hoàn toàn chế độ Fallback Offline
Trước đây, để thuận tiện cho việc phát triển giao diện khi chưa có Backend, chúng ta có tích hợp cơ chế tự động bỏ qua lỗi kết nối (Catch-block fallback) để đăng nhập hoặc đăng ký thành công dưới dạng offline. 

Hiện tại, **chế độ này đã bị gỡ bỏ hoàn toàn** tại hai trang chính:
1. **Đăng nhập (`Login.jsx`):** 
   - Đăng nhập tài khoản bằng Email/Mật khẩu và Đăng nhập bằng Google qua Firebase đều yêu cầu Backend hoạt động bình thường.
   - Nếu máy chủ lỗi hoặc không phản hồi, hệ thống sẽ báo lỗi: *"Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau."* thay vì tự động cho phép truy cập offline.
2. **Đăng ký (`Register.jsx`):** 
   - Khi bấm đăng ký, hệ thống sẽ thực hiện gửi yêu cầu thật đến Backend. Nếu xảy ra lỗi kết nối mạng hoặc Backend tắt, trang đăng ký sẽ dừng lại và hiển thị thông báo lỗi.

> [!NOTE]
> **Hỗ trợ gõ nhanh:** Trình đăng nhập vẫn giữ tính năng tự động thêm hậu tố `@nguson.com` khi người dùng gõ nhanh các tài khoản test (ví dụ: gõ `admin` sẽ tự chuyển thành `admin@nguson.com`, `staff` -> `staff@nguson.com`, v.v.) trước khi gửi request tới Backend.

---

## 2. Bản đồ Trạng thái Tích hợp Dữ liệu (Real vs Mock Data)

Dưới đây là chi tiết các thành phần đang sử dụng Dữ liệu thật (API) hoặc Dữ liệu giả lập (Mock) để mọi người nắm rõ khi chạy thử nghiệm:

| Thành phần / Trang | Trạng thái Dữ liệu | API Endpoint / Nguồn dữ liệu |
| :--- | :---: | :--- |
| **Đăng nhập (Login)** | ✅ **THẬT** | `POST /api/auth/login` và `/api/auth/google` |
| **Đăng ký (Register)** | ✅ **THẬT** | `POST /api/auth/register` |
| **Quên mật khẩu** | ✅ **THẬT** | `POST /api/auth/forgot-password` & `/verify-otp` |
| **Thông tin cá nhân (Profile)** | ✅ **THẬT** | `/api/users/profile` |
| **Hồ sơ sức khỏe (Health)** | ✅ **THẬT** | `/api/medical-profiles/...` |
| **Quản lý Tài khoản (Admin)** | ✅ **THẬT** | `/api/admin/users` (Xem, Tạo, Sửa, Xóa tài khoản) |
| **Quản lý Dịch vụ (Admin)** | ✅ **THẬT** | `/api/master-data/...` (Spa Services, Packages, Rooms) |
| **Trang chủ & Landing Pages** | ⚠️ **MOCK** | Hiển thị thông tin tĩnh giới thiệu khu nghỉ dưỡng. |
| **Staff Dashboard** | ⚠️ **MOCK** | Giữ Mock data (`src/mockData.js`) vì chưa có API cho Staff. |
| **Chef Dashboard** | ⚠️ **MOCK** | Giữ Mock data (`src/mockData.js`) vì chưa có API cho Bếp. |
| **Specialist Dashboard** | ⚠️ **MOCK** | Giữ Mock data (`src/mockData.js`) vì chưa có API cho Chuyên gia. |

---

## 3. Cách thức Chạy Kiểm thử (Testing Guide)

1. **Khởi động Backend:** 
   - Đảm bảo server Spring Boot chạy tại địa chỉ `http://localhost:8080`.
2. **Khởi động Front-end:**
   - Chạy lệnh `npm run dev` để bắt đầu môi trường phát triển local.
3. **Kiểm tra đăng nhập:**
   - Sử dụng các tài khoản đã được insert sẵn trong database backend (hoặc đăng ký mới).
   - Hãy thử tắt server Backend và thực hiện Đăng nhập/Đăng ký để xác minh thông báo lỗi kết nối xuất hiện đúng như thiết kế.

---

Bản cập nhật đã được build và xác thực thành công (`npm run build`). Vui lòng cập nhật code mới nhất về máy để tiếp tục kiểm thử.

*Trân trọng,*  
*Antigravity AI*
