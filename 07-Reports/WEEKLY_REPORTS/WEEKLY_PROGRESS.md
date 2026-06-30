# 📅 WEEKLY REPORTS – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `07-Reports/WEEKLY_REPORTS/`  
> **Mục đích:** Báo cáo tiến độ hàng tuần để theo dõi công việc của từng thành viên.  
> **Template:** Điền vào cuối mỗi tuần (thứ Sáu hoặc thứ Bảy)

---

## Template Báo Cáo Tuần

```markdown
## Tuần {N} – {DD/MM/YYYY} đến {DD/MM/YYYY}

### Tiến độ theo thành viên

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | ... | ... | ... |
| Student 2 | M2 | ... | ... | ... |
| Student 3 | M3 | ... | ... | ... |
| Student 4 | M4 | ... | ... | ... |
| Student 5 | M5 | ... | ... | ... |

### KPIs tuần này
- Build status: ✅ / ❌
- Test coverage: ___%
- Open bugs: ___ P1 / ___ P2 / ___ P3
- Merged PRs: ___

### Blockers & Quyết định
...

### Kế hoạch tuần tới
...
```

---

## Tuần 1 – Khởi động dự án

**Thời gian:** Tuần đầu tiên của dự án

### Tiến độ

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | Đọc SRS, setup Spring Boot, tạo User entity | AuthController | Chưa có |
| Student 2 | M2 | Đọc SRS, thiết kế booking flow | Room entity, Booking entity | Chưa có |
| Student 3 | M3 | Đọc SRS, phân tích scheduling complexity | SpaBooking entity | Algorithm design |
| Student 4 | M4 | Đọc SRS, thiết kế allergen filter logic | FoodMenu entity | Allergen DB design |
| Student 5 | M5 | Đọc SRS, setup Invoice schema, VNPay research | Invoice entity | VNPay docs reading |

### KPIs
- Build status: ✅ (Spring Boot booting)
- Merged PRs: 5 (initial setup)

### Quyết định
- Dùng `DECIMAL(18,2)` cho tất cả trường tài chính – không dùng `float`.
- AES-256 encryption dùng static IV+Key từ `.env` (key rotation sẽ implement nếu còn thời gian).
- CORS whitelist: `http://localhost:5173` (frontend dev) và domain production.

---

## Tuần 2 – Database & Infrastructure

**Thời gian:** Tuần 2

### Tiến độ

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | User entity, medical_profile entity, AES util | JWT setup | Chưa có |
| Student 2 | M2 | Room, RoomType, RoomBooking entity | BookingService | Chưa có |
| Student 3 | M3 | SpaBooking entity, TreatmentRoom entity | Scheduling logic | Cần clarify business rule |
| Student 4 | M4 | FoodMenu, FoodOrder entity, allergen logic | ChefMeal flow | Chưa có |
| Student 5 | M5 | Invoice entity, PaymentTransactionLog | VNPay integration | VNPay test key |

### KPIs
- Build status: ✅
- Database: 22/22 bảng tạo thành công
- Merged PRs: 8

### Blockers & Quyết định
- **Quyết định cascade delete:** Dùng `ON DELETE NO ACTION` cho `spa_booking` và `invoice` để tránh circular dependency trong SQL Server.
- **Quyết định M3:** Double-booking prevention dùng DB-level lock với `@Transactional(isolation = SERIALIZABLE)`.

---

## Tuần 3 – Auth & Booking MVP

**Thời gian:** Tuần 3

### Tiến độ

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | JWT auth hoàn chỉnh, OTP email, Firebase SSO | Health profile API | Chưa có |
| Student 2 | M2 | RoomBookingService hoàn chỉnh, deposit logic | CheckIn flow | Chưa có |
| Student 3 | M3 | Scheduling algorithm v1 | Google Calendar sync | Calendar API quota |
| Student 4 | M4 | Allergen filter logic hoàn chỉnh | Chef Dashboard API | Chưa có |
| Student 5 | M5 | VNPay integration, invoice basic | Revenue analytics | HMAC calculation |

### KPIs
- Build status: ✅
- Test coverage: 45%
- Merged PRs: 12

### Blockers
- CORS issue giữa Spring Boot và React – mất 3h debug. **Fix:** Thêm `@CrossOrigin` và cấu hình `WebMvcConfigurer`.
- VNPay HMAC-SHA512 calculation sai ký tự encoding – fix bằng `StandardCharsets.UTF_8`.

---

## Tuần 4 – Frontend Integration

**Thời gian:** Tuần 4

### Tiến độ

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | Login.jsx, Register.jsx, HealthProfile.jsx | Unit tests | Chưa có |
| Student 2 | M2 | BookingPage.jsx (multistep), Room cards | StaffDashboard | Chưa có |
| Student 3 | M3 | Spa.jsx booking UI, SpecialistDashboard | Polish UI | Chưa có |
| Student 4 | M4 | Restaurant.jsx, ChefDashboard.jsx | Allergy badge UI | Chưa có |
| Student 5 | M5 | Payment.jsx, PaymentResult.jsx, AdminDashboard | Revenue charts | Chart library |

### KPIs
- Build status: ✅ Frontend + Backend
- E2E happy path: ✅ Working
- Merged PRs: 15

---

## Tuần 5 – Spa & F&B Deep Dive

**Thời gian:** Tuần 5

### Tiến độ

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | Medical profile encryption verified | Right-to-deletion scheduler | Chưa có |
| Student 2 | M2 | CheckInController + khai báo tạm trú | Full test suite M2 | Chưa có |
| Student 3 | M3 | Google Calendar sync hoàn chỉnh | Concurrent booking test | Chưa có |
| Student 4 | M4 | ChefMeal allergy warnings complete | F&B report | Chưa có |
| Student 5 | M5 | Consolidated invoice complete | Therapist utilization | SQL query |

### KPIs
- Build status: ✅
- Test coverage: 62%
- Open bugs: 2 P2 / 5 P3
- Merged PRs: 18

### Quyết định quan trọng
- Therapist utilization formula: `(Tổng giờ có booking) / (Tổng giờ làm theo ca) * 100%`
- Scheduler xóa dữ liệu nhạy cảm: chạy mỗi Chủ Nhật 2:00 AM, xóa data của bookings đã checkout > 7 ngày.

---

## Tuần 6 – Integration & Bug Fixes

**Thời gian:** Tuần 6

### Tiến độ

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | Right-to-deletion scheduler | Security tests | Chưa có |
| Student 2 | M2 | Full M2 integration tests | UAT scenarios | Chưa có |
| Student 3 | M3 | Concurrent booking test ✅ | M3 final report | Chưa có |
| Student 4 | M4 | F&B integration complete | UAT scenarios | Chưa có |
| Student 5 | M5 | Revenue charts, PDF invoice | Analytics tests | Chưa có |

### KPIs
- Build status: ✅
- Test coverage: 68%
- Open bugs: 0 P1 / 3 P2 / 8 P3
- Merged PRs: 22

---

## Tuần 7 – Security Audit & Polish

**Thời gian:** Tuần 7

### Tiến độ

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | RBAC tests all pass | Final docs | Chưa có |
| Student 2 | M2 | Checkout block logic verified | UAT | Chưa có |
| Student 3 | M3 | Security review M3 | - | Chưa có |
| Student 4 | M4 | Allergy RBAC Chef verified | UAT | Chưa có |
| Student 5 | M5 | VNPay HMAC validation secure | Final report | Chưa có |

### KPIs
- Build status: ✅
- Test coverage: 72%
- Open bugs: 0 P1 / 1 P2 / 5 P3
- Security issues: 0 critical / 2 medium (fixed)

---

## Báo Cáo Tuần Hiện Tại – Tuần 10 (2026-06-27)

### Tiến độ

| Thành viên | Module | Công việc hoàn thành | Công việc còn lại | Blockers |
|-----------|--------|---------------------|-------------------|---------|
| Student 1 | M1 | All M1 features complete | Final documentation | None |
| Student 2 | M2 | All M2 features complete | UAT scenarios M2 | None |
| Student 3 | M3 | All M3 features complete | UAT scenarios M3 | None |
| Student 4 | M4 | All M4 features complete | UAT scenarios M4 | None |
| Student 5 | M5 | Revenue analytics complete | Deploy staging | None |

### KPIs
- Build status: ✅
- Test coverage: 72% (target 70% ✅)
- Open bugs: 0 P1 / 1 P2 / 3 P3
- All 25 UC implemented: ✅

### Kế hoạch tuần tới
1. Hoàn thành UAT với tất cả 36 scenarios.
2. Fix 1 P2 bug còn lại (PDF Vietnamese encoding edge case).
3. Deploy lên staging server.
4. Chuẩn bị tài liệu nộp final.

---

*Điền đủ báo cáo tuần trước buổi họp nhóm cuối tuần.*
