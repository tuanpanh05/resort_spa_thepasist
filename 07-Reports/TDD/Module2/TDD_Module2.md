# TEST-DRIVEN DEVELOPMENT SPECIFICATION FOR MODULE 2

## Mẫu Đặc tả Kiểm thử Hướng Phát triển - Module 2: Retreat Package & Accommodation Booking

* **Document ID**: RESORT-M2-TDD-001
* **Version**: 1.0
* **Date**: 2026-06-15
* **Status**: Approved
* **Standard**: ISO/IEC/IEEE 29119-3:2021 — Software Testing Part 3: Test Documentation
* **Author**: Student 2 — Full-stack Developer
* **Reviewed by**: Tech Lead
* **DPO Sign-off**: Approved — 2026-06-15 — Data Protection Officer
* **Approved by**: Principal Architect
* **Classification**: Internal — Confidential

### References:
* `04_testing/SOFTWARE_TEST_PLAN.md` (FPT-EDU-STP-001 v2.0) — Master Test Plan
* `02-Requirement/DE_BAI_MODULE/Module_2.md` — Requirement Specification for Module 2
* `08-Document-References/TaiLieu/TDD_TEMPLATE_V1.md` — TDD Template
* Luật Cư trú Việt Nam 2020 — Báo cáo tạm trú đối với cơ sở lưu trú

> [!IMPORTANT]
> **Quy ước TDD**: Tài liệu này mô tả test cases TRƯỚC khi viết production code.
> Thứ tự bắt buộc: viết test (`.spec.ts`) &rarr; chạy &rarr; xác nhận FAIL 🔴 &rarr; implement &rarr; PASS 🟢 &rarr; refactor 🔵.
> Không mark test là ✅ nếu test runner chưa báo xanh.
> Test data dùng dữ liệu giả lập (`SYNTHETIC`). Không sử dụng thông tin cá nhân thật của khách hàng (PII).

---

## CHANGELOG

> **Policy 4.4 — Immutable History**: Không bao giờ xóa thông tin cũ.

| Ngày | Người thực hiện | Nội dung thay đổi |
| :--- | :--- | :--- |
| 2026-06-15 | Student 2 | Khởi tạo tài liệu TDD cho Module 2 |

---

## MỤC LỤC

1. [Thông tin Module](#1-thông-tin-module)
2. [Logic Issues Resolved](#2-logic-issues-resolved)
3. [Test Design Specification (TDS)](#3-test-design-specification-tds)
4. [Test Case Specification](#4-test-case-specification)
5. [Red-Green-Refactor Tracker](#5-red-green-refactor-tracker)
6. [Entry / Exit Criteria](#6-entry--exit-criteria)
7. [Rollback Plan](#7-rollback-plan)

---

## 1. Thông tin Module

| Field                     | Value　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　 |
| :--------------------------| :----------------------------------------------------------------------------|
| **Feature / Gap ID**      | GAP-M2-001　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　|
| **Module**                | Module 2: Retreat Package & Accommodation Booking　　　　　　　　　　　　　 |
| **Spec gốc**              | DE_BAI_MODULE/Module_2.md　　　　　　　　　　　　　　　　　　　　　　　　　 |
| **Priority**              | 🔴 P0　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　 |
| **Sprint**                | Sprint 2 (2026-06-15 &rarr; 2026-06-29)　　　　　　　　　　　　　　　　　　 |
| **Milestone**             | M3 Alpha — 2026-07-11　　　　　　　　　　　　　　　　　　　　　　　　　　　 |
| **Data Classification**   | Sensitive-PII (CCCD, Số Hộ chiếu, Lịch trình sức khỏe)　　　　　　　　　　　|
| **Compliance Scope**      | Luật Cư trú Việt Nam 2020　　　　　　　　　　　　　　　　　　　　　　　　　 |
| **Upstream Dependencies** | Core System / Auth Module　　　　　　　　　　　　　　　　　　　　　　　　　 |
| **Downstream Consumers**  | Module 3 (Spa Schedule), Module 4 (Dining/Restaurant), Module 5 (Check-out) |

---

## 2. Logic Issues Resolved

> [!IMPORTANT]
> **Bắt buộc điền trước khi viết test.**
> Liệt kê mọi sai lệch giữa spec thiết kế và schema/policy/codebase thực tế.

| # | Spec gốc (sai / thiếu) | Thực tế (schema / policy) | Fix áp dụng trong test |
| :--- | :--- | :--- | :--- |
| L1 | 30% Đặt cọc cố định vs Configurable deposit. | Yêu cầu nghiệp vụ mâu thuẫn giữa cố định 30% và cho phép quản lý cấu hình. | Hệ thống sử dụng tham số cấu hình trong Database với giá trị mặc định là 30%. Test sẽ xác thực cả trường hợp mặc định và trường hợp thay đổi tỷ lệ cọc. |
| L2 | Thiếu cấu trúc dữ liệu cho Luật Cư trú 2020. | Thiếu các trường: Quốc tịch, Số thị thực (Visa), Ngày nhập cảnh gần nhất, Ngày đăng ký tạm trú. | Bổ sung các trường trên vào bảng `GuestProfile` / `CheckInRecord` và tạo test cases để bắt buộc điền các thông tin này khi khách Check-In. |
| L3 | Thiếu cơ chế chuyển đổi trạng thái Villa khi dọn phòng. | Chưa rõ ai xác nhận phòng dọn xong để đưa trạng thái phòng từ "Vacant/Needs Cleaning" về "Available". | Thêm vai trò "Housekeeper" và "Receptionist" có quyền gọi API đổi trạng thái từ "Vacant/Needs Cleaning" sang "Available". |
| L4 | API Itinerary Timeline gây tắc nghẽn. | Lấy dữ liệu từ Spa (M3) và Dining (M4) chưa được đặc tả API hoặc cache. | Xây dựng Service Aggregator chuyên biệt. Viết test để xác nhận API trả về toàn bộ dữ liệu lịch trình kết hợp trong < 300ms. |

---

## 3. Test Design Specification (TDS)

### TDS-01 — Scope / Phạm vi
`Module 2` bao gồm các layer sau cần viết test cases:
```text
├── Domain (Business Rules BR-04, BR-05, BR-06, BR-12, BR-13, BR-30)
├── Services (RetreatPackageService, BookingService, CheckInService, VillaService, ItineraryService)
├── Controller (API Endpoints cho Search/Filter, Booking, Check-In, Villa Status, Itinerary)
└── Integration (PostgreSQL + Prisma integration testing)
```

### TDS-02 — Test Basis / Cơ sở Kiểm thử

| Source | Items Derived |
| :--- | :--- |
| `Module_2.md` UC06 | Lọc & Tìm kiếm các gói trị liệu theo mục tiêu sức khỏe (Weight Loss, Stress Relief...) |
| `Module_2.md` UC07 | Chọn gói trị liệu, Villa mong muốn, thực hiện thanh toán cọc trực tuyến. |
| `Module_2.md` UC08 | Theo dõi Arrivals, thực hiện Check-In, xác minh tiền cọc, thu thập CCCD/Hộ chiếu. |
| `Module_2.md` UC09 | Quản lý trạng thái Villa vật lý (Available, Occupied, Maintenance, Cleaning). |
| `Module_2.md` UC10 | Xem trục thời gian (Itinerary Timeline) đồng bộ từ Spa và Nhà hàng. |
| BR-04, BR-05, BR-06, BR-12, BR-13, BR-30 | Quy tắc nghiệp vụ bắt buộc của hệ thống. |
| Luật Cư trú 2020 | Bắt buộc khai báo thông tin tạm trú PII của khách. |

### TDS-03 — Test Conditions and Coverage Items

| Condition ID | Test Condition | Coverage Item | Test Cases |
| :--- | :--- | :--- | :--- |
| TC-COND-001 | Tìm kiếm/Lọc gói trị liệu đang hoạt động | `RetreatPackageService.filter()` | `RESORT-M2-TC-001` |
| TC-COND-002 | Đặt cọc 30% để chuyển đơn hàng sang Confirmed | `BookingService.confirmPayment()` | `RESORT-M2-TC-002` |
| TC-COND-003 | Ràng buộc phòng trống (Villa Availability) | `BookingService.createBooking()` | `RESORT-M2-TC-003` |
| TC-COND-004 | Check-in hợp lệ (Đã thanh toán cọc & đúng ngày) | `CheckInService.performCheckIn()` | `RESORT-M2-TC-004` |
| TC-COND-005 | Trạng thái Villa tự động đổi sang Occupied sau Check-in | `CheckInService.performCheckIn()` | `RESORT-M2-TC-005` |
| TC-COND-006 | Đồng bộ trục thời gian Itinerary trong kỳ lưu trú | `ItineraryService.getTimeline()` | `RESORT-M2-TC-006` |

### TDS-04 — Test Techniques / Kỹ thuật Kiểm thử

| Technique (ISO 29119-4) | Applied To | Rationale |
| :--- | :--- | :--- |
| Equivalence Partitioning | Booking Dates & Check-In Validation | Phân loại ngày đặt trước/sau, trạng thái phòng để kiểm thử đầu vào. |
| Boundary Value Analysis | Deposit calculation (30% threshold) | Xác thực độ chính xác của số tiền cọc (bằng, lớn hơn hoặc nhỏ hơn 30%). |
| State Transition Testing | Villa States & Booking States | Kiểm tra chu trình chuyển đổi trạng thái của Booking và Villa vật lý. |
| Error Guessing | PII leakage checking & Unauthenticated Access | Tìm lỗi bảo mật, leak dữ liệu CCCD/Hộ chiếu trong log. |

### TDS-05 — Test Data Requirements

| Fixture ID | Type | Value / Logic | Mục đích |
| :--- | :--- | :--- | :--- |
| FX-001 | Retreat Package | `{ id: "pkg-001", name: "Yoga Detox", status: "ACTIVE", healthGoal: "YOGA" }` | Happy path cho Filter |
| FX-002 | Retreat Package | `{ id: "pkg-002", name: "Weight Loss Clinic", status: "INACTIVE", healthGoal: "WEIGHT_LOSS" }` | Test không hiển thị package Inactive |
| FX-003 | Config Deposit | `{ key: "deposit_ratio", value: "0.30" }` | Cấu hình tỷ lệ cọc |
| FX-004 | Villa Physical | `{ id: "villa-101", roomNumber: "V101", status: "AVAILABLE" }` | Booking & Check-in target |
| FX-005 | Passport PII | `{ passportNo: "B1234567", nationality: "Vietnamese", entryDate: "2026-06-15" }` | Báo cáo cư trú tạm trú |

---

## 4. Test Case Specification

### `RESORT-M2-TC-001` — Lọc gói trị liệu theo mục tiêu sức khỏe hoạt động

* **Severity**: HIGH
* **Feature Under Test**: `RetreatPackageService.filterPackages()`
* **Test File**: `backend/src/test/java/fu/se/smms/service/impl/MasterDataServiceImplTest.java`
* **TDD Phase**: 🟡 Written-failing
* **Condition Ref**: TC-COND-001

#### Preconditions:
* Database có chứa gói `FX-001` (ACTIVE) và `FX-002` (INACTIVE).

#### Test Steps:
1. Gọi hàm `filterPackages(healthGoal: "YOGA")`
2. Gọi hàm `filterPackages(healthGoal: "WEIGHT_LOSS")`

#### Expected Result (PASS):
* Lần 1: Trả về danh sách chứa gói `Yoga Detox` (FX-001).
* Lần 2: Trả về danh sách trống vì gói `Weight Loss Clinic` (FX-002) đang `INACTIVE` (Tuân thủ BR-04).

#### Current Status: 🟡 Written-failing

---

### `RESORT-M2-TC-002` — Tính toán và xác thực tiền đặt cọc 30% để xác nhận đơn hàng

* **Severity**: CRITICAL
* **Feature Under Test**: `BookingService.processDepositPayment()`
* **Test File**: `backend/src/test/java/fu/se/smms/service/impl/BookingServiceImplTest.java`
* **TDD Phase**: 🟡 Written-failing
* **Condition Ref**: TC-COND-002

#### Preconditions:
* Booking đang ở trạng thái `PENDING_DEPOSIT` với tổng tiền 10,000,000 VND.
* Cấu hình tỷ lệ đặt cọc hệ thống là 30%.

#### Test Steps:
1. Gửi yêu cầu xác nhận thanh toán cọc với số tiền 3,000,000 VND.
2. Gửi yêu cầu xác nhận thanh toán cọc với số tiền 2,900,000 VND.

#### Expected Result (PASS):
* Giao dịch 1: Thành công, trạng thái Booking chuyển sang `CONFIRMED` (Tuân thủ BR-05).
* Giao dịch 2: Báo lỗi không đủ tiền đặt cọc tối thiểu (`BOOKING-002`).

#### Current Status: 🟡 Written-failing

---

### `RESORT-M2-TC-003` — Tránh trùng lịch đặt phòng Villa vật lý

* **Severity**: CRITICAL
* **Feature Under Test**: `BookingService.createBooking()`
* **Test File**: `backend/src/test/java/fu/se/smms/service/impl/BookingServiceImplTest.java`
* **TDD Phase**: 🟡 Written-failing
* **Condition Ref**: TC-COND-003

#### Preconditions:
* Villa `FX-004` đã có booking được xác nhận từ ngày `2026-06-20` đến `2026-06-25`.

#### Test Steps:
1. Gửi yêu cầu đặt Villa `FX-004` từ ngày `2026-06-22` đến `2026-06-24` (Trùng lặp).
2. Gửi yêu cầu đặt Villa `FX-004` từ ngày `2026-06-26` đến `2026-06-28` (Không trùng lặp).

#### Expected Result (PASS):
* Yêu cầu 1: Thất bại với mã lỗi `BOOKING-003` (Villa not available).
* Yêu cầu 2: Thành công.

#### Current Status: 🟡 Written-failing

---

### `RESORT-M2-TC-004` — Yêu cầu thông tin định danh tạm trú khi Check-In

* **Severity**: HIGH
* **Feature Under Test**: `CheckInService.performCheckIn()`
* **Test File**: `backend/src/test/java/fu/se/smms/service/impl/CheckInServiceImplTest.java`
* **TDD Phase**: 🟡 Written-failing
* **Condition Ref**: TC-COND-004
* **Legal**: Luật Cư trú Việt Nam 2020

#### Preconditions:
* Booking ở trạng thái `CONFIRMED`.

#### Test Steps:
1. Thực hiện Check-in nhưng thiếu trường `passportNo` / `identityCard`.
2. Thực hiện Check-in đầy đủ thông tin `passportNo`, `nationality`, `entryDate`.

#### Expected Result (PASS):
* Lần 1: Thất bại với lỗi `CHECKIN-002` (Missing Identity Data).
* Lần 2: Thành công, thông tin PII được lưu trữ an toàn (mã hóa).

#### Current Status: 🟡 Written-failing

---

### `RESORT-M2-TC-005` — Tự động cập nhật trạng thái Villa sang OCCUPIED khi Check-in thành công

* **Severity**: HIGH
* **Feature Under Test**: `CheckInService.performCheckIn()`
* **Test File**: `backend/src/test/java/fu/se/smms/service/impl/CheckInServiceImplTest.java`
* **TDD Phase**: 🟡 Written-failing
* **Condition Ref**: TC-COND-005

#### Preconditions:
* Booking đã xác nhận, Villa vật lý đang ở trạng thái `AVAILABLE`.

#### Test Steps:
1. Tiến hành thủ tục Check-in thành công.
2. Kiểm tra trạng thái của Villa trong database.

#### Expected Result (PASS):
* Trạng thái Villa tự động cập nhật từ `AVAILABLE` sang `OCCUPIED` (Tuân thủ BR-13).

#### Current Status: 🟡 Written-failing

---

### `RESORT-M2-TC-006` — Ràng buộc trục thời gian Itinerary không vượt quá kỳ lưu trú

* **Severity**: HIGH
* **Feature Under Test**: `ItineraryService.scheduleActivity()`
* **Test File**: `backend/src/test/java/fu/se/smms/service/impl/ItineraryServiceImplTest.java`
* **TDD Phase**: 🟡 Written-failing
* **Condition Ref**: TC-COND-006

#### Preconditions:
* Booking lưu trú từ ngày `2026-06-15` đến `2026-06-20`.

#### Test Steps:
1. Thêm lịch trình trị liệu Yoga vào ngày `2026-06-18` (Trong khoảng lưu trú).
2. Thêm lịch trình trị liệu Yoga vào ngày `2026-06-21` (Ngoài khoảng lưu trú).

#### Expected Result (PASS):
* Lần 1: Thành công.
* Lần 2: Bị từ chối với lỗi `ITINERARY-001` (Activity date out of stay range, Tuân thủ BR-30).

#### Current Status: 🟡 Written-failing

---

## SECURITY TEST CASES

### `RESORT-M2-SECU-001` — Chặn SQL Injection khi tìm kiếm Gói trị liệu

* **Severity**: CRITICAL
* **OWASP**: A03:2021 — Injection
* **CWE**: CWE-89 — SQL Injection
* **Test File**: `backend/src/test/java/fu/se/smms/controller/MasterDataControllerTest.java`
* **TDD Phase**: 🟡 Written-failing

#### Preconditions:
* Gói trị liệu tồn tại trong database.

#### Test Steps:
1. Gọi API tìm kiếm với chuỗi query độc hại: `?keyword=Yoga' OR '1'='1`
2. Gọi API tìm kiếm với chuỗi query hợp lệ: `?keyword=Yoga`

#### Expected Result (PASS):
* Không có lỗi cú pháp SQL bị lộ hoặc trả về toàn bộ database. Kết quả trả về rỗng hoặc lọc đúng từ khóa "Yoga' OR '1'='1".

#### Current Status: 🟡 Written-failing

---

## INTEGRATION TEST CASES

### `RESORT-M2-INT-001` — Quy trình Đặt phòng & Check-in Toàn diện

* **Severity**: HIGH
* **Feature Under Test**: Luồng nghiệp vụ từ chọn gói đến nhận phòng
* **Test File**: `backend/src/test/java/fu/se/smms/controller/Module2IntegrationTest.java`
* **TDD Phase**: 🟡 Written-failing

#### Preconditions:
* Cơ sở dữ liệu Postgres Container đang hoạt động.
* Đã cấu hình các Villa vật lý sẵn sàng.

#### Test Steps:
1. Khách hàng tìm gói Yoga & Villa trống.
2. Tạo booking, thanh toán cọc trực tuyến 30%.
3. Lễ tân thực hiện Check-In khi khách đến, ghi nhận thông tin CCCD.
4. Xác minh trạng thái phòng chuyển sang OCCUPIED.

#### Expected Result (PASS):
* Booking chuyển từ `PENDING` -> `CONFIRMED` -> `CHECKED_IN`.
* Villa chuyển sang `OCCUPIED`.
* Bản ghi tạm trú được lưu thành công.

---

## 5. Red-Green-Refactor Tracker

| TC ID | Test File | 🔴 RED confirmed | 🟢 GREEN (commit) | 🔵 REFACTOR note |
| :--- | :--- | :---: | :--- | :--- |
| `RESORT-M2-TC-001` | `RetreatPackageServiceTest.java` | [ ] | — | — |
| `RESORT-M2-TC-002` | `BookingServiceTest.java` | [ ] | — | — |
| `RESORT-M2-TC-003` | `BookingServiceTest.java` | [ ] | — | — |
| `RESORT-M2-TC-004` | `CheckInServiceTest.java` | [ ] | — | — |
| `RESORT-M2-TC-005` | `CheckInServiceTest.java` | [ ] | — | — |
| `RESORT-M2-TC-006` | `ItineraryServiceTest.java` | [ ] | — | — |

---

## 6. Entry / Exit Criteria

### Entry Criteria
- [x] Tài liệu nghiệp vụ `Module_2.md` đã được thông qua.
- [ ] Schema database PostgreSQL/Prisma cho thực thể Retreat Package, Villa, Booking được duyệt.
- [ ] Thiết lập môi trường chạy thử nghiệm unit test sẵn sàng.

### Exit Criteria (DoD)
- [ ] Toàn bộ unit test và integration test của Module 2 chạy thành công (100% Green).
- [ ] Test coverage cho code logic mới đạt tối thiểu 80%.
- [ ] Không rò rỉ thông tin cá nhân khách hàng (CCCD, Hộ chiếu) trong file logs.
- [ ] Ứng dụng hoạt động mượt mà với API phản hồi < 300ms đối với luồng Itinerary Timeline.

---

## 7. Rollback Plan

```bash
# Lệnh Rollback Code
git checkout -- backend/src/main/java/fu/se/smms/...
git checkout -- backend/src/test/java/fu/se/smms/...

# Revert database migration
npx prisma migrate resolve --rolled-back [migration_id]
```
