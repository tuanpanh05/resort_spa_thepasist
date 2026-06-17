# STRICT AI CODING RULES & INSTRUCTIONS (BỘ QUY TẮC PHÁT TRIỂN DÀNH CHO AI)

> [!IMPORTANT]
> **BẮT BUỘC ĐỐI VỚI TẤT CẢ AGENT AI:** Tập tin này chứa các quy tắc thiết kế hệ thống và lập trình vô cùng nghiêm ngặt cho dự án. Bạn **PHẢI** đọc tệp này trước khi thực hiện bất kỳ hoạt động đọc/viết mã nguồn nào. Việc vi phạm các quy tắc này sẽ trực tiếp dẫn đến thất bại trong kiểm duyệt code.

---

## 1. Nguyên Tắc Hoạt Động Của AI (AI Agent Core Directives)

* **Ưu tiên kiểm tra tài liệu:** Trước khi đề xuất bất kỳ dòng code nào, AI phải đọc kỹ các tài liệu trong 00-Policy, 01-Planning, 02-Requirement, 03-Design.
* **Bảo vệ tài liệu:** AI không được tự ý sửa đổi Requirement hoặc Design documents mà không có sự chấp thuận của người dùng.
* **Báo cáo sau triển khai:** Mỗi implementation (triển khai) đều phải có báo cáo đi kèm.
* **Báo cáo Database:** Mọi thay đổi về database đều phải có tài liệu báo cáo migration.
* **Sử dụng .env:** Mọi cấu hình (configurations) phải sử dụng file `.env`.
* **Không Hardcode:** Tuyệt đối không hardcode thông tin nhạy cảm (secrets, API keys, database credentials).
* **Kiểm thử bắt buộc:** Tests phải được chạy trước khi hoàn thành bất kỳ tiến trình nào.
* **Changelog:** AI phải cập nhật changelog sau mỗi lần triển khai tính năng.
* **Bảo toàn chú thích & Logic cũ:** Tuyệt đối không xóa các chú thích (comments), tài liệu API (Javadoc), hoặc cấu hình logging cũ không liên quan trực tiếp đến task được giao.
* **Tự động xác minh:** Sau khi viết code, AI **bắt buộc** phải chạy lệnh build/test ở local để tự chứng minh tính đúng đắn trước khi báo cáo hoàn thành cho người dùng.

---

## 2. Tiêu Chuẩn Phát Triển Backend (Spring Boot + SQL Server)

### 2.1 Thiết kế Cơ sở dữ liệu và Entity
* **Đồng bộ hóa tuyệt đối:** Kiểu dữ liệu trong Entity của Java phải khớp 100% với DDL trong [resort_spa_db.sql](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/SQL_DB_RESORT_SPA/resort_spa_db.sql).
* **Số thập phân tài chính:** Bắt buộc sử dụng `BigDecimal` kèm theo chỉ số làm tròn cụ thể (Ví dụ: `RoundingMode.HALF_UP`) cho mọi trường tài chính. Không dùng `float` hay `double`.
* **Trạng thái đồng bộ:** Khi cập nhật trạng thái thực thể cha (như `Invoice` được đánh dấu `PAID`), bắt buộc phải cập nhật đồng bộ các thực thể liên quan (như `RoomBooking` đổi sang `CONFIRMED`).

### 2.2 Viết Code & Kiến Trúc
* **Tách biệt phân lớp:**
  - Controller chỉ chịu trách nhiệm nhận request, kiểm tra định dạng đầu vào cơ bản (validation), và trả về ResponseEntity.
  - Service chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ, tính toán tài chính và chuyển đổi thực thể (Entity <-> DTO).
* **Xử lý Ngoại lệ (Exceptions):**
  - Không bắt lỗi kiểu chung chung `try { ... } catch (Exception e)` trừ khi thực sự cần ghi log hoặc ném lại.
  - Luôn sử dụng `BusinessException` được cấu hình kèm theo HTTP Status thích hợp (ví dụ: `404 Not Found`, `409 Conflict`, `400 Bad Request`).

---

## 3. Tiêu Chuẩn Phát Triển Frontend (React + Vite)

* **Tích hợp API thực tế:**
  - Không được lạm dụng mock data trên giao diện. Khi thực hiện thanh toán hoặc đặt phòng, frontend bắt buộc phải gửi request đến API backend tương ứng (Ví dụ: gọi `POST /api/invoices/{id}/payment-url` để lấy link VNPay thật từ backend).
* **Trải nghiệm người dùng (UX/UI):**
  - Giao diện phải đồng bộ với Design System mặc định của resort. Tránh tự ý pha trộn các thư viện UI khác nhau (chỉ dùng các thành phần Vanilla CSS được thiết kế riêng).
  - Trạng thái tải dữ liệu (Loading) và thông báo lỗi (Error alerts) phải được thiết kế chi tiết để người dùng không cảm thấy ứng dụng bị treo.

---

## 4. Bảo Mật & Tuân Thủ Pháp Lý

* **Mã hóa dữ liệu nhạy cảm:**
  - Hồ sơ bệnh lý (`physical_condition_encrypted`) và thông tin Hộ chiếu/CCCD (`id_passport_encrypted`) bắt buộc phải được mã hóa dạng AES-256 trước khi lưu xuống SQL Server để bảo mật thông tin cá nhân của khách hàng.
* **Xác thực và ủy quyền:**
  - Các API nhạy cảm phải luôn kiểm tra quyền hạn của User (ví dụ: chỉ `MANAGER` mới được xem báo cáo doanh thu, chỉ `RECEPTIONIST` mới được cập nhật trạng thái tiền mặt hóa đơn).

## 5. Extra AI Directives
- AI must read Policy, Planning, Requirement, Design before coding
- AI cannot modify Requirement or Design documents without approval
- Every implementation requires a report
- Every database change requires migration documentation
- All configuration must use .env
- No hardcoded secrets
- Tests must run before completion
- AI must update changelog after implementation
