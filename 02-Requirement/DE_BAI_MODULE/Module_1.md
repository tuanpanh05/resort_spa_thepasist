# 🌿 Module 1: Authentication & Sensitive Health Profile
**Vai trò:** Student 1 (Full-stack: DB -> DAO -> Controller -> UI)

---

## 1. Tổng quan Module
Module 1 chịu trách nhiệm thiết lập nền tảng bảo mật, quản lý tài khoản người dùng, phân quyền truy cập nghiêm ngặt và quản lý thông tin sức khỏe nhạy cảm của khách hàng tuân thủ quy định pháp luật Việt Nam. Ngoài ra, module này còn quản lý dữ liệu danh mục cốt lõi (Master Data) của resort để phục vụ các module khác.

---

## 2. Chi tiết Yêu cầu Chức năng (Use Cases)

| Mã UC (Đề bài) | Mã UC (SRS Nhóm 3) | Tên Use Case | Mô tả chi tiết hành vi |
| :--- | :--- | :--- | :--- |
| **UC01** | UC-01 | Đăng ký & Đăng nhập (Register Account / Log In) | Khách đăng ký tài khoản mới, xác thực email qua OTP/Token và đăng nhập an toàn. Hỗ trợ Single Sign-On (SSO) qua Google Identity / Facebook Login. |
| **UC02** | UC-11 | Khai báo hồ sơ sức khỏe & Dị ứng (Complete Dietary & Health Profile) | Khách khai báo thông tin bệnh lý (đau lưng, chấn thương...) và dị ứng thực phẩm. Giao diện phải sử dụng các hộp kiểm trống (**explicit, unchecked consent boxes**) để lấy sự đồng ý rõ ràng của khách hàng theo Nghị định 356/2025/ND-CP. |
| **UC03** | UC-22 | Quản lý tài khoản & Phân quyền nhân viên (Manage Staff Accounts & Roles) | Admin tạo, khóa/mở khóa tài khoản nhân viên và gán vai trò nghiêm ngặt (**Receptionist, Spa Therapist, Chef**) nhằm hạn chế tối đa quyền truy cập dữ liệu. |
| **UC04** | UC-23, UC-24, UC-25 | Quản lý dữ liệu danh mục (Manage Master Data) | Admin thiết lập thông tin cốt lõi về: Hạng biệt thự (Villa Categories), Dịch vụ Spa (Spa/Yoga Services), và các Gói trị liệu (Retreat Packages). |
| **UC05** | UC-15 (BR-20) | Quyền được xóa dữ liệu (Right to Deletion) | Khách hàng thực hiện quyền yêu cầu xóa vĩnh viễn dữ liệu sức khỏe và dị ứng nhạy cảm của mình khỏi hệ thống sau khi kỳ trị liệu kết thúc. |

---

## 3. Quy tắc Nghiệp vụ (Business Rules) & Ràng buộc Hệ thống
1. **BR-01 (Unique Email):** Mỗi địa chỉ email chỉ được đăng ký cho một tài khoản duy nhất.
2. **BR-02 (Email Verification):** Khách hàng đăng ký truyền thống bắt buộc phải xác thực email trước khi sử dụng các chức năng đặt phòng hoặc dịch vụ (bỏ qua nếu dùng SSO).
3. **BR-21 (Role-Based Access Control - RBAC):** Kiểm soát truy cập ở mức cơ sở dữ liệu và API:
   - *Wellness Specialist (Therapist):* Chỉ được xem thông tin bệnh lý liên quan đến trị liệu vật lý, không được xem dị ứng ăn uống hoặc thông tin hóa đơn.
   - *Chef/Kitchen Staff:* Chỉ được xem thông tin dị ứng/dinh dưỡng, tuyệt đối không được tiếp cận hồ sơ bệnh lý vật lý.
   - *Receptionist:* Không được phép xem cả hồ sơ bệnh lý lẫn thông tin dị ứng của khách hàng.
4. **BR-22 (Account Lock Restriction):** Các tài khoản nhân viên bị khóa (Locked status) không thể đăng nhập vào hệ thống quản trị.
5. **BR-20 (Sensitive Data Deletion):** Khi khách kết thúc gói trị liệu và rời đi, hệ thống phải cung cấp cơ chế xóa sạch thông tin sức khỏe để bảo vệ quyền riêng tư.

---

## 4. Tiêu chuẩn miền & Tuân thủ Pháp lý (Compliance & Standards)
* **Nghị định số 13/2023/NĐ-CP (Đề bài ghi chú Decree 356/2025/ND-CP):** 
  - Quy định về bảo vệ dữ liệu cá nhân nhạy cảm (Điều 4: Dữ liệu sức khỏe & sinh trắc học; Điều 6: Sự đồng ý rõ ràng). 
  - *Ứng dụng:* Cấm sử dụng các hộp chọn đồng ý được "tích sẵn" mặc định (default-checked). Dữ liệu sức khỏe lưu trữ bắt buộc phải được **mã hóa ở mức cơ sở dữ liệu (encryption-at-rest)**.
* **Luật Cư trú 2020:** 
  - Thông tin hộ chiếu/CCCD thu thập khi check-in phải được lưu giữ an toàn và mã hóa để tuân thủ quy định khai báo tạm trú với cơ quan công an địa phương.

---

## 5. Tổng hợp các Vấn đề & Khoảng trống (Gaps / Issues)

> [!WARNING]
> **Các điểm xung đột và thiếu sót giữa Đề bài (HOS-03) và Đặc tả SRS chính thức:**

1. **Thiếu đặc tả giao diện Consent Checkbox:** 
   Trong tài liệu SRS (mục UC11 và thiết kế màn hình), nhóm chưa mô tả rõ ràng yêu cầu bắt buộc: **các checkbox đồng ý thu thập thông tin sức khỏe phải mặc định ở trạng thái chưa chọn (unchecked)**. Điều này dễ dẫn đến việc lập trình viên frontend sử dụng thuộc tính `checked` mặc định, vi phạm luật bảo vệ dữ liệu cá nhân.
2. **Quy trình "Right to Deletion" chưa đồng nhất:** 
   Đề bài yêu cầu hệ thống tự động/cho phép xóa vĩnh viễn dữ liệu sức khỏe sau khi khách hàng kết thúc gói trị liệu. Tuy nhiên, tài liệu SRS (UC-15) mô tả quy trình xóa này dưới dạng gửi yêu cầu cần có **sự phê duyệt thủ công từ Admin** ("require administrative review"). Điều này gây chậm trễ và không đảm bảo tính tự động, riêng tư theo nguyên tắc tối thiểu hóa dữ liệu (Data Minimization).
3. **Mã hóa dữ liệu nhạy cảm chưa có thiết kế kỹ thuật:**
   SRS chỉ ghi nhận yêu cầu mã hóa dưới dạng hậu điều kiện (Postconditions) mà hoàn toàn thiếu thiết kế chi tiết về cơ chế mã hóa trong DB (ví dụ: thuật toán mã hóa AES-256, quản lý khóa mã hóa Key Management, và tác động của nó tới hiệu năng tìm kiếm).
4. **Xung đột phạm vi quản lý Master Data:**
   UC04 giao việc quản lý Master Data cho Admin thuộc Module 1, nhưng các bảng Master Data này (Retreat Packages, Spa Services) lại được sử dụng trực tiếp bởi Module 2 (Student 2) và Module 3 (Student 3). Việc thiếu định nghĩa rõ ràng về API/DAO chia sẻ dữ liệu giữa 3 sinh viên có thể dẫn đến lỗi không đồng bộ dữ liệu khi ghép code.
