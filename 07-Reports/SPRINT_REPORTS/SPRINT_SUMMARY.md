# 📅 SPRINT REPORTS – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `07-Reports/SPRINT_REPORTS/`  
> **Mục đích:** Báo cáo tiến độ theo sprint của từng module và cả nhóm.  
> **Format:** Scrum-based Sprint Review & Retrospective

---

## Sprint Overview

| Sprint | Thời gian | Mục tiêu | Trạng thái |
|--------|-----------|---------|------------|
| Sprint 1 | Tuần 1-2 | Setup dự án, database, cấu trúc | ✅ Hoàn thành |
| Sprint 2 | Tuần 3-4 | Module 1 (Auth) + Module 2 (Booking) cơ bản | ✅ Hoàn thành |
| Sprint 3 | Tuần 5-6 | Module 3 (Spa) + Module 4 (F&B) cơ bản | ✅ Hoàn thành |
| Sprint 4 | Tuần 7-8 | Module 5 (Checkout) + Tích hợp liên module | ✅ Hoàn thành |
| Sprint 5 | Tuần 9-10 | Bug fix, Polish UI, Security audit, UAT | 🟡 Đang thực hiện |

---

## Sprint 1 – Project Setup & Foundation

**Thời gian:** Tuần 1-2  
**Sprint Goal:** Khởi tạo dự án, thiết kế database, cấu trúc codebase.

### Completed Items ✅

| Task | Module | Người thực hiện | Story Points |
|------|--------|----------------|--------------|
| Khởi tạo Spring Boot 3.4.2 + Java 21 | Backend | Team | 3 |
| Khởi tạo React 19 + Vite frontend | Frontend | Team | 2 |
| Thiết kế và tạo SQL Server schema (22 bảng) | Database | Student 1 + 2 | 8 |
| Viết SRS, EDS, TDD cho cả 5 module | Documentation | Team | 13 |
| Cấu hình Git workflow, branch strategy | DevOps | Student 5 | 2 |
| Setup CI/CD cơ bản | DevOps | Student 5 | 3 |
| Viết tài liệu AI_RULES.md, AI_TEAM_RULES.md | Policy | Team | 2 |

**Total Story Points:** 33 / 35 (94% completion)

### Sprint Review

**Điều đã làm tốt:**
- Database schema được thiết kế kỹ lưỡng từ đầu, tránh migration lớn về sau.
- Tài liệu EDS và TDD đầy đủ cho cả 25 UC.

**Điều cần cải thiện:**
- Cần thêm test data seed script để phát triển nhanh hơn.
- Cần thống nhất naming convention sớm hơn.

---

## Sprint 2 – Auth & Booking Foundation

**Thời gian:** Tuần 3-4  
**Sprint Goal:** Hoàn thành Module 1 (Auth/Health Profile) + Module 2 (Booking cơ bản) backend + frontend.

### Completed Items ✅

| Task | Module | Người thực hiện | Story Points |
|------|--------|----------------|--------------|
| `AuthController` – Register, Login, Refresh, OTP | M1 | Student 1 | 8 |
| `MedicalProfileController` + AES-256 encryption | M1 | Student 1 | 5 |
| Firebase Google SSO integration | M1 | Student 1 | 5 |
| `Login.jsx`, `Register.jsx` với consent checkbox | M1 Frontend | Student 1 | 5 |
| `HealthProfile.jsx` – form khai báo sức khỏe | M1 Frontend | Student 1 | 3 |
| `RoomBookingController` – CRUD cơ bản | M2 | Student 2 | 8 |
| `BookingPage.jsx` – multistep booking form | M2 Frontend | Student 2 | 8 |
| VNPay payment URL integration | M2 + M5 | Student 2 + 5 | 8 |

**Total Story Points:** 50 / 55 (91% completion)

### Burndown

```
Story Points Remaining:
Week 3: 55 → 40 → 25 → 10 → 5
Week 4: 5  → 0 (completed)
```

### Sprint Retrospective

**+ What went well:**
- JWT + Spring Security setup went smoothly.
- VNPay sandbox integration tested and working.

**− What could be improved:**
- CORS configuration took too long to debug (3 hours).
- Need better API documentation (use Swagger/OpenAPI).

**→ Action items:**
- Thêm Swagger UI cho backend API docs.
- Tạo Postman collection shared cho cả nhóm.

---

## Sprint 3 – Spa Engine & F&B Dashboard

**Thời gian:** Tuần 5-6  
**Sprint Goal:** Module 3 (Spa Scheduling Engine) + Module 4 (F&B với allergen filtering).

### Completed Items ✅

| Task | Module | Người thực hiện | Story Points |
|------|--------|----------------|--------------|
| `SpaBookingController` + double-booking prevention | M3 | Student 3 | 13 |
| `GoogleCalendarService` – Calendar sync | M3 | Student 3 | 8 |
| `Spa.jsx` – full spa booking UI | M3 Frontend | Student 3 | 8 |
| `SpecialistDashboard.jsx` – therapist view | M3 Frontend | Student 3 | 5 |
| `ChefMealController` – allergy-aware orders | M4 | Student 4 | 8 |
| `GuestMealController` – filtered menu | M4 | Student 4 | 5 |
| `ChefDashboard.jsx` – real-time allergy alerts | M4 Frontend | Student 4 | 8 |
| `Restaurant.jsx` – order food with filter | M4 Frontend | Student 4 | 5 |

**Total Story Points:** 60 / 65 (92% completion)

### Điểm nổi bật Sprint 3

- 🔥 **Double-booking prevention** với DB-level locking (`SELECT ... FOR UPDATE` equivalent in SQL Server) hoạt động đúng trong concurrent test.
- 🔥 **Allergen filtering** tự động lọc menu theo health profile của guest – không cần thao tác thủ công.

### Sprint Retrospective

**+ What went well:**
- Module 3 complex scheduling logic implemented correctly.
- Module 4 allergen filter works as expected.

**− What could be improved:**
- Google Calendar sync bị rate limit khi test nhiều lần – cần cache event IDs.
- ChefDashboard UI cần polish thêm.

---

## Sprint 4 – Checkout, Analytics & Integration

**Thời gian:** Tuần 7-8  
**Sprint Goal:** Module 5 (Consolidated Checkout + Analytics) + Tích hợp toàn module.

### Completed Items ✅

| Task | Module | Người thực hiện | Story Points |
|------|--------|----------------|--------------|
| `InvoiceController` – AHLEI consolidated invoice | M5 | Student 5 | 8 |
| `RevenueController` – revenue analytics | M5 | Student 5 | 5 |
| `InvoicePdfService` – PDF generation | M5 | Student 5 | 8 |
| `Payment.jsx`, `PaymentResult.jsx` | M5 Frontend | Student 5 | 8 |
| `AdminDashboard.jsx` – revenue charts | M5 Frontend | Student 5 | 8 |
| Checkout block logic (unpaid invoices) | M5 | Student 5 | 5 |
| Cross-module integration testing | All | Team | 8 |
| Bug fixes from integration testing | All | Team | 8 |
| `StaffDashboard.jsx` – receptionist view | M2 Frontend | Student 2 | 5 |

**Total Story Points:** 63 / 65 (97% completion)

### Sprint Retrospective

**+ What went well:**
- PDF invoice generation using OpenPDF works well.
- Revenue analytics dashboard looks professional.
- Cross-module integration mostly smooth.

**− What could be improved:**
- Checkout block logic had edge case with Package (partially paid) – fixed.
- PDF encoding for Vietnamese characters needed special config.

---

## Sprint 5 – Polish, Security & UAT (Current)

**Thời gian:** Tuần 9-10  
**Sprint Goal:** Security audit, UI polish, performance optimization, UAT preparation.

### In Progress 🟡

| Task | Module | Người thực hiện | Trạng thái |
|------|--------|----------------|------------|
| Security penetration testing | All | Team | 🟡 50% |
| UI/UX polish – animations, loading states | Frontend | Team | 🟡 60% |
| Performance optimization | All | Team | 🟡 40% |
| UAT test execution | All | Team | ⬜ Not started |
| Final documentation | All | Team | 🟡 70% |
| Deployment to staging | DevOps | Student 5 | ⬜ Not started |

### Risk Assessment

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Google Calendar quota exceed | 🟠 Medium | Cache event IDs, rate limiting |
| VNPay IPN timeout | 🟠 Medium | Implement retry mechanism |
| SQL Server connection pool exhaustion | 🟡 Low | Configure HikariCP properly |
| Sensitive data in logs | 🔴 High | Add log sanitization filter |

---

## Velocity Tracking

| Sprint | Planned Points | Completed Points | Velocity |
|--------|---------------|-----------------|---------|
| Sprint 1 | 35 | 33 | 94% |
| Sprint 2 | 55 | 50 | 91% |
| Sprint 3 | 65 | 60 | 92% |
| Sprint 4 | 65 | 63 | 97% |
| Sprint 5 | 40 | TBD | TBD |
| **Average** | | | **93.5%** |

---

*Báo cáo sprint được cập nhật sau mỗi Sprint Review meeting.*
