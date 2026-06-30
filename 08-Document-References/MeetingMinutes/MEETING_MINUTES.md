# 📝 MEETING MINUTES – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `08-Document-References/MeetingMinutes/`  
> **Mục đích:** Ghi lại biên bản các cuộc họp nhóm để theo dõi quyết định và action items.

---

## Template Biên Bản Họp

```markdown
## Meeting #{N} – {Ngày DD/MM/YYYY}

**Thời gian:** {HH:MM} – {HH:MM}  
**Địa điểm/Platform:** {Offline / Google Meet / Discord}  
**Người tham dự:** {Danh sách tên}  
**Người chủ trì:** {Tên}  
**Thư ký:** {Tên}  

### Agenda
1. ...
2. ...

### Nội dung thảo luận
...

### Quyết định
| Quyết định | Người chịu trách nhiệm | Deadline |
|-----------|----------------------|---------|
| ... | ... | ... |

### Action Items
- [ ] (Người thực hiện): Mô tả task – Deadline: DD/MM/YYYY

### Cuộc họp tiếp theo
**Ngày:** {DD/MM/YYYY} | **Thời gian:** {HH:MM} | **Platform:** {platform}
```

---

## Meeting #1 – Kick-off Meeting

**Ngày:** Tuần đầu tiên của dự án  
**Thời gian:** 19:00 – 21:00  
**Platform:** Google Meet  
**Người tham dự:** Cả 5 sinh viên nhóm  
**Người chủ trì:** HE198000 - Phạm Anh Tuấn (Team Leader)  

### Agenda
1. Đọc và phân tích đề bài SWP391-HOS-03.
2. Phân chia module cho từng thành viên.
3. Thống nhất tech stack và cấu trúc dự án.
4. Lên kế hoạch sprint.

### Quyết định

| Quyết định | Người chịu trách nhiệm | Deadline |
|-----------|----------------------|---------|
| Student 1 phụ trách Module 1 (Auth & Health) | HE181421 | Cuối Sprint 2 |
| Student 2 phụ trách Module 2 (Booking) | HE176556 | Cuối Sprint 3 |
| Student 3 phụ trách Module 3 (Spa Scheduling) | HE191437 | Cuối Sprint 3 |
| Student 4 phụ trách Module 4 (F&B) | HE191619 | Cuối Sprint 3 |
| Student 5 phụ trách Module 5 (Checkout & Analytics) | HE198000 | Cuối Sprint 4 |
| Tech stack: Spring Boot 3.4.2 + React 19 + SQL Server | Team | Setup Sprint 1 |
| Dùng BigDecimal cho tất cả trường tiền tệ | Team | Ngay từ đầu |

### Action Items
- [ ] (All): Đọc kỹ SRS và EDS template – Deadline: Cuối tuần 1
- [ ] (Student 1): Setup Spring Boot project, cấu trúc package – Deadline: Cuối tuần 1
- [ ] (Student 5): Thiết kế Database schema đầy đủ – Deadline: Cuối tuần 2
- [ ] (All): Tạo EDS cho module của mình – Deadline: Tuần 2

---

## Meeting #2 – Database Design Review

**Ngày:** Tuần 2  
**Thời gian:** 20:00 – 22:00  
**Platform:** Discord (voice + screen share)  

### Agenda
1. Review database schema Student 5 đề xuất.
2. Thảo luận về cascade delete strategy.
3. Confirm AES encryption implementation.

### Nội dung thảo luận

**Vấn đề cascade delete trong SQL Server:**
- Student 2: `spa_booking` có FK đến cả `User` và `room_booking`. Nếu dùng `CASCADE` cho cả 2, SQL Server báo lỗi "multiple cascade paths".
- Giải pháp: Dùng `CASCADE` chỉ cho quan hệ cha-con trực tiếp. Cross-component FK dùng `SET NULL` hoặc `NO ACTION`.

**AES encryption decision:**
- Dùng AES-256-CBC với IV random cho mỗi encrypt operation.
- Key và IV stored trong `.env`, KHÔNG trong code.
- Fields cần encrypt: `physical_condition_encrypted`, `food_allergies_encrypted`, `id_passport_encrypted`.

### Quyết định

| Quyết định | Người chịu trách nhiệm | Deadline |
|-----------|----------------------|---------|
| Cascade strategy: CASCADE chỉ cho direct child | Student 5 (Schema) | Ngay trong tuần 2 |
| AES util class với random IV | Student 1 (Security) | Đầu tuần 3 |
| Script seed data cho development | Student 5 | Cuối tuần 2 |

---

## Meeting #3 – Mid-Sprint Review (Sprint 2)

**Ngày:** Giữa Sprint 2  
**Thời gian:** 19:30 – 21:00  
**Platform:** Google Meet  

### Agenda
1. Demo tiến độ từng module.
2. Unblock blockers.
3. Review CORS issue.

### Demo

| Module | Demo content | Kết quả |
|--------|-------------|---------|
| M1 | JWT login/register flow | ✅ Working |
| M2 | Room booking API (Postman) | ✅ Working |
| M3 | SpaBooking entity (chưa có logic) | 🟡 In progress |
| M4 | FoodMenu API cơ bản | ✅ Working |
| M5 | Invoice schema, VNPay research | 🟡 In progress |

### Blockers được giải quyết
- **CORS issue (Student 1):** Fix bằng cách thêm explicit `allowedOrigins` và `allowCredentials(true)`.
- **VNPay HMAC encoding (Student 5):** Dùng `StandardCharsets.UTF_8` cho tất cả string operations.

---

## Meeting #4 – Spa Scheduling Technical Review

**Ngày:** Tuần 5  
**Thời gian:** 20:00 – 22:30  
**Platform:** Discord  

### Agenda
1. Review thuật toán chống double-booking (Student 3).
2. Thảo luận Google Calendar integration.
3. RBAC enforcement strategy.

### Nội dung thảo luận

**Double-booking prevention algorithm:**
```sql
-- Conflict check query (Student 3 đề xuất):
SELECT COUNT(*) FROM spa_booking
WHERE therapist_id = :therapistId
  AND status NOT IN ('CANCELLED', 'NOSHOW')
  AND NOT (end_datetime <= :newStart OR start_datetime >= :newEnd)
```
- Nếu count > 0 → conflict → throw `BusinessException(CONFLICT)`.
- Wrap trong `@Transactional(isolation = SERIALIZABLE)` để prevent race condition.

**Google Calendar sync strategy:**
- Tạo event khi spa booking CONFIRMED.
- Update event khi reschedule.
- Delete event khi CANCELLED.
- Lưu `google_event_id` trong spa_booking table để reference.

### Quyết định

| Quyết định | Người chịu trách nhiệm | Deadline |
|-----------|----------------------|---------|
| Dùng SERIALIZABLE isolation cho spa booking | Student 3 | Cuối tuần 5 |
| Google Calendar event delete khi cancel | Student 3 | Cuối tuần 5 |
| Concurrent test với ExecutorService | Student 3 | Đầu tuần 6 |

---

## Meeting #5 – Pre-UAT Preparation

**Ngày:** Tuần 9 (2026-06-20)  
**Thời gian:** 19:00 – 21:30  
**Platform:** Google Meet  

### Agenda
1. Review danh sách UAT scenarios.
2. Phân chia người test từng scenario.
3. Setup môi trường UAT.
4. Checklist trước khi demo với giáo viên.

### Danh sách cần hoàn thành trước UAT

| Task | Người làm | Deadline | Trạng thái |
|------|----------|---------|------------|
| Fix PDF Vietnamese encoding | Student 5 | 25/06 | ✅ Done |
| Add rate limiting cho login endpoint | Student 1 | 25/06 | ✅ Done |
| Polish ChefDashboard UI | Student 4 | 27/06 | 🟡 In Progress |
| Deploy staging server | Student 5 | 28/06 | ⬜ Not started |
| Final documentation review | All | 30/06 | ⬜ Not started |

### Action Items
- [ ] (Student 5): Deploy lên staging – Deadline: 28/06/2026
- [ ] (All): Mỗi người test 7 scenarios của module mình – Deadline: 29/06/2026
- [ ] (Student 1): Compile final security report – Deadline: 30/06/2026
- [ ] (Team Leader): Prepare presentation slides – Deadline: 01/07/2026

### Cuộc họp tiếp theo
**Ngày:** 29/06/2026 | **Thời gian:** 20:00 | **Platform:** Google Meet (UAT Results Review)

---

## Meeting #6 – UAT Results & Final (Kế hoạch)

**Ngày dự kiến:** 29/06/2026  
*(Biên bản sẽ được cập nhật sau khi họp)*

### Agenda dự kiến
1. Review kết quả UAT từng module.
2. Quyết định bug nào fix, bug nào defer.
3. Xác nhận tài liệu nộp hoàn chỉnh.
4. Phân công presenter cho buổi demo với giáo viên.

---

*Meeting minutes phải được gửi cho cả nhóm qua Discord trong vòng 24h sau buổi họp.*
