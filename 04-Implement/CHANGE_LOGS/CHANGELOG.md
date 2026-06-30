# 📋 CHANGELOG – SMMS Ngũ Sơn Resort & Spa Management System

> **Dự án:** SWP391 – SE2023-G3  
> **Hệ thống:** Spa & Resort Management System (SMMS)  
> **Cập nhật:** 2026-06-27  
> **Định dạng:** [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) | [Semantic Versioning](https://semver.org/)

---

## Quy tắc ghi Changelog

Mọi thay đổi **phải** được ghi theo format sau trước khi merge vào `main`:

- **Added** – Tính năng mới được thêm vào.
- **Changed** – Thay đổi tính năng đã tồn tại.
- **Deprecated** – Tính năng sắp bị loại bỏ trong tương lai.
- **Removed** – Tính năng bị xóa hoàn toàn.
- **Fixed** – Sửa lỗi.
- **Security** – Sửa lỗ hổng bảo mật.

---

## [Unreleased] – Sprint hiện tại

### Added
- [ ] *(Ghi vào đây tính năng mới đang phát triển)*

### Fixed
- [ ] *(Ghi vào đây bug đang được sửa)*

---

## [1.5.0] – 2026-06-27

### Added
- **Module 5 (Checkout & Analytics):** Thêm trang Payment (`Payment.jsx`, `PaymentResult.jsx`) tích hợp VNPay Gateway thực tế.
- **Module 5:** Thêm endpoint `POST /api/invoices/{id}/payment-url` để tạo link thanh toán VNPay.
- **Module 5:** Trang `AdminDashboard` với biểu đồ doanh thu (`RevenueController`), báo cáo thống kê.
- **Module 4 (F&B):** `ChefDashboard.jsx` - bảng điều khiển bếp với cảnh báo dị ứng real-time.
- **Module 4:** `GuestMealController`, `ChefMealController` - quản lý đặt món và xử lý.
- **Module 3 (Spa):** `Spa.jsx` - trang đặt lịch spa/yoga/vật lý trị liệu đầy đủ.
- **Module 3:** `SpaBookingController`, `SpaBookingService` - engine đặt lịch chống double-booking.
- **Module 3:** `GoogleCalendarService` - đồng bộ lịch hẹn với Google Calendar API v3.
- **Module 2 (Booking):** `BookingPage.jsx` - đặt phòng/gói trị liệu đa bước.
- **Module 2:** `RoomBookingController`, `RoomBookingService` - quản lý đặt phòng đầy đủ.
- **Module 2:** `CheckInController` - làm thủ tục check-in, khai báo tạm trú.
- **Module 1 (Auth):** Tích hợp Firebase SSO (Google Login).
- **Module 1:** `MedicalProfileController` - quản lý hồ sơ sức khỏe mã hóa AES-256.
- **Module 1:** `AuthController` - JWT login/register/refresh/OTP reset password.
- **Cross-module:** `NotificationContext.jsx` - hệ thống thông báo real-time frontend.
- **Cross-module:** `InvoicePdfService` - tạo PDF hóa đơn theo chuẩn AHLEI.

### Changed
- Cập nhật `Header.jsx` hỗ trợ điều hướng đa vai trò (Guest, Staff, Admin, Chef, Therapist).
- Nâng cấp `SOFTWARE_ARCHITECTURE.md` lên phiên bản C4 Model v2.0.
- `AdminOverview` component tích hợp dữ liệu thực từ API thay vì mock data.

### Fixed
- Sửa lỗi circular cascade delete trong SQL Server schema.
- Sửa lỗi CORS trên Spring Boot khi frontend chạy port 5173.
- Sửa lỗi JWT token hết hạn không refresh tự động.

---

## [1.4.0] – 2026-06-15

### Added
- `VoucherController` và `VoucherService` - hệ thống voucher giảm giá.
- `StaffDashboard.jsx` - giao diện nhân viên lễ tân quản lý booking, ca làm.
- `ShiftController` - quản lý ca làm việc và hoán đổi ca.
- `SpecialistDashboard.jsx` - giao diện chuyên gia trị liệu xem lịch.
- `ComplaintController` - hệ thống khiếu nại và phản hồi khách hàng.

### Changed
- Refactor `RoomBookingService` - tách logic tính giá thành phương thức riêng.
- Cập nhật UI `Register.jsx` - thêm consent checkbox theo NĐ 13/2023.

### Fixed
- Sửa lỗi `BigDecimal` precision khi tính tổng hóa đơn.
- Sửa lỗi phân quyền RBAC - Chef không còn xem được medical profile.

---

## [1.3.0] – 2026-06-01

### Added
- `InvoiceController`, `InvoiceService` - quản lý hóa đơn tổng hợp theo AHLEI.
- `FeedbackController`, `FeedbackService` - đánh giá chất lượng dịch vụ.
- `HealthProfile.jsx` - trang khai báo sức khỏe với unchecked consent boxes.
- Scheduler tự động xóa dữ liệu nhạy cảm sau checkout (Right to Deletion).

### Security
- Thêm AES-256 encryption cho `physical_condition_encrypted` và `id_passport_encrypted`.
- Thêm BCrypt password hashing với strength 12.

---

## [1.2.0] – 2026-05-15

### Added
- Cấu trúc database 28 entity hoàn chỉnh (SQL Server schema).
- Spring Boot 3.4.2 + Java 21 backend bootstrap.
- JWT Authentication với refresh token rotation.
- React 19 + Vite frontend với Tailwind CSS.

### Changed
- Chuyển từ mock data sang API thực cho trang Home và Rooms.

---

## [1.1.0] – 2026-05-01

### Added
- Dự án khởi tạo với cấu trúc thư mục chuẩn (00-Policy đến 08-Document-References).
- Tài liệu SRS, EDS, TDD cho tất cả 5 module.
- Template EDS v2.0 và TDD v1.0.

---

## [1.0.0] – 2026-04-15

### Added
- Khởi tạo repository GitHub.
- README.md, `.gitignore`, cấu trúc workspace ban đầu.
- Phân chia module: 5 sinh viên, 5 module, 25 Use Cases.

---

*Xem chi tiết từng thay đổi trong thư mục `04-Implement/IMPLEMENTATION_REPORTS/`.*
