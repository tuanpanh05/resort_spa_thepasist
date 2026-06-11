# 🌿 Tổng hợp Tài liệu Phân tích & Đánh giá Yêu cầu Nghiệp vụ
## Dự án: Xoai Aura Retreat - A Wellness Resort & Spa Management System

---

## 1. Giới thiệu chung
Tài liệu này tổng hợp kết quả đối chiếu giữa **Yêu cầu Bài tập lớn (SWP391-HOS-03)** và **Tài liệu Đặc tả Yêu cầu Hệ thống (SRS) chính thức của Nhóm 3**. Mục tiêu là phân tách hệ thống thành 5 module tương ứng với 5 sinh viên chịu trách nhiệm, đồng thời chỉ ra các khoảng trống nghiệp vụ (Gaps) và vấn đề kỹ thuật cần giải quyết trước khi tiến hành viết code.

---

## 2. Danh sách 5 Module Trọng tâm

| Tên Module | Sinh viên chịu trách nhiệm | Tài liệu chi tiết | Mô tả tóm tắt phạm vi |
| :--- | :--- | :--- | :--- |
| **Module 1: Authentication & Sensitive Health Profile** | Student 1 | [Module 1.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/DE_BAI_MODULE/Module_1.md) | Quản lý tài khoản, đăng nhập SSO, hồ sơ sức khỏe nhạy cảm, mã hóa dữ liệu theo Nghị định 13/2023/NĐ-CP, quyền xóa dữ liệu và Master Data danh mục. |
| **Module 2: Retreat Package & Accommodation Booking** | Student 2 | [Module 2.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/DE_BAI_MODULE/Module_2.md) | Khách tìm kiếm, đặt gói trị liệu, thanh toán đặt cọc. Lễ tân quản lý danh sách khách đến, làm thủ tục Check-In, khai báo tạm trú theo Luật Cư trú 2020 và quản lý trạng thái biệt thự vật lý. |
| **Module 3: Spa & Therapy Scheduling Engine** | Student 3 *(Độ phức tạp cao)* | [Module 3.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/DE_BAI_MODULE/Module_3.md) | Đặt lịch hẹn Spa/Yoga trong gói trị liệu. Tự động ghép lịch kỹ thuật viên và phòng trống thông minh. Khóa chống đặt trùng lịch chéo 2 chiều (Double-Booking Prevention). Đồng bộ Google Calendar và SendGrid. |
| **Module 4: Dietary F&B Management** | Student 4 | [Module 4.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/DE_BAI_MODULE/Module_4.md) | Khách pre-select món ăn dinh dưỡng an toàn. Tự động lọc thực đơn dựa trên dị ứng thực phẩm. Bảng điều khiển nhà bếp hiển thị cảnh báo dị ứng thời gian thực và quản lý món ăn gọi thêm. |
| **Module 5: Consolidated Checkout & Analytics** | Student 5 | [Module 5.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/DE_BAI_MODULE/Module_5.md) | Tạo hóa đơn tổng hợp (Consolidated Invoice) liên kết qua Room_Booking_ID theo chuẩn AHLEI. Khóa Check-out khi còn nợ dịch vụ. Đánh giá chất lượng và Biểu đồ phân tích doanh thu, báo cáo hiệu suất chuyên gia (Utilization). |

---

## 3. Tổng hợp các Vấn đề Cốt lõi & Giải pháp Kiến nghị

> [!IMPORTANT]
> **Các vấn đề cần giải quyết ngay khi bắt tay vào triển khai Code:**

### A. Bảo mật & Tuân thủ Pháp lý (Module 1 & 2)
1. **Thiếu Consent Checkbox trên giao diện khai báo sức khỏe:**
   - *Vấn đề:* Để tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân nhạy cảm, giao diện thu thập dữ liệu sức khỏe (UC02) bắt buộc phải sử dụng checkbox đồng ý để trống mặc định (explicit, unchecked). Tài liệu SRS hiện tại chưa đặc tả ràng buộc này.
   - *Giải pháp:* Cần bổ sung validate bắt buộc người dùng tích chọn đồng ý trên UI trước khi Submit.
2. **Quy trình Xóa dữ liệu tự động (Right to Deletion):**
   - *Vấn đề:* SRS hiện tại yêu cầu Admin duyệt thủ công đơn xin xóa dữ liệu sức khỏe của khách sau kỳ nghỉ. Điều này đi ngược lại với yêu cầu tự động xóa để bảo vệ quyền riêng tư của đề bài.
   - *Giải pháp:* Thiết kế một Job chạy ngầm định kỳ hàng tuần quét các đặt phòng đã hoàn thành (Check-out) để tự động xóa sạch dữ liệu bệnh lý và dị ứng nhạy cảm của khách hàng trong DB.

### B. Bài toán Lập lịch Trị liệu Phức tạp (Module 3)
1. **Chống đặt trùng lịch 2 chiều (Double-Booking):**
   - *Vấn đề:* Chưa có giải pháp kỹ thuật cụ thể ở tầng Backend để khóa tài nguyên đồng thời (Therapist và Treatment Room) khi có nhiều yêu cầu đặt lịch cùng một lúc.
   - *Giải pháp:* Sử dụng cơ chế khóa dòng ở mức DB (`SELECT ... FOR UPDATE` trong Transaction của SQL) để đảm bảo tính đồng bộ và toàn vẹn dữ liệu.
2. **Rò rỉ dữ liệu do phân quyền lỏng lẻo:**
   - *Vấn đề:* Màn hình lịch làm việc của Kỹ thuật viên (Therapist) có thể bị hiển thị thừa thông tin dị ứng ẩm thực hoặc thông tin cá nhân.
   - *Giải pháp:* Áp dụng triệt để nguyên tắc RBAC (Role-Based Access Control) ở tầng API, chỉ trả về các trường bệnh lý vật lý phục vụ trị liệu cho chuyên gia.

### C. Quản lý Ẩm thực & Dinh dưỡng (Module 4)
1. **Thiếu liên kết dữ liệu phục vụ bộ lọc thực đơn (Menu Filtering Engine):**
   - *Vấn đề:* Sơ đồ DB của nhóm thiếu bảng liên kết giữa nguyên liệu món ăn (Ingredients) và tác nhân dị ứng (Allergens) để tự động lọc thực đơn an toàn cho khách.
   - *Giải pháp:* Bổ sung bảng quan hệ nhiều-nhiều giữa `Menu_Item` và `Allergen` để làm cơ sở cho Backend lọc món ăn tự động.

### D. Tài chính & Kế toán Tổng hợp (Module 5)
1. **Đồng bộ hóa để khóa quy trình Check-out (Consolidated Billing Constraint):**
   - *Vấn đề:* Khách hàng không được Check-out nếu có hóa đơn phụ phí chưa thanh toán (Spa, F&B). SRS chưa đặc tả cách đồng bộ trạng thái đơn hàng thời gian thực để Lễ tân kiểm tra.
   - *Giải pháp:* Thiết kế trạng thái đơn hàng (`Payment_Status`: `Unpaid`, `Paid`, `Post_to_Folio`). Nút Check-out chỉ được kích hoạt khi tất cả các đơn hàng liên kết với `Room_Booking_ID` đều ở trạng thái `Paid` hoặc `Post_to_Folio` đã được tính vào hóa đơn cuối cùng.
2. **Thiếu báo cáo hiệu suất chuyên gia (Therapist Utilization):**
   - *Vấn đề:* SRS bỏ quên báo cáo hiệu suất làm việc của Kỹ thuật viên Spa.
   - *Giải pháp:* Bổ sung câu lệnh SQL tính toán: `Tổng số giờ trị liệu thực tế / Tổng số giờ làm việc theo ca` của Kỹ thuật viên trong tháng để xuất báo cáo Excel.
