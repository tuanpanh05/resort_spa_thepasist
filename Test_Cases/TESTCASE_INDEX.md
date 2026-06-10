# TEST CASE INDEX - Ngũ Sơn Resort & Spa Management System

File này là bảng quản lý tổng hợp trạng thái test case của toàn bộ dự án.

Mỗi khi tạo thêm file `UCxx_*_TESTCASE.md`, phải cập nhật bảng này.

---

## Legend

| Status | Ý nghĩa |
| :--- | :--- |
| `Not Started` | Chưa viết test case |
| `Draft` | Đã viết nháp, chưa review |
| `Ready` | Đã review, sẵn sàng chạy |
| `Testing` | Đang chạy test |
| `Passed` | Tất cả test quan trọng đã pass |
| `Failed` | Có test fail |
| `Blocked` | Không thể test vì thiếu dependency/môi trường/data |

---

## UC Test Case Tracking

| UC ID | Module | Use Case Name | Test Case File | Owner | Status | Last Updated | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC01 | AUTH | Authentication & User Profile | `UC01_Authentication_TESTCASE.md` | TBD | Not Started | - | Register/login/profile/role |
| UC02 | BOOK | Room Browsing & Booking | `UC02_RoomBooking_TESTCASE.md` | TBD | Not Started | - | Room, package, booking state |
| UC03 | PAY | Payment & Invoice | `UC03_PaymentInvoice_TESTCASE.md` | TBD | Draft | 2026-06-10 | Có `Backend/docs/PAYMENT_TDD.md` làm nguồn tham chiếu |
| UC04 | SPA | Spa/Yoga/Therapy Scheduling | `UC04_SpaScheduling_TESTCASE.md` | TBD | Not Started | - | Specialist schedule/session |
| UC05 | FOOD | Dietary & Food Ordering | `UC05_DietaryFoodOrdering_TESTCASE.md` | TBD | Not Started | - | Allergy warning/menu/order |
| UC06 | STAFF | Receptionist Operation | `UC06_ReceptionistOperation_TESTCASE.md` | TBD | Not Started | - | Check-in/check-out/support |
| UC07 | ADMIN | Admin Management & Reports | `UC07_AdminManagement_TESTCASE.md` | TBD | Not Started | - | Master data/dashboard/report |

---

## Build/Test Command Checklist

| Area | Command | Required When |
| :--- | :--- | :--- |
| Frontend build | `npm run build` | Mọi thay đổi frontend |
| Frontend lint | `npm run lint` | Nếu project có cấu hình lint |
| Backend test | `mvn test` hoặc `./mvnw test` | Mọi thay đổi backend |
| Backend package | `mvn package` hoặc `./mvnw package` | Trước khi merge backend |
| API smoke test | Postman/curl/manual script | Mọi UC có API |
| DB verification | SQL query thủ công | Mọi UC ghi/sửa database |

---

## Minimum Test Coverage Per UC

| UC Type | Minimum Required Test Cases |
| :--- | :--- |
| UI-only UC | UI happy path, UI validation/error, responsive/basic navigation |
| API UC | API happy path, validation error, not found/conflict, unauthorized/forbidden |
| DB-write UC | API/service test, DB state verification, rollback/cleanup note |
| Payment UC | Happy path, failed payment, invalid signature, duplicate callback/idempotency |
| Role-based UC | Allowed role test, forbidden role test, unauthenticated test |
| Sensitive data UC | Masking test, encryption/no-plaintext test, no-log-leak test |
| State machine UC | Valid transition test, invalid transition test, duplicate action test |

---

## PR Gate

Trước khi merge PR, reviewer phải kiểm tra:

- [ ] UC có trong bảng index này.
- [ ] File test case tồn tại.
- [ ] Test case có trace tới requirement/source.
- [ ] Critical/High test đã chạy hoặc có lý do blocked hợp lệ.
- [ ] Build/test command đã được ghi trong file UC.
- [ ] Không có test marked `PASS` nếu không có evidence.
