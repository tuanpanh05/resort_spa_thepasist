# BÁO CÁO HOÀN THIỆN & KIỂM THỬ MODULE 5
## Consolidated Checkout & Analytics (UC21–UC25)
### Dự án: Ngũ Sơn Resort & Spa Management System (NSRMS)

---

## 1. Tổng Quan Kết Quả Công Việc

Module 5 chịu trách nhiệm tổng hợp tài chính cuối cùng, đối chiếu Guest Folio từ RoomBooking trung tâm, kiểm soát điều kiện checkout lữ hành, hỗ trợ cổng thanh toán trực tuyến bảo mật và các báo cáo hiệu năng vận hành cho ban quản lý.

### Kết quả tổng thể:
* **Consolidated Guest Folio**: Tự động tổng hợp 70% tiền phòng còn lại, phí dịch vụ Spa phát sinh ngoài gói và hóa đơn F&B gọi thêm vào một hóa đơn tổng duy nhất.
* **Consolidated Billing Constraint**: Chặn lễ tân nhấn nút Checkout nếu hệ thống phát hiện khách còn nợ chưa thanh toán hoặc còn lịch hẹn Spa, đơn ăn F&B chưa hoàn thành.
* **Early Checkout Engine**: Cho phép hủy bỏ nhanh có kiểm soát (Force Cancel) các đơn F&B/Spa chưa chế biến để thực hiện trả phòng khẩn cấp cho khách.
* **Audit Trail (BR-26)**: Lưu trữ lịch sử giao dịch immutable sang bảng riêng biệt phục vụ mục đích kiểm toán tài chính lữ hành, cấm tuyệt đối mọi hoạt động sửa xóa.
* **Room Release Automation (BR-14)**: Sau khi hoàn thành Checkout, trạng thái phòng lập tức chuyển sang `DIRTY` (Vacant/Needs Cleaning) để đồng bộ cho bộ phận buồng phòng.
* **JUnit Tests**: **26/26 tests PASS 100%**.

---

## 2. Chi Tiết Các Tính Năng Hoàn Thành

### 2.1 Tạo hóa đơn tổng hợp (UC21)
* Tích hợp dồn luồng tiền từ Module 2, Module 3 và Module 4.
* Hỗ trợ thanh toán tiền mặt (Cash Payment) ghi nhận tức thời hoặc xuất URL thanh toán VNPay Sandbox thực tế. Sửa lỗi mã hóa tham số khoảng trắng sang `%20` để khớp chữ ký cổng thanh toán.

### 2.2 Xử lý thanh toán & Trả phòng (UC22)
* Lễ tân thực thi quy trình checkout, tự động giải phóng phòng lữ hành thành `DIRTY`.

### 2.3 Đánh giá & Phản hồi dịch vụ (UC23)
* Cho phép khách hàng gửi đánh giá chất lượng lưu trú, trị liệu spa, món ăn và thái độ nhân viên.
* Ràng buộc duy nhất: Chỉ khách hàng đã hoàn thành lưu trú (`CHECKED_OUT`) mới được gửi review, và mỗi booking chỉ được gửi tối đa 1 review duy nhất (BR-18 & BR-19).

### 2.4 Báo cáo doanh thu & Hiệu suất chuyên gia (UC24, UC25)
* Biểu đồ doanh thu trực quan phân tách nguồn thu cụ thể: Room Package, Spa, F&B.
* Xuất báo cáo hiệu năng sử dụng phòng (Occupancy Rate) và hiệu suất làm việc của Kỹ thuật viên trị liệu (Therapist Utilization) ra file Excel hàng tháng phục vụ ban điều hành.

---

## 3. Bằng Chứng Kiểm Thử (Verification Evidence)

### 3.1 Kết quả JUnit Tests
```text
[INFO] Running fu.se.smms.service.impl.FeedbackServiceImplTest
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running fu.se.smms.service.impl.InvoiceServiceImplTest
[INFO] Tests run: 17, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 3.2 Automated Room Release verification (BR-14)
Sau khi thực hiện Checkout cho hóa đơn `invoice_id = 12` liên kết với `Room-101`:
* Trạng thái `RoomBooking` của khách hàng: `CHECKED_OUT`.
* Trạng thái phòng `Room-101` trong bảng rooms: `DIRTY` (Sẵn sàng cho nhân viên buồng phòng dọn dẹp).
* Transaction log của giao dịch thanh toán được ghi nhận vĩnh viễn trong bảng `payment_transaction_log`.
