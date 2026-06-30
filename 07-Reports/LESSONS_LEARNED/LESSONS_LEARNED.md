# 📚 LESSONS LEARNED – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `07-Reports/LESSONS_LEARNED/`  
> **Mục đích:** Ghi lại những bài học kinh nghiệm, anti-patterns cần tránh, và best practices được đúc kết từ quá trình phát triển dự án SWP391.  
> **Lợi ích:** Phục vụ cho nhóm trong các dự án tương lai và làm tài liệu học tập.

---

## Tổng quan Lessons Learned

Tài liệu này được cập nhật liên tục trong suốt quá trình phát triển. Mỗi thành viên được khuyến khích ghi lại bài học của mình ngay khi phát hiện.

---

## 🔴 Bài học Kỹ thuật (Technical Lessons)

### L-001: Không bao giờ dùng `float`/`double` cho tiền tệ

**Bối cảnh:** Trong Sprint 2, Student 2 ban đầu dùng `double` để tính tổng hóa đơn. Kết quả: `2,500,000 * 3 = 7,499,999.9999` thay vì `7,500,000.00`.

**Bài học:**
```java
// ❌ KHÔNG BAO GIỜ làm thế này
double price = 2500000.0 * 3; // Floating point error!

// ✅ Luôn dùng BigDecimal với RoundingMode rõ ràng
BigDecimal price = new BigDecimal("2500000.00")
    .multiply(new BigDecimal("3"))
    .setScale(2, RoundingMode.HALF_UP);
```

**Áp dụng:** Mọi field tài chính trong toàn dự án đã được convert sang `BigDecimal`.

---

### L-002: JWT Secret phải đủ dài và lưu trong `.env`

**Bối cảnh:** Ban đầu team dùng secret `"mysecret123"` hardcode trong code. Sau khi review, nhận ra đây là lỗ hổng bảo mật nghiêm trọng.

**Bài học:**
```properties
# ❌ KHÔNG BAO GIỜ hardcode secret
String secret = "mysecret123";

# ✅ Luôn dùng .env với key đủ mạnh (256+ bits)
JWT_SECRET_KEY=your-very-long-secret-key-at-least-32-characters
```

**Lý do:** JWT HS256 yêu cầu key ít nhất 256 bits. Key ngắn có thể bị brute-force.

---

### L-003: SQL Server không hỗ trợ `ON DELETE CASCADE` circular

**Bối cảnh:** Student 2 thiết kế `spa_booking` có FK đến `room_booking` với `ON DELETE CASCADE`. Khi xóa `room_booking`, SQL Server báo lỗi "circular cascade delete".

**Bài học:**
```sql
-- ❌ Gây circular cascade error trong SQL Server
ALTER TABLE spa_booking
ADD FOREIGN KEY (room_booking_id) REFERENCES room_booking(booking_id) ON DELETE CASCADE;

-- ✅ Dùng ON DELETE SET NULL hoặc NO ACTION cho cross-component FK
ALTER TABLE spa_booking
ADD FOREIGN KEY (room_booking_id) REFERENCES room_booking(booking_id) ON DELETE SET NULL;
```

**Rule:** Chỉ dùng `CASCADE` cho quan hệ cha-con trực tiếp. Cross-component FK dùng `SET NULL` hoặc `NO ACTION`.

---

### L-004: AES Encryption cần encoding chuẩn để tránh mất dữ liệu

**Bối cảnh:** Khi encrypt dữ liệu tiếng Việt (`"Đau lưng mãn tính"`), nếu không chỉ định charset `UTF-8`, một số ký tự đặc biệt bị mất sau decrypt.

**Bài học:**
```java
// ❌ Không chỉ định charset
byte[] plainBytes = plainText.getBytes(); // Dùng default charset của JVM

// ✅ Luôn chỉ định UTF-8 explicit
byte[] plainBytes = plainText.getBytes(StandardCharsets.UTF_8);
// Và khi decrypt:
return new String(decryptedBytes, StandardCharsets.UTF_8);
```

---

### L-005: CORS phải được cấu hình chính xác – không dùng wildcard `*` trên production

**Bối cảnh:** Khi test, team dùng `allowedOrigins("*")` cho tiện. Sau đó mới nhận ra không thể dùng wildcard khi có `allowCredentials(true)`.

**Bài học:**
```java
// ❌ Không hoạt động với credentials
configuration.setAllowedOrigins(List.of("*"));
configuration.setAllowCredentials(true); // Lỗi!

// ✅ Phải chỉ định origin cụ thể
configuration.setAllowedOrigins(List.of(
    "http://localhost:5173",
    "https://your-production-domain.com"
));
configuration.setAllowCredentials(true);
```

---

### L-006: VNPay callback phải verify HMAC trước khi cập nhật DB

**Bối cảnh:** Nếu không verify HMAC của VNPay callback, bất kỳ ai cũng có thể giả mạo callback để đánh dấu invoice là PAID mà không cần thanh toán thật.

**Bài học:**
```java
// ❌ Nguy hiểm – update DB không verify
public void processCallback(Map<String, String> params) {
    if ("00".equals(params.get("vnp_ResponseCode"))) {
        invoiceService.markAsPaid(params.get("vnp_TxnRef")); // Không verify!
    }
}

// ✅ Verify HMAC trước
public void processCallback(Map<String, String> params) {
    String receivedHash = params.remove("vnp_SecureHash");
    String calculatedHash = vnPayService.hashAllFields(params);
    
    if (!calculatedHash.equals(receivedHash)) {
        throw new BusinessException("Invalid HMAC signature", HttpStatus.BAD_REQUEST);
    }
    
    if ("00".equals(params.get("vnp_ResponseCode"))) {
        invoiceService.markAsPaid(params.get("vnp_TxnRef")); // An toàn
    }
}
```

---

### L-007: Concurrent booking cần DB-level lock, không phải application-level

**Bối cảnh:** Student 3 ban đầu dùng `synchronized` block trong Java để prevent double-booking. Nhưng khi deploy multi-instance, lock này không có tác dụng.

**Bài học:**
```java
// ❌ Application-level lock – không hoạt động trên multi-instance
synchronized(this) {
    if (!isConflict(therapistId, start, end)) {
        createBooking(...);
    }
}

// ✅ DB-level lock với @Transactional(isolation = SERIALIZABLE)
// Hoặc dùng PESSIMISTIC_WRITE lock trong JPA:
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT s FROM SpaBooking s WHERE s.therapistId = :id AND ...")
List<SpaBooking> findConflictingBookingsWithLock(...);

// Trong service:
@Transactional(isolation = Isolation.SERIALIZABLE)
public SpaBooking createBooking(SpaBookingDTO dto) {
    // Check conflict với lock
    List<SpaBooking> conflicts = repo.findConflictingBookingsWithLock(...)
    if (!conflicts.isEmpty()) throw new BusinessException("Conflict", CONFLICT);
    return repo.save(newBooking);
}
```

---

### L-008: React Context không nên chứa logic phức tạp

**Bối cảnh:** Ban đầu `NotificationContext.jsx` chứa cả logic fetch API, websocket connection, và state management trong một file. Rất khó test và debug.

**Bài học:**
```javascript
// ❌ Context làm quá nhiều việc
const NotificationContext = createContext();
export function NotificationProvider({ children }) {
  // 200 dòng logic API, websocket, state...
}

// ✅ Tách riêng: Context chỉ provide state và actions
// Logic nằm trong custom hook
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  // Fetch logic, effect...
  return { notifications, markAsRead, clearAll };
}

// Context chỉ wrap
export function NotificationProvider({ children }) {
  const notifications = useNotifications();
  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
}
```

---

## 🟠 Bài học Quy trình (Process Lessons)

### P-001: Đặt tên branch và commit message có ý nghĩa

**Vấn đề:** Nhiều commit message là "fix bug", "update code", "test" – không biết commit đó làm gì.

**Best practice:**
```bash
# ❌ Không rõ ràng
git commit -m "fix bug"
git commit -m "update"

# ✅ Rõ ràng: [type]/[module]: description
git commit -m "feat/m1: add JWT refresh token rotation"
git commit -m "fix/m3: prevent double-booking therapist concurrent request"
git commit -m "docs/m5: add revenue analytics API documentation"
```

**Branch naming:**
```
feature/m1-health-profile-encryption
fix/m3-double-booking-concurrent
docs/update-api-swagger
```

---

### P-002: Test API với Postman Collection trước khi integrate Frontend

**Vấn đề:** Frontend developer thường integrate API trước khi Backend đã test kỹ. Dẫn đến mất thời gian debug cả hai phía.

**Best practice:**
1. Backend developer viết Postman collection cho API.
2. Chạy collection qua Newman để verify.
3. Share collection cho Frontend.
4. Frontend chỉ integrate khi API đã pass test.

---

### P-003: Code review PHẢI xem xét security, không chỉ functionality

**Vấn đề:** Nhiều PR được merge chỉ kiểm tra "code chạy được không" mà không kiểm tra:
- Có hardcode credential không?
- RBAC có đúng không?
- Input có được validate không?

**Checklist code review security:**
- [ ] Không có hardcoded secret/password.
- [ ] Tất cả sensitive endpoint có `@PreAuthorize`.
- [ ] Input validation với `@Valid` và custom validator.
- [ ] Không log sensitive data.
- [ ] BigDecimal cho tiền tệ, không dùng float/double.

---

### P-004: Database migration PHẢI có rollback script

**Vấn đề:** Khi phải rollback schema change, không có sẵn rollback script dẫn đến phải viết lại từ đầu và có thể gây sai sót.

**Best practice:** Mỗi migration file phải có:
```sql
-- Migration UP (apply change)
ALTER TABLE spa_booking ADD COLUMN google_event_id NVARCHAR(255);

-- Migration DOWN (rollback)
ALTER TABLE spa_booking DROP COLUMN google_event_id;
```

---

### P-005: Đọc tài liệu Business Requirements TRƯỚC khi code – không đoán

**Vấn đề:** Student 4 ban đầu implement menu filter theo cách mình nghĩ, không đọc kỹ Module 4 requirement. Kết quả phải refactor khi giáo viên review.

**Lesson:** Luôn đọc:
1. `01-Planning/Module_X.md` – Business requirements
2. `07-Reports/EDS/ModuleX/EDS_ModuleX.md` – Detailed design
3. `07-Reports/TDD/ModuleX/TDD_ModuleX.md` – Test design

**Chỉ code sau khi đã đọc và hiểu requirement.**

---

## 🟢 Best Practices đúc kết

### B-001: Sử dụng DTO pattern triệt để

Không bao giờ trả về Entity trực tiếp từ API. Luôn map sang DTO:
- Entity: `User.java` (có `password_hash`, `id_passport_encrypted`)  
- DTO: `UserDTO.java` (chỉ có `userId`, `email`, `fullName`, `role`)

### B-002: Validation ở nhiều lớp

```
Frontend: Form validation (UX)
          ↓
Controller: @Valid DTO validation (format check)
          ↓  
Service: Business rule validation (logic check)
          ↓
Database: Constraint validation (data integrity)
```

### B-003: Logging có cấu trúc

```java
// ✅ Structured logging
log.info("User {} created booking {} for room {} from {} to {}",
    userId, bookingId, roomId, checkIn, checkOut);

// ❌ Không log sensitive data
log.info("User {} passport: {}", userId, passportNumber); // Sai!
```

### B-004: Environment-specific configuration

```
.env.local     → Development (developer's laptop)
.env.test      → CI/CD pipeline
.env.staging   → Staging server
.env.production → Production (không được commit lên Git!)
```

---

## Tóm tắt Key Takeaways

> [!TIP]
> **Top 5 bài học quan trọng nhất từ dự án SMMS:**

1. **BigDecimal cho tiền** – Float/double là nguồn gốc của mọi rắc rối tài chính.
2. **DB-level lock cho concurrency** – Application lock vô dụng trong distributed system.
3. **Verify trước khi trust** – VNPay callback, JWT token, user input đều phải verify.
4. **Đọc requirement trước khi code** – Tiết kiệm thời gian refactor về sau.
5. **Security is not optional** – RBAC, encryption, no hardcode từ ngày đầu.

---

*Tài liệu này là tài sản quý giá của nhóm. Vui lòng cập nhật khi phát hiện lesson mới.*
