# CODE REVIEW STANDARDS & PR GATEWAYS (TIÊU CHUẨN KIỂM DUYỆT CODE)

Tài liệu này quy định các tiêu chí đánh giá chất lượng mã nguồn khi thực hiện kiểm duyệt chéo (Peer Review) giữa các thành viên hoặc khi AI tạo Pull Request (PR) đóng góp mã nguồn vào dự án.

---

## 1. Tiêu Chuẩn Thiết Kế REST API (REST API Standards)

Mọi API endpoint mới được thêm vào hệ thống phải tuân thủ các quy tắc sau:
* **Đường dẫn (URI Paths):** Dùng danh từ số nhiều, chữ thường, snake-case.
  - *Ví dụ chuẩn:* `/api/invoices/{id}/payment-url` thay vì `/api/invoice/getPaymentUrl`.
* **Phương thức HTTP (HTTP Verbs):** Sử dụng đúng ngữ nghĩa:
  - `GET`: Lấy thông tin (không thay đổi trạng thái hệ thống).
  - `POST`: Tạo mới tài nguyên hoặc thực hiện hành động xử lý (như thanh toán).
  - `PUT` / `PATCH`: Cập nhật thông tin tài nguyên.
  - `DELETE`: Xóa tài nguyên.
* **Định dạng dữ liệu phản hồi (Response Format):**
  - Không bao giờ trả về trực tiếp các đối tượng Entity của JPA ra ngoài Controller (để tránh rò rỉ thông tin nhạy cảm và tránh lỗi `LazyInitializationException` của Hibernate).
  - Luôn sử dụng các lớp **DTO** (Data Transfer Object) để đóng gói dữ liệu trả về cho Client.
  - Khi có lỗi, trả về JSON chuẩn chứa: `code` (mã lỗi nghiệp vụ), `message` (thông điệp chi tiết), và `status` (HTTP Status Code).

---

## 2. Tiêu Chí Kiểm Duyệt Pull Request (PR Review Checklist)

Người duyệt code (Reviewer) hoặc AI Reviewer bắt buộc phải kiểm tra **5 yếu tố** này trước khi Approve PR:

### 2.1 An toàn Giao dịch (Transaction Safety)
* Các phương thức Service thực hiện chỉnh sửa dữ liệu trên nhiều bảng phải được đánh dấu `@Transactional`.
* Các phương thức chỉ đọc dữ liệu phải dùng `@Transactional(readOnly = true)` để tối ưu hóa hiệu năng Hibernate session.

### 2.2 Kiểm soát Quyền truy cập (Security & Permissions)
* Đảm bảo các API endpoint mới được khai báo rõ ràng trong [SecurityConfig.java](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/Backend/src/main/java/fu/se/smms/config/SecurityConfig.java).
* Các endpoint nhạy cảm (như cập nhật trạng thái phòng, doanh thu) phải yêu cầu phân quyền phù hợp (`MANAGER`, `RECEPTIONIST`), không được mở công khai (`.permitAll()`).

### 2.3 Quản lý Tài nguyên & Kết nối (Resource Management)
* Không được mở các kết nối Database, tệp tin, hoặc mạng mà không đóng chúng (Khuyên dùng cú pháp *try-with-resources* của Java).
* Tuyệt đối không viết log bằng `System.out.println()`. Bắt buộc dùng logger có sẵn của Spring (như `@Slf4j` hoặc `LoggerFactory.getLogger()`).

### 2.4 Tính nhất quán của mã nguồn (Code Consistency)
* Tuân thủ quy tắc thụt lề 4 khoảng trắng (tabs sang spaces) đối với Java và 2 khoảng trắng đối với Javascript/HTML/CSS.
* Tên biến, tên hàm phải tự giải thích được chức năng (self-explanatory), không đặt tên vô nghĩa kiểu `temp`, `data1`, `check`.

---

## 3. Quy Trình Phê Duyệt Pull Request (Merge Pipeline)

1. **Self-Review:** Tác giả tự kiểm tra code của mình dựa trên file `AI_RULES.md` và `TESTING_GUIDELINES.md`.
2. **Review chéo:** Ít nhất một thành viên khác trong nhóm (hoặc AI trợ lý) phải duyệt qua mã nguồn, để lại comment nhận xét.
3. **Chạy Test tự động:** Bản dựng (Build) phải biên dịch thành công và toàn bộ ca kiểm thử đơn vị phải vượt qua mà không có lỗi.
4. **Merge:** Sau khi có đủ phê duyệt (Approve) và vượt qua các bài test, code mới được phép merge vào nhánh chính (`main` / `master`).
