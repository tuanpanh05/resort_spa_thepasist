# 📦 DATABASE MIGRATION REPORTS – SMMS

> **Thư mục:** `04-Implement/DATABASE_MIGRATION_REPORTS/`  
> **Mục đích:** Ghi lại tất cả các thay đổi schema cơ sở dữ liệu SQL Server theo thứ tự thời gian để đảm bảo có thể tái lập lại môi trường hoặc rollback khi cần.

---

## Quy tắc Migration

> [!IMPORTANT]
> Mọi thay đổi schema database **bắt buộc phải có migration report** trước khi merge vào nhánh `main`. Không được sửa DDL trực tiếp trên môi trường production mà không có tài liệu.

**Format tên file:** `V{version}__{description}.md`  
Ví dụ: `V1.0__initial_schema.md`, `V1.1__add_voucher_table.md`

---

## Lịch sử Migration

| Version | Ngày | Mô tả | Tác giả | Trạng thái |
|---------|------|--------|---------|------------|
| V1.0 | 2026-05-15 | Initial Schema – 22 bảng cốt lõi | Team | ✅ Applied |
| V1.1 | 2026-05-20 | Thêm bảng `Voucher`, `OtpToken` | Student 1 | ✅ Applied |
| V1.2 | 2026-05-25 | Thêm bảng `PaymentTransactionLog`, `Inventory` | Student 5 | ✅ Applied |
| V1.3 | 2026-06-01 | Thêm bảng `Complaint`, `SwapRequest`, `SystemConfiguration` | Student 3 | ✅ Applied |
| V1.4 | 2026-06-10 | Thêm bảng `ComboMenuTemplate`, `DailyMealOrder`, `BookingDiet` | Student 4 | ✅ Applied |
| V1.5 | 2026-06-15 | Thêm `RestaurantTable`, thêm cột `is_toxic` trong `feedback` | Student 4 | ✅ Applied |
| V1.6 | 2026-06-20 | Fix cascade delete conflict trong SQL Server | Team | ✅ Applied |

---

## V1.0 – Initial Schema (2026-05-15)

### Các bảng được tạo

```sql
-- User & Authentication
CREATE TABLE [User] (
    user_id INT PRIMARY KEY IDENTITY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255),
    full_name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    id_passport_encrypted NVARCHAR(MAX),
    role NVARCHAR(50) CHECK (role IN ('MANAGER','RECEPTIONIST','THERAPIST','CHEF','CUSTOMER')),
    status NVARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE medical_profile (
    profile_id INT PRIMARY KEY IDENTITY,
    user_id INT UNIQUE NOT NULL,
    physical_condition_encrypted NVARCHAR(MAX),
    food_allergies_encrypted NVARCHAR(MAX),
    explicit_consent_signed BIT DEFAULT 0,
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE
);

CREATE TABLE refresh_token (
    token_id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    token NVARCHAR(MAX) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE
);

-- Accommodation
CREATE TABLE room_type (
    room_type_id INT PRIMARY KEY IDENTITY,
    type_name NVARCHAR(100) NOT NULL,
    base_price DECIMAL(18,2) NOT NULL,
    capacity INT NOT NULL
);

CREATE TABLE room (
    room_id INT PRIMARY KEY IDENTITY,
    room_type_id INT NOT NULL,
    room_number NVARCHAR(20) UNIQUE NOT NULL,
    status NVARCHAR(20) DEFAULT 'AVAILABLE'
        CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE','DIRTY')),
    FOREIGN KEY (room_type_id) REFERENCES room_type(room_type_id)
);

-- ... (xem thêm trong resort_spa_db.sql)
```

### Rollback Script

```sql
-- Chạy theo thứ tự ngược lại
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS invoice;
DROP TABLE IF EXISTS food_order_detail;
DROP TABLE IF EXISTS food_order;
-- ... (tiếp tục theo thứ tự dependency)
DROP TABLE IF EXISTS [User];
```

---

## V1.1 – Thêm Voucher & OTP (2026-05-20)

### Thay đổi

```sql
-- Thêm bảng Voucher
CREATE TABLE voucher (
    voucher_id INT PRIMARY KEY IDENTITY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5,2),
    discount_amount DECIMAL(18,2),
    valid_from DATETIME,
    valid_to DATETIME,
    max_uses INT,
    used_count INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'ACTIVE'
);

-- Thêm bảng OTP Token
CREATE TABLE otp_token (
    token_id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    otp_code NVARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE
);
```

---

## V1.2 – Payment Log & Inventory (2026-05-25)

### Thay đổi

```sql
-- Thêm bảng PaymentTransactionLog
CREATE TABLE payment_transaction_log (
    log_id INT PRIMARY KEY IDENTITY,
    invoice_id INT NOT NULL,
    vnpay_tran_id NVARCHAR(255),
    amount DECIMAL(18,2) NOT NULL,
    status NVARCHAR(50),
    raw_response NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (invoice_id) REFERENCES invoice(invoice_id) ON DELETE NO ACTION
);

-- Thêm bảng Inventory
CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY IDENTITY,
    item_name NVARCHAR(255) NOT NULL,
    quantity INT DEFAULT 0,
    unit NVARCHAR(50),
    min_threshold INT DEFAULT 10,
    updated_at DATETIME DEFAULT GETDATE()
);
```

---

## V1.3 – Complaint, SwapRequest & SystemConfiguration (2026-06-01)

### Thay đổi

```sql
-- Hệ thống khiếu nại
CREATE TABLE complaint (
    complaint_id INT PRIMARY KEY IDENTITY,
    user_id INT,
    booking_id INT,
    content NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'OPEN',
    resolved_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE SET NULL
);

-- Hoán đổi ca làm việc
CREATE TABLE swap_request (
    request_id INT PRIMARY KEY IDENTITY,
    requester_id INT NOT NULL,
    target_id INT NOT NULL,
    shift_date DATE NOT NULL,
    status NVARCHAR(20) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (requester_id) REFERENCES [User](user_id),
    FOREIGN KEY (target_id) REFERENCES [User](user_id)
);

-- Cấu hình hệ thống (Admin settings)
CREATE TABLE system_configuration (
    config_id INT PRIMARY KEY IDENTITY,
    config_key NVARCHAR(100) UNIQUE NOT NULL,
    config_value NVARCHAR(MAX),
    description NVARCHAR(500),
    updated_at DATETIME DEFAULT GETDATE()
);
```

---

## V1.4 – F&B Advanced Tables (2026-06-10)

### Thay đổi

```sql
-- Template combo bữa ăn
CREATE TABLE combo_menu_template (
    template_id INT PRIMARY KEY IDENTITY,
    template_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    is_active BIT DEFAULT 1
);

-- Đặt món theo ngày (pre-select)
CREATE TABLE daily_meal_order (
    daily_order_id INT PRIMARY KEY IDENTITY,
    booking_id INT NOT NULL,
    meal_date DATE NOT NULL,
    meal_type NVARCHAR(20) CHECK (meal_type IN ('BREAKFAST','LUNCH','DINNER')),
    status NVARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (booking_id) REFERENCES room_booking(booking_id) ON DELETE CASCADE
);

-- Chế độ ăn của booking
CREATE TABLE booking_diet (
    diet_id INT PRIMARY KEY IDENTITY,
    booking_id INT UNIQUE NOT NULL,
    dietary_preference NVARCHAR(MAX),
    allergen_notes NVARCHAR(MAX),
    FOREIGN KEY (booking_id) REFERENCES room_booking(booking_id) ON DELETE CASCADE
);
```

---

## Hướng dẫn tạo Migration Report mới

Khi cần thay đổi schema, tạo file mới theo format:

```markdown
## V{x.y} – Tên thay đổi (YYYY-MM-DD)

### Lý do thay đổi
...

### Thay đổi
```sql
-- DDL mới
```

### Rollback Script
```sql
-- Cách hoàn tác
```

### Ảnh hưởng đến Entity Java
- Entity: `{EntityName}.java` – thêm field `{field}`
- Repository: cần update query `{method}`
```

---

*File cập nhật bởi AI Agent theo policy `00-Policy/AI_RULES.md`*
