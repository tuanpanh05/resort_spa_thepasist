# 👥 USER ACCEPTANCE TESTING (UAT) – SMMS Ngũ Sơn Resort & Spa

> **Thư mục:** `06-Testing/UAT/`  
> **Mục đích:** Kiểm thử chấp nhận người dùng (UAT) – xác nhận hệ thống đáp ứng yêu cầu nghiệp vụ thực tế từ góc nhìn của người dùng cuối.  
> **Giai đoạn:** Sprint cuối – trước khi nghiệm thu với giáo viên hướng dẫn.

---

## Thông tin UAT

| Thông tin            | Chi tiết                                                  |
| ----------------------| -----------------------------------------------------------|
| **Ngày dự kiến UAT** | Tuần cuối trước deadline nộp bài                          |
| **Người tham gia**   | Sinh viên nhóm (đóng vai từng role) + Giáo viên hướng dẫn |
| **Môi trường**       | Development server local hoặc staging                     |
| **Cơ sở đánh giá**   | SRS + Đề bài SWP391-HOS-03 + Business Rules               |

---

## Danh sách UAT Scenarios theo Role

### 👤 Role: CUSTOMER (Khách hàng)

| STT | Scenario | UC liên quan | Kết quả mong đợi | Pass/Fail | Ghi chú |
|-----|----------|-------------|------------------|-----------|---------|
| C-01 | Đăng ký tài khoản mới với email chưa tồn tại | UC01 | Nhận email xác thực, tài khoản được tạo | ⬜ | |
| C-02 | Đăng nhập bằng Google SSO | UC01 | Chuyển thẳng vào trang chủ | ⬜ | |
| C-03 | Xem danh sách phòng và bộ lọc | UC06 | Hiển thị đúng phòng available | ⬜ | |
| C-04 | Đặt phòng + gói trị liệu | UC06 | Booking được tạo, nhận email confirm | ⬜ | |
| C-05 | Thanh toán deposit qua VNPay | UC06 | Redirect đúng trang VNPay, sau pay trở về | ⬜ | |
| C-06 | Khai báo hồ sơ sức khỏe | UC02 | Consent checkbox unchecked mặc định | ⬜ | **NĐ 13/2023** |
| C-07 | Đặt lịch spa/yoga trong gói | UC11 | Lịch xuất hiện trên Google Calendar | ⬜ | |
| C-08 | Xem và đặt món ăn (menu lọc dị ứng) | UC16 | Không thấy món có allergen | ⬜ | |
| C-09 | Yêu cầu xóa dữ liệu sức khỏe | UC05 | Dữ liệu bị xóa sau checkout | ⬜ | **BR-20** |
| C-10 | Đánh giá dịch vụ sau stay | UC25 | Review hiển thị trên trang | ⬜ | |
| C-11 | Xem hóa đơn tổng hợp PDF | UC21 | PDF đúng format AHLEI | ⬜ | |

---

### 🏨 Role: RECEPTIONIST (Lễ tân)

| STT | Scenario | UC liên quan | Kết quả mong đợi | Pass/Fail | Ghi chú |
|-----|----------|-------------|------------------|-----------|---------|
| R-01 | Đăng nhập và xem dashboard lễ tân | UC01 | Thấy arrivals, departures hôm nay | ⬜ | |
| R-02 | Làm thủ tục Check-In khách | UC07 | Nhập CCCD/passport, booking → CHECKED_IN | ⬜ | |
| R-03 | Gán phòng cho khách | UC07 | Trạng thái phòng → OCCUPIED | ⬜ | |
| R-04 | Không thể xem medical profile của khách | UC03/RBAC | Nhận lỗi 403 Forbidden | ⬜ | **BR-21** |
| R-05 | Làm thủ tục Check-Out khi còn nợ | UC22 | Nút Check-Out bị disable | ⬜ | **Constraint** |
| R-06 | Làm thủ tục Check-Out sau thanh toán đủ | UC22 | Check-Out thành công | ⬜ | |
| R-07 | Xem và quản lý ca làm việc | UC20 | Thấy lịch ca của mình | ⬜ | |
| R-08 | Tạo yêu cầu hoán đổi ca | UC20 | Request gửi đến staff khác | ⬜ | |

---

### 🧘 Role: THERAPIST (Chuyên gia trị liệu)

| STT | Scenario | UC liên quan | Kết quả mong đợi | Pass/Fail | Ghi chú |
|-----|----------|-------------|------------------|-----------|---------|
| T-01 | Đăng nhập và xem lịch trị liệu | UC11 | Thấy đúng các appointment của mình | ⬜ | |
| T-02 | Chỉ thấy physical condition, không thấy food allergy | UC11/RBAC | Thông tin được lọc theo RBAC | ⬜ | **BR-21** |
| T-03 | Cập nhật trạng thái phiên spa | UC11 | Status → COMPLETED | ⬜ | |
| T-04 | Lịch hiển thị trên Google Calendar | UC11 | Calendar event visible | ⬜ | |
| T-05 | Không thể xem hóa đơn của khách | UC21/RBAC | Nhận lỗi 403 Forbidden | ⬜ | **BR-21** |

---

### 👨‍🍳 Role: CHEF (Bếp trưởng)

| STT   | Scenario                         | UC liên quan | Kết quả mong đợi                        | Pass/Fail | Ghi chú   |
| -------| ----------------------------------| --------------| -----------------------------------------| -----------| -----------|
| Ch-01 | Đăng nhập và xem order hôm nay   | UC16         | Danh sách orders với allergy badges     | ⬜         |           |
| Ch-02 | Xem cảnh báo dị ứng nổi bật      | UC16         | Badge đỏ cho khách có allergen          | ⬜         |           |
| Ch-03 | Không thể xem physical condition | UC16/RBAC    | Thông tin bệnh lý bị ẩn                 | ⬜         | **BR-21** |
| Ch-04 | Cập nhật menu món ăn             | UC17         | Món ăn mới hiển thị đúng                | ⬜         |           |
| Ch-05 | Cập nhật trạng thái order        | UC16         | PENDING → PREPARING → READY → DELIVERED | ⬜         |           |

---

### 👔 Role: MANAGER (Quản lý)

| STT | Scenario | UC liên quan | Kết quả mong đợi | Pass/Fail | Ghi chú |
|-----|----------|-------------|------------------|-----------|---------|
| M-01 | Xem dashboard tổng quan | UC21-25 | KPIs, biểu đồ doanh thu | ⬜ | |
| M-02 | Tạo/khóa tài khoản nhân viên | UC03 | Account INACTIVE không thể login | ⬜ | **BR-22** |
| M-03 | Quản lý Master Data – Phòng/Gói dịch vụ | UC04 | CRUD Villa, Package, Spa Service | ⬜ | |
| M-04 | Xem báo cáo doanh thu theo tháng | UC25 | Breakdown theo Room/Spa/F&B | ⬜ | |
| M-05 | Xem báo cáo utilization therapist | UC25 | % giờ làm việc thực tế vs giờ ca | ⬜ | |
| M-06 | Xuất báo cáo Excel/PDF | UC25 | File đúng format, số liệu chính xác | ⬜ | |
| M-07 | Xem tất cả feedback và đánh giá | UC25 | Lọc theo rating, theo kỳ | ⬜ | |

---

## UAT Test Environment Checklist

### Chuẩn bị trước UAT

- [ ] Backend chạy ổn định trên port 8080.
- [ ] Frontend chạy ổn định trên port 5173.
- [ ] Database có đủ test data (xem `test_data.sql`).
- [ ] VNPay Sandbox configured đúng.
- [ ] Email server (MailHog hoặc SendGrid Sandbox) configured.
- [ ] Google Calendar test account setup.
- [ ] Tài khoản test cho mỗi role đã được tạo sẵn.

### Tài khoản test chuẩn bị

| Role | Email | Password |
|------|-------|----------|
| MANAGER | manager@ngusonresort.com | TestManager@123 |
| RECEPTIONIST | receptionist@ngusonresort.com | TestRecept@123 |
| THERAPIST | therapist@ngusonresort.com | TestTherapist@123 |
| CHEF | chef@ngusonresort.com | TestChef@123 |
| CUSTOMER | guest@test.com | TestGuest@123 |
| CUSTOMER (có allergy) | guest.allergy@test.com | TestGuest@123 |

---

## Tiêu chí nghiệm thu (Acceptance Criteria)

> [!IMPORTANT]
> Hệ thống chỉ được coi là **PASS UAT** khi đáp ứng tất cả các tiêu chí sau:

1. **✅ Functional Coverage:** Ít nhất 90% test cases trong danh sách UAT phải PASS.
2. **✅ Critical UC Coverage:** 25/25 Use Cases phải hoạt động đúng theo SRS.
3. **✅ Security:** Tất cả RBAC tests phải PASS (Chef không thấy medical data, v.v.).
4. **✅ Compliance:** Consent checkbox unchecked mặc định (NĐ 13/2023).
5. **✅ Payment:** VNPay integration hoạt động đúng trên sandbox.
6. **✅ Performance:** Trang load không quá 3 giây trên mạng thông thường.
7. **✅ No Critical Bugs:** Không có bug P1/P2 nào còn open.

---

## Bug Tracking Template

| Bug ID | Ngày phát hiện | Scenario | Mô tả lỗi | Mức độ | Tác giả | Trạng thái |
|--------|---------------|----------|-----------|--------|---------|------------|
| BUG-001 | | | | P1/P2/P3 | | Open/Fixed |

**Mức độ bug:**
- **P1 – Critical:** Crash toàn hệ thống, mất dữ liệu, lỗ hổng bảo mật.
- **P2 – Major:** Tính năng core không hoạt động, sai business logic.
- **P3 – Minor:** UI lỗi nhỏ, text sai, animation không mượt.

---

## Kết quả UAT

| Module | Tổng test | Pass | Fail | Skip | Pass Rate |
|--------|-----------|------|------|------|-----------|
| Module 1 – Auth & Health | 11 | - | - | - | - |
| Module 2 – Booking | 8 | - | - | - | - |
| Module 3 – Spa | 5 | - | - | - | - |
| Module 4 – F&B | 5 | - | - | - | - |
| Module 5 – Checkout | 7 | - | - | - | - |
| **TOTAL** | **36** | - | - | - | - |

**Chữ ký nghiệm thu:**
- Nhóm trưởng: ___________________
- Giáo viên hướng dẫn: ___________________
- Ngày: ___________________

---

*Tài liệu UAT phải được hoàn thiện và ký trước khi nộp final submission.*
