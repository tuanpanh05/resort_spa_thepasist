# Kịch Bản Trình Bày (Review) Luồng Xử Lý - Module 4: Dietary F&B Management

Tài liệu này cung cấp chi tiết luồng thao tác từ đầu đến cuối (End-to-End Flow) của Module 4 (Quản lý Ẩm thực Thực dưỡng). Bạn có thể dùng tài liệu này làm kịch bản (script) để giải thích trong buổi review ngày mai.

---

## 1. Phân Hệ Khách Hàng (Guest Flow) - Giao diện `GuestDashboard.jsx`

Đây là nơi khách hàng (Guest) tương tác để chọn trước thực đơn hoặc gọi món ăn thêm phục vụ tại phòng.

### Bước 1. Khởi tạo và Xác thực thông tin
- **Thao tác:** Khách hàng đăng nhập (Role: `CUSTOMER`) và truy cập vào màn hình "Phục Vụ Tại Phòng" (Guest Dashboard).
- **Kết quả hiển thị:**
  - Hệ thống sẽ gọi API tải `profileData`.
  - Hiển thị thông tin cá nhân và **Thông Tin Đặt Phòng** ở cột bên trái: Mã đơn (VD: `BK-0012`), Ngày Nhận/Trả phòng, và một Mã Ăn riêng biệt (VD: `MEAL-0012`).

### Bước 2. Cấp quyền Truy cập Y tế (Medical Consent)
*Đây là tính năng quan trọng (Business Rule) để đảm bảo an toàn cho khách trị liệu.*
- **Thao tác:** Ở góc trái dưới mục "Bảo Mật Y Tế", khách hàng tích vào ô checkbox *"Đồng ý cho phép nhà bếp truy cập hồ sơ y tế cá nhân..."*.
- **Kết quả hiển thị:**
  - Giao diện checkbox chuyển sang màu xanh ngọc (Primary color).
  - Hệ thống gọi API `/guest/consent` để lưu lại quyết định này. Ngay sau khi lưu, bộ lọc dị ứng tự động của thực đơn sẽ được kích hoạt.

### Bước 3. Duyệt Thực Đơn và Tương Tác
- **Thao tác:** Khách hàng cuộn xem thực đơn ở cột bên phải, được chia theo từng khung giờ (Breakfast, Lunch, Dinner).
- **Kết quả hiển thị:**
  - **Món trong gói:** Nếu món ăn nằm trong gói phòng khách đã mua, nó sẽ có huy hiệu **"Gói Miễn Phí"** màu xanh.
  - **Món hết hàng:** Nếu nhà bếp đã đánh dấu hết nguyên liệu (Sold Out), món ăn sẽ bị làm mờ xám, có dán nhãn **"Hết Hàng"** và không thể bấm chọn.
  - Khách hàng bấm vào nút **`+`** (Cộng) hoặc **`-`** (Trừ) để thay đổi số lượng món ăn.

### Bước 4. Xử lý Cảnh báo Dị ứng Tự động (Allergy Warning)
*Tính năng nổi bật chứng minh sự giao tiếp hệ thống y tế.*
- **Thao tác:** Nếu khách hàng (đã bật Bảo mật y tế) cố tình bấm **`+`** vào một món ăn có chứa thành phần mà họ bị dị ứng (ví dụ: dị ứng hải sản và chọn món canh tôm).
- **Kết quả hiển thị:**
  - Hệ thống chặn ngay lập tức và bật lên một Modal đỏ rực với tiêu đề **"CẢNH BÁO NGUY HIỂM"**.
  - Nội dung giải thích: *"Món ăn này chứa thành phần mà bạn đã khai báo dị ứng... có thể gây sốc phản vệ"*.
  - Khách hàng buộc phải đưa ra quyết định: Bấm nút xám **"Hủy Bỏ"** (khuyên dùng) hoặc bấm nút đỏ **"Tôi Chấp Nhận Rủi Ro"** để ép hệ thống thêm món vào giỏ hàng.

### Bước 5. Thanh toán và Chốt Đơn
- **Thao tác:** Khách hàng nhìn xuống thanh Submit (Thanh toán) cố định ở dưới cùng màn hình. Bấm **"Xác Nhận Gọi Món"** (hoặc "Lưu Thực Đơn").
- **Kết quả hiển thị:**
  - Hệ thống tính toán tự động: Chỉ tính tiền những món không có trong gói (Extra charge) hoặc gọi dư số lượng.
  - Nếu khách chưa check "Bảo mật y tế", hệ thống sẽ nhắc khéo bằng một popup hỏi *"Bạn có muốn Bật & Lọc thực đơn không?"*
  - Sau khi gửi thành công API, màn hình thay đổi, hiển thị biên lai xác nhận với dấu tick xanh, ghi rõ **MÃ ĐƠN HÀNG** (VD: `ORD-845129`) và tổng phụ phí phát sinh để đối chiếu.

---

## 2. Phân Hệ Nhà Bếp (Kitchen Hub) - Giao diện `ChefDashboard.jsx`

Đây là nơi Bếp trưởng (Executive Chef) và đội ngũ KDS (Kitchen Display System) tiếp nhận đơn và vận hành.

### Bước 1. Đăng nhập và Giám sát Tổng quan
- **Thao tác:** Bếp trưởng mở ứng dụng Bếp Trực `ChefDashboard`.
- **Kết quả hiển thị:**
  - Tab **"1. Bếp tổng quan"** (`ChefOverview`) hiện ra, hiển thị các số liệu thống kê: Có bao nhiêu đơn đang nấu, bao nhiêu khách bị dị ứng hôm nay.
  - Phía trên cùng có đèn báo nhấp nháy: **"Nhà bếp hoạt động"**.

### Bước 2. Cập nhật trạng thái "Hết hàng" (Manage Menu)
*Tính năng Real-time tương tác với Guest.*
- **Thao tác:** Bếp trưởng chuyển sang tab **"3. Thực đơn hôm nay"** (`ManageMenu`).
- **Kết quả hiển thị:**
  - Khi kho hết nguyên liệu cho món "Salad bơ", bếp trưởng bấm nút Toggle (chuyển trạng thái).
  - API `/chef/menu/{id}/toggle-sold-out` được gọi. Lập tức món đó trên màn hình của tất cả các khách hàng (Guest) sẽ bị vô hiệu hóa và chuyển sang xám (Hết hàng) để không ai đặt được nữa.

### Bước 3. Nhận đơn và So khớp Dị ứng (Allergy Checking)
- **Thao tác:** Bếp trưởng mở tab **"4. Đơn đặt món"** (`ManageOrders`).
- **Kết quả hiển thị:**
  - Đơn hàng của khách (vừa đặt ở phần 1) xuất hiện.
  - **Hệ thống chạy ngầm:** Hàm `checkOrderAllergies` của ứng dụng sẽ chủ động lấy danh sách nguyên liệu của các món trong đơn, đem đi so khớp với bệnh án/dị ứng của khách đặt phòng đó.
  - Nếu phát hiện rủi ro (kể cả trường hợp khách ép đặt lúc nãy), trên thẻ đơn hàng tại màn hình KDS nhà bếp sẽ hiển thị cờ báo động màu đỏ để bếp trưởng lưu ý đặc biệt lúc chế biến.

### Bước 4. Xử lý tiến độ và Hệ thống Giọng nói AI (Voice Synthesizer)
*Tính năng tự động hóa nổi bật.*
- **Thao tác:** Bếp trưởng bấm cập nhật trạng thái đơn hàng, từ **Pending (Chờ)** -> **Cooking (Đang nấu)** -> **Delivering (Đang giao)**.
- **Kết quả hiển thị & Âm thanh:**
  - Mỗi khi trạng thái thay đổi, hệ thống sẽ gọi API `/chef/orders/{id}/status` để cập nhật cơ sở dữ liệu.
  - Đồng thời, trình duyệt web của nhà bếp kích hoạt API Text-to-Speech (giọng nói tự động): Sẽ vang lên tiếng đọc **"Đơn hàng ORD-845129 của phòng 101 đã xong món, đang giao"**.
  - Tính năng này giúp toàn bộ đầu bếp và nhân viên phục vụ (Runner) trong bếp đang bận tay làm việc vẫn có thể nghe được tiến độ đơn hàng mà không cần nhìn chằm chằm vào màn hình máy tính.

---
**Lời khuyên khi thuyết trình:**
- Hãy nhấn mạnh vào tính **Liên kết dữ liệu (Data Integration)**: Module 4 không đứng độc lập mà lấy dữ liệu phòng từ Module 2 (Booking) và lấy hồ sơ sức khỏe từ Module Y Tế để phục vụ chức năng "Bảo Mật Y Tế".
- Hãy làm nổi bật hàm `playVoiceAlert` trong `ChefDashboard.jsx` và hàm Cảnh báo Modal đỏ trong `GuestDashboard.jsx`, đây là hai điểm cộng (wow factor) về mặt Trải nghiệm người dùng (UX) của dự án.
