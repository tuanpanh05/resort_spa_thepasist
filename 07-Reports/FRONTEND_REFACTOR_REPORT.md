# Báo Cáo Kết Quả Refactor Frontend - Ngũ Sơn Resort

Tài liệu này tổng hợp kết quả của quá trình refactor mã nguồn Frontend nhằm mục tiêu dọn dẹp code (Clean Code), mô-đun hóa các component và tối ưu hóa cấu trúc dự án.

---

## 1. Các file đã Refactor và Số dòng thay đổi

| Tên File Gốc | Đường dẫn | Số dòng trước refactor | Số dòng sau refactor | Tỷ lệ giảm |
| :--- | :--- | :---: | :---: | :---: |
| **BookingPage.jsx** | `src/pages/BookingPage.jsx` | 1,397 | 231 | **~83%** |
| **ProfilePage.jsx** | `src/pages/ProfilePage.jsx` | 1,025 | 160 | **~84%** |
| **HealthProfile.jsx** | `src/pages/HealthProfile.jsx` | 440 | 420 | **~5%** *(chỉ loại bỏ trùng lặp hằng số)* |
| **api.js** | `src/api.js` | 237 | 1 | *Chuyển thành wrapper re-export* |
| **mockData.js** | `src/mockData.js` | 1,739 | 1 | *Chuyển thành wrapper re-export* |

---

## 2. Các Component mới đã tạo

Để hỗ trợ rút gọn các trang cực kỳ dài và tăng tính tái sử dụng, các component con đã được tách ra:

### A. Mô-đun Đặt lịch (`src/components/booking/`)
1. **`BookingGuestInfo.jsx`**: Biểu mẫu nhập thông tin khách hàng lưu trú (Bước 1). Tích hợp validation số điện thoại, email.
2. **`BookingHealthProfile.jsx`**: Biểu mẫu khai báo dị ứng, tình trạng thể chất và tích hợp các checkbox cam kết xử lý và chia sẻ dữ liệu sức khỏe nhạy cảm theo Nghị định 356/2025/NĐ-CP (Bước 2).
3. **`BookingVillaServices.jsx`**: Giao diện chọn hạng phòng biệt thự (villas) và các dịch vụ chăm sóc sức khỏe / tiện ích đi kèm (Bước 3).
4. **`BookingConfirmation.jsx`**: Trang xem lại và xác nhận thông tin đơn đặt lịch trước khi thanh toán (Bước 4).
5. **`BookingPayment.jsx`**: Trang hiển thị thông tin ngân hàng chuyển khoản, mã QR và nút giả lập thanh toán đối soát cọc 30% (Bước 5).
6. **`BookingSuccess.jsx`**: Màn hình hiển thị kết quả đặt phòng thành công, hóa đơn chi tiết, mã booking ngẫu nhiên và tính năng in phiếu xác nhận (Màn hình cuối).
7. **`BookingSummaryWidget.jsx`**: Widget cố định bên phải tính toán chi tiết hóa đơn (tiền phòng, tiền dịch vụ, tổng tiền, tiền cọc 30% và tiền trả tại quầy 70%).

### B. Mô-đun Tài khoản (`src/components/profile/`)
1. **`PersonalInfoTab.jsx`**: Tab quản lý thông tin cá nhân (Họ tên, SĐT, CCCD) và biểu mẫu đổi mật khẩu tài khoản.
2. **`HistoryTab.jsx`**: Tab hiển thị lịch sử đặt phòng (Booking) và lịch sử dịch vụ (Spa, Yoga, ẩm thực thực dưỡng) với các status badge trực quan.
3. **`HealthTab.jsx`**: Tab khai báo và cập nhật hồ sơ sức khỏe, quản lý sự đồng ý thu thập dữ liệu và tích hợp tính năng xóa vĩnh viễn dữ liệu sức khỏe.
4. **`PaymentHistoryTab.jsx`**: Tab hiển thị lịch sử hóa đơn thanh toán, chi tiết các khoản thu và thông tin giao dịch qua cổng VNPAY.

---

## 3. Data, Constants, Utils & Services đã tách

Tuân thủ cấu trúc thư mục mục tiêu, các tài nguyên tĩnh và logic nghiệp vụ chung đã được tách biệt:

- **Dữ liệu tĩnh & Mock Data**:
  - `src/data/bookingData.js`: Chứa danh sách phòng biệt thự (`villasList`) và danh sách gói dịch vụ dưỡng sinh (`servicesList`).
  - `src/data/mockData.js`: Được di chuyển từ `src/mockData.js` cũ để gom cụm dữ liệu tĩnh.
- **Hằng số cấu hình (Constants)**:
  - `src/constants/options.js`: Chứa tùy chọn dị ứng thực phẩm (`ALLERGY_OPTIONS`) và chế độ ăn uống (`DIET_OPTIONS`).
  - `src/constants/statusMaps.js`: Chứa map trạng thái đặt phòng (`ROOM_STATUS_MAP`) và trạng thái dịch vụ spa (`SPA_STATUS_MAP`).
- **Hàm tiện ích (Utils)**:
  - `src/utils/format.js`: Chứa các hàm định dạng ngày tháng, thời gian và tiền tệ (`fmtDate`, `fmtDateTime`, `fmtCurrency`, `formatCurrency`).
- **Dịch vụ mạng (Services)**:
  - `src/services/api.js`: Nơi chứa toàn bộ cấu hình Axios/Fetch client và định nghĩa các API endpoint gọi lên Backend (Auth, User, Medical, Payment, MasterData, Admin).

---

## 4. Các Logic được giữ nguyên
- Giữ nguyên cơ chế chuyển bước (Wizard flow) trong trang đặt phòng.
- Giữ nguyên cơ chế gọi API đồng bộ, lưu trữ JWT token trong LocalStorage/SessionStorage và gửi JWT qua Header Authorization.
- Giữ nguyên toàn bộ giao diện CSS/Tailwind, class, màu sắc, responsive layout và các hiệu ứng animation (fade-in, transform, scale...).
- Giữ nguyên cơ chế re-export tại `src/api.js` và `src/mockData.js` để đảm bảo các component cũ chưa được refactor không bị đứt gãy link import.

---

## 5. Những điểm cần Test thủ công (Manual Testing)

1. **Quy trình Đặt lịch (Booking Page)**:
   - Truy cập `/dat-lich` và điền thông tin bước 1. Kiểm tra validation khi nhập sai SĐT hoặc email.
   - Ở bước 2, kiểm tra xem có bắt buộc tick cả hai ô đồng ý thu thập dữ liệu nhạy cảm hay không.
   - Ở bước 3, chọn phòng và dịch vụ, quan sát widget bên phải xem số tiền có tự động nhân với số đêm (`nightsCount`) và số khách (`guestsCount`) theo đúng đơn giá của từng dịch vụ không.
   - Hoàn tất bước 4 và bước 5, bấm vào nút copy xem có sao chép đúng dữ liệu tài khoản ngân hàng và nội dung chuyển khoản không. Bấm xác nhận chuyển khoản và in phiếu.

2. **Trang Quản lý tài khoản (Profile Page)**:
   - Truy cập `/tai-khoan`. Click chuyển đổi giữa 4 tab xem dữ liệu có tải chính xác từ Backend lên không.
   - Thử thay đổi họ tên ở Tab 1, lưu lại và quan sát xem tên trên Header có đổi ngay lập tức không.
   - Vào Tab 3 (Hồ sơ sức khỏe), thay đổi dị ứng, bấm lưu. Reload lại trang và kiểm tra xem dữ liệu mới đã được lưu trữ và hiển thị đúng chưa. Thử bấm "Xóa vĩnh viễn hồ sơ sức khỏe" và kiểm tra xem hồ sơ có bị xóa hoàn toàn khỏi backend.

---

## 6. Những phần chưa Refactor được và Lý do
- **Các file Dashboard CSS (`ChefDashboard.css`, `StaffDashboard.css`,...)**: Các file này có số lượng dòng khá lớn (từ 1200 - 2100 dòng), tuy nhiên chúng là các stylesheet thuần túy phục vụ riêng biệt cho từng trang nghiệp vụ. Việc tách nhỏ CSS không mang lại nhiều lợi ích về logic và có nguy cơ cao làm vỡ giao diện nếu phân chia class không đồng đều. Chúng tôi quyết định giữ nguyên các file CSS này để đảm bảo độ an toàn tuyệt đối cho giao diện.
- **Các hàm API gọi trực tiếp trong `Login.jsx` và `Register.jsx`**: Do logic thiết lập Firebase Auth (Google Sign-In) đang dính chặt với luồng điều hướng đặc thù của 2 trang này, việc tách ra file API chung cần kiểm thử kỹ lưỡng hơn về session của Firebase. Chúng tôi tạm thời giữ nguyên cấu trúc gọi trực tiếp để tránh gây lỗi đăng nhập của người dùng.
