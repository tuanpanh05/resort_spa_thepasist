# DATABASE CONVENTIONS & DESIGN STANDARDS (QUY ƯỚC THIẾT KẾ CSDL)

Tài liệu này quy định các tiêu chuẩn bắt buộc khi thiết kế bảng, đặt tên thuộc tính, ràng buộc dữ liệu và cập nhật sơ đồ cơ sở dữ liệu trên hệ quản trị cơ sở dữ liệu **Microsoft SQL Server**.

---

## 1. Quy Ước Đặt Tên (Naming Conventions)

### 1.1 Tên Bảng (Table Names)
* **Quy chuẩn:** Viết thường toàn bộ, sử dụng từ đơn dạng số ít (singular), ngăn cách bằng dấu gạch dưới (lower_snake_case).
  - *Ví dụ chuẩn:* `room_booking`, `spa_booking`, `food_order_detail`.
  - *Ngoại lệ bắt buộc:* Bảng người dùng phải đặt tên là `[User]` (Viết hoa chữ U và bao quanh bằng dấu ngoặc vuông) để tránh xung đột với từ khóa hệ thống `USER` của SQL Server.

### 1.2 Tên Cột (Column Names)
* **Quy chuẩn:** Viết thường toàn bộ, dùng snake_case.
  - *Ví dụ:* `check_in_date`, `base_price`, `id_passport_encrypted`.
* **Khóa chính (Primary Key):** Luôn kết thúc bằng `_id` ghép với tên viết gọn của bảng.
  - *Ví dụ:* `booking_id`, `invoice_id`, `user_id`.

### 1.3 Tên Ràng Buộc & Chỉ Mục (Constraints & Indexes)
* **Khóa ngoại (Foreign Key):** `FK_[Tên_Bảng_Con]_[Tên_Bảng_Cha]`
  - *Ví dụ:* `FK_medical_profile_User`, `FK_spa_booking_spa_service`.
* **Ràng buộc kiểm tra (Check Constraint):** `CK_[Tên_Bảng]_[Tên_Cột]`
  - *Ví dụ:* `CK_User_Role`, `CK_retreat_package_Price`.
* **Chỉ mục (Index):** `IX_[Tên_Bảng]_[Tên_Cột]`
  - *Ví dụ:* `IX_room_booking_User`, `IX_invoice_Booking`.

---

## 2. Tiêu Chuẩn Kiểu Dữ Liệu & Ràng Buộc (Data Types & Constraints)

### 2.1 Tiền tệ & Giá cả
* Bắt buộc sử dụng kiểu dữ liệu `DECIMAL(15, 2)` cho tất cả các cột liên quan đến tiền bạc (như `base_price`, `total_amount`, `tax_and_fees`).
* Tuyệt đối không dùng kiểu `FLOAT`, `REAL` hay `MONEY` để tránh các sai số làm tròn khi thực hiện phép tính tài chính.
* Luôn kèm theo ràng buộc kiểm tra để đảm bảo số tiền không âm:
  ```sql
  base_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT CK_retreat_package_Price CHECK (base_price >= 0)
  ```

### 2.2 Ngày tháng & Thời gian
* Sử dụng kiểu `DATETIME2` hoặc `DATE` thay vì `DATETIME` cũ để tối ưu dung lượng và tăng độ chính xác.
* Giá trị mặc định của ngày tạo bản ghi nên dùng `GETDATE()` (hoặc `SYSUTCDATETIME()`).

### 2.3 Bảo mật dữ liệu nhạy cảm
* Thông tin mật khẩu băm, số căn cước/hộ chiếu mã hóa, tình trạng bệnh án mã hóa phải dùng kiểu `VARCHAR(MAX)` hoặc `NVARCHAR(MAX)` để lưu chuỗi Base64 mã hóa AES một cách an toàn.

---

## 3. Quy Trình Cập Nhật Cơ Sở Dữ Liệu

1. **Không chỉnh sửa trực tiếp trên Database Client:** Tuyệt đối không thay đổi sơ đồ bảng trực tiếp trên các công cụ như SSMS hay DBeaver mà không cập nhật lại mã nguồn.
2. **Cập nhật File Script:** Mọi thay đổi về cấu trúc bảng (thêm cột, đổi kiểu dữ liệu, thêm index) phải được khai báo bằng lệnh SQL tương ứng trong tệp [resort_spa_db.sql](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/SQL_DB_RESORT_SPA/resort_spa_db.sql).
3. **Thứ tự xóa bảng con:** Đảm bảo khi viết lệnh `DROP TABLE` ở đầu script, các bảng con có khóa ngoại tham chiếu phải được drop trước để tránh lỗi ràng buộc khóa ngoại (ví dụ: `cart_item` phải bị drop trước `food_menu`).
4. **Nạp dữ liệu mẫu (Seeding Data):** Mỗi bảng dữ liệu danh mục hoặc cấu hình phải đi kèm các dòng lệnh `INSERT` dữ liệu mẫu chuẩn ở cuối file SQL để bất kỳ thành viên nào trong nhóm cũng có thể tái tạo lại CSDL sạch ngay lập tức.
