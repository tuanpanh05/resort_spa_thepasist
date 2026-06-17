# Báo Cáo Refactor Frontend

Đây là tài liệu theo dõi quá trình refactor frontend project theo hướng clean code và component hóa.

## Tiến độ chung
- [x] Giai đoạn 1: `BookingPage.jsx`
- [x] Giai đoạn 2: `ProfilePage.jsx`
- [ ] Giai đoạn 3: Dashboards
- [ ] Giai đoạn 4: Các trang khác

---

## Chi tiết các file đã refactor

### 1. `BookingPage.jsx`
- **Tình trạng ban đầu**: 1798 dòng. Chứa toàn bộ UI các bước đặt phòng, data tĩnh, logic lọc dị ứng.
- **Tình trạng sau refactor**: 422 dòng.
- **Data/Constants/Utils đã tách**:
  - `src/constants/booking.js`: Chứa `ALLERGY_OPTIONS`, `DIET_OPTIONS`, `villasList`, `servicesList`, `mealPeriods`.
  - `src/utils/health.js`: Chứa hàm `detectAllergens`.
- **Component mới tạo (`src/components/booking/`)**:
  - `BookingWizardHeader.jsx`
  - `GuestInfoStep.jsx`
  - `HealthProfileStep.jsx`
  - `VillaSelectionStep.jsx`
  - `MealSelectionStep.jsx`
  - `ConfirmationStep.jsx`
  - `BookingBillSummary.jsx`
  - `BookingSuccess.jsx`
- **Logic được giữ nguyên**: 
  - Toàn bộ form state, luồng API gọi `/bookings/create`.
  - State được lưu trữ ở `BookingPage.jsx` và truyền xuống dưới dạng props, đảm bảo không thay đổi quy trình đặt phòng cũng như không phải cài thêm thư viện quản lý state.
- **Kiểm thử thủ công cần thiết**: 
  - Thử tạo 1 booking mới đầy đủ các bước.
  - Thử chọn món ăn bị dị ứng xem hệ thống có cản lại không.

### 2. `ProfilePage.jsx`
- **Tình trạng ban đầu**: 1020 dòng. Chứa tất cả 4 tabs nội dung (hồ sơ, lịch sử, sức khỏe, thanh toán).
- **Tình trạng sau refactor**: 160 dòng.
- **Data/Constants/Utils đã tách**:
  - Tạo `src/utils/formatters.js`: Các hàm định dạng tiền tệ và ngày giờ dùng chung.
  - Sử dụng lại `ALLERGY_OPTIONS`, `DIET_OPTIONS` từ `constants/booking.js`.
- **Component mới tạo (`src/components/profile/`)**:
  - `PersonalInfoForm.jsx` (Tab: Thông tin & đổi mật khẩu)
  - `HealthRecords.jsx` (Tab: Hồ sơ sức khỏe)
  - `BookingHistory.jsx` (Tab: Lịch sử dịch vụ/phòng)
  - `PaymentHistory.jsx` (Tab: Hóa đơn VNPAY)
  - `StatusBadge.jsx` (Badge dùng chung)
- **Logic được giữ nguyên**: 
  - API call, Routing `/tai-khoan/*`.
- **Kiểm thử thủ công cần thiết**: 
  - Đăng nhập và thử điều hướng qua các tab.
