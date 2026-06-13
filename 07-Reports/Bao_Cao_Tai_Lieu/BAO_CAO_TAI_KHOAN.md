# Báo Cáo: Tái Cấu Trúc Giao Diện Tài Khoản & Tách Biệt Các Màn Hình Dashboard

Chúng tôi đã hoàn thành việc nâng cấp giao diện quản lý tài khoản (`/tai-khoan`) từ dạng Tab gộp chung thành một cấu trúc **Dashboard Layout** chuyên nghiệp với Menu điều hướng (Sidebar) bên trái và các màn hình con tách biệt tương ứng với các URL riêng lẻ.

---

## 1. Cấu Trúc Định Tuyến Mới (Routing)

Chúng tôi đã áp dụng cơ chế **Descendent Routes** (Định tuyến con) của React Router v6. Tất cả các màn hình con đều nằm dưới tiền tố `/tai-khoan/*`:

| Tính năng | URL Route | Thành phần Giao diện | Nguồn dữ liệu kết nối (API) |
| :--- | :--- | :--- | :--- |
| **Thông tin cá nhân** | `/tai-khoan` (index) | `PersonalInfoTab` | `userApi.getProfile()` |
| **Hồ sơ sức khỏe** | `/tai-khoan/suc-khoe` | `HealthTab` | `medicalApi.getMyProfile()` |
| **Lịch sử đặt hàng** | `/tai-khoan/lich-su-dat-hang`| `HistoryTab` | `userApi.getMyBookings()` & `getMySpaBookings()` |
| **Lịch sử thanh toán**| `/tai-khoan/lich-su-thanh-toan`| `PaymentHistoryTab` | Mock từ Database Seed (Chờ tích hợp API `invoice`) |

---

## 2. Chi Tiết Các Màn Hình & Phân Loại Lọc

### Màn hình 1: Thông tin cá nhân & Đổi mật khẩu
- Cho phép người dùng cập nhật Họ tên, SĐT, số CCCD/Hộ chiếu. 
- Form đổi mật khẩu bảo mật (kiểm tra độ dài mật khẩu mới tối thiểu 8 ký tự).
- *Phong cách Flat UI:* Loại bỏ viền hộp, sử dụng border-bottom thanh mảnh.

### Màn hình 2: Hồ sơ sức khỏe & Dị ứng ăn uống
- Lựa chọn chế độ ăn (Omnivore, Vegetarian, Vegan, Keto,...).
- Chọn dị ứng thực phẩm và nhập dị ứng khác (ví dụ: phấn hoa, lông động vật,...).
- Khai báo tình trạng thể chất để hỗ trợ trị liệu viên Spa/Yoga.
- Tự động tick lưu trữ và chia sẻ dữ liệu nhạy cảm theo **Nghị định 356/2025/NĐ-CP** khi hồ sơ đã tồn tại.

### Màn hình 3: Lịch sử đặt hàng (Order History)
Đã triển khai bộ lọc phân loại rõ ràng thành 2 nhóm lớn để dễ dàng theo dõi:
1. **Đặt phòng (Room Bookings):** Hiển thị danh sách phòng nghỉ đã đặt, mã cọc (30%), tên gói Retreat.
2. **Dịch vụ khác (Other Services):** Lọc chi tiết hơn bằng bộ lọc con (sub-filters) gồm:
   - **Tất cả dịch vụ**
   - **Spa & Vật lý trị liệu:** Kết nối API thực tế của spa.
   - **Yoga & Thiền:** Mockup cấu trúc mẫu từ module Yoga.
   - **Ẩm thực dưỡng sinh:** Mockup cấu trúc đặt món ăn phục vụ phòng.

### Màn hình 4: Lịch sử thanh toán (Payment History)
- Hiển thị danh sách hóa đơn chi tiết.
- Trình bày hóa đơn với cấu trúc Breakdown tương thích 100% với chuẩn AHLEI Folio:
  - Chi phí phòng nghỉ, chi phí Spa, chi phí ẩm thực.
  - Thuế & Phí dịch vụ (10%).
  - Tiền cọc đã thanh toán (30%).
  - Tổng số tiền thực thanh toán hoặc còn nợ (`amountDue`).
- Hiển thị mã giao dịch VNPAY (`vnpayTranId`) và thời gian giao dịch thực tế đối với các hóa đơn đã thanh toán thành công.

---

## 3. Bản Đồ Ánh Xạ Cơ Sở Dữ Liệu (Database Connection Points)

Để hỗ trợ các thành viên khác kết nối các module (đặt phòng, spa, yoga, hóa đơn, thanh toán VNPay) với màn hình tài khoản này, chúng tôi đã đánh dấu rõ các điểm kết nối `// CONNECTION POINT` và `// DATABASE RELATION` trực tiếp trong file code [ProfilePage.jsx](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend/src/pages/ProfilePage.jsx):

### 3.1. Kết nối Thông tin cá nhân
- **API tương ứng:** `GET /api/users/me` và `PUT /api/users/me`
- **Bảng CSDL:** `dbo.[User]`
- **Ánh xạ cột:**
  - `email` -> Email tài khoản (read-only)
  - `full_name` -> Họ và tên khách hàng
  - `phone` -> Số điện thoại
  - `id_passport_encrypted` -> CCCD/Hộ chiếu (được mã hóa AES tự động ở backend)

### 3.2. Kết nối Hồ sơ sức khỏe
- **API tương ứng:** `GET /api/medical-profiles/me` và `POST /api/medical-profiles/me`
- **Bảng CSDL:** `dbo.medical_profile`
- **Ánh xạ cột:**
  - `physical_condition_encrypted` -> Tình trạng sức khỏe (mã hóa AES)
  - `food_allergies_encrypted` -> JSON danh sách dị ứng thực phẩm và chế độ ăn (mã hóa AES)
  - `explicit_consent_signed` -> Trạng thái ký cam kết Nghị định 356/2025/NĐ-CP (phải là `1` để lưu thành công)

### 3.3. Kết nối Lịch sử Đặt phòng (Rooms)
- **API tương ứng:** `GET /api/users/me/bookings`
- **Bảng CSDL:** `dbo.room_booking` liên kết với `dbo.room_booking_detail` và `dbo.room`
- **Trạng thái:** `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`

### 3.4. Kết nối Lịch sử Spa & Trị liệu
- **API tương ứng:** `GET /api/users/me/spa-bookings`
- **Bảng CSDL:** `dbo.spa_booking` liên kết với `dbo.spa_service`
- **Trạng thái:** `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`

### 3.5. Kết nối Lịch sử Yoga & Trị liệu (Chờ tích hợp)
- **Điểm kết nối:** Thay thế `MOCK_YOGA_BOOKINGS` bằng API `GET /api/users/me/yoga-bookings`.
- **Bảng CSDL đề xuất:** `dbo.spa_booking` (với dịch vụ có category là `'Yoga'`) hoặc bảng chuyên biệt `yoga_booking`.

### 3.6. Kết nối Đặt đồ ăn tại phòng (Chờ tích hợp)
- **Điểm kết nối:** Thay thế `MOCK_FOOD_ORDERS` bằng API `GET /api/users/me/food-orders`.
- **Bảng CSDL đề xuất:** `dbo.food_order` liên kết với `dbo.food_order_detail` và `dbo.food_menu`.

### 3.7. Kết nối Lịch sử thanh toán & VNPay (Chờ tích hợp)
- **Điểm kết nối:** Thay thế `mockInvoices` trong `PaymentHistoryTab` bằng API `GET /api/users/me/invoices`.
- **Bảng CSDL:** `dbo.invoice`
- **Ánh xạ cột:**
  - `invoice_id` -> Mã hóa đơn
  - `room_booking_id` -> ID đặt phòng
  - `room_subtotal`, `spa_subtotal`, `food_subtotal` -> Chi phí từng phần
  - `tax_and_fees` -> Thuế & Phí phục vụ (10%)
  - `final_amount` -> Tổng tiền cần thanh toán
  - `deposit_amount` -> Tiền cọc đã thanh toán (30%)
  - `amount_due` -> Tiền còn nợ (bằng `final_amount - deposit_amount` khi chưa trả hết)
  - `status` -> Trạng thái thanh toán (`PAID` hoặc `UNPAID`)
  - `vnpay_tran_id` -> Mã giao dịch VNPay (khi thanh toán trực tuyến thành công)
  - `payment_time` -> Thời gian hoàn tất giao dịch

---

## 4. Biên Dịch Dự Án
Chúng tôi đã biên dịch kiểm tra thành công với Vite. Toàn bộ mã nguồn đã sẵn sàng để tích hợp và kiểm thử.
