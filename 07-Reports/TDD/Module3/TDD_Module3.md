# TEST-DRIVEN DEVELOPMENT SPECIFICATION — MODULE 3

## Đặc tả Kiểm thử Hướng Phát triển: Spa & Therapy Scheduling Engine

* **Document ID**: SMMS-SPA-TDD-003
* **Version**: 1.0
* **Date**: 2026-06-26
* **Status**: Approved
* **Standard**: ISO/IEC/IEEE 29119-3:2021 aligned
* **Author**: Student 3 — Full-stack Engineer
* **Reviewed by**: Tech Lead — Approved
* **DPO Sign-off**: Approved — 2026-06-26 — DPO Team
* **Approved by**: Principal Architect
* **Classification**: Internal — Confidential

---

### References:

* `04_testing/SOFTWARE_TEST_PLAN.md` — Master Test Plan
* `02-Requirement/DE_BAI_MODULE/Module_3.md` — Requirement specifications for Module 3
* `07-Reports/EDS/Module3/EDS_Module3.md` — Technical Design Specification for Module 3
* Decree 13/2023/NĐ-CP (Legal basis for sensitive PII/health data handling)

> [!IMPORTANT]
> **Quy ước TDD**: Tài liệu này mô tả test cases TRƯỚC khi viết/chạy production code.
> Chạy test bằng lệnh Maven: `mvn test` và đảm bảo kết quả xanh.
> Test data dùng dữ liệu giả lập (`SYNTHETIC`), không dùng PII thực tế của khách hàng.

---

## CHANGELOG

> **Policy 4.4 — Immutable History**: Không bao giờ xóa thông tin cũ.

| Ngày      | Người thực hiện | Nội dung thay đổi                                                                                                                      |
| :--------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-26 | Student 3           | Khởi tạo tài liệu — Thiết kế TDD spec cho Đặt Spa, Auto-match, Chặn đặt trùng lịch, và Bảo vệ quyền riêng tư sức khỏe |

---

## MỤC LỤC

1. [Thông tin Module](#1-thông-tin-module)
2. [Logic Issues Resolved](#2-logic-issues-resolved)
3. [Test Design Specification (TDS)](#3-test-design-specification-tds)
4. [Test Case Specification](#4-test-case-specification)
5. [Security Test Cases](#security-test-cases)
6. [Integration Test Cases](#integration-test-cases)
7. [Red-Green-Refactor Tracker](#5-red-green-refactor-tracker)
8. [Entry / Exit Criteria](#6-entry--exit-criteria)
9. [Rollback Plan](#7-rollback-plan)

---

## 1. Thông tin Module

| Field                           | Value                                                                                                    |
| :------------------------------ | :------------------------------------------------------------------------------------------------------- |
| **Feature / Gap ID**            | GAP-SPA-003                                                                                              |
| **Module**                      | Spa & Therapy Scheduling Engine                                                                          |
| **Spec gốc**                    | [EDS_Module3.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/07-Reports/EDS/Module3/EDS_Module3.md) |
| **Priority**                    | 🔴 P0 (Core Scheduling and PII Data Minimization)                                                        |
| **Sprint**                      | S2                                                                                                       |
| **Milestone**                   | M3 Alpha — 2026-06-26                                                                                    |
| **Data Classification**         | Sensitive-PII / PII                                                                                      |
| **Compliance Scope**            | Nghị định 13/2023/NĐ-CP, AHLEI Folio Standard                                                            |
| **Upstream Dependencies**       | Module 1 (Auth, Consent & Medical Profile)                                                               |
| **Downstream Consumers**        | Module 5 (Folio Billing & Checkout)                                                                      |

---

## 2. Logic Issues Resolved

| #      | Spec gốc (sai / thiếu)                                                            | Thực tế (schema / policy)                                                                                   | Fix áp dụng trong test / code                                                                                                                  |
| :----- | :-------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **L1** | Thiếu ràng buộc đồng thuận sức khỏe (Explicit Consent) khi đặt Spa.                | Checkbox consent ở Module 1 phải tích chọn và lưu DB thì mới được đặt Spa.                                  | Test case `SPA-TC-001` kiểm tra ném ngoại lệ nếu guest chưa đồng thuận sức khỏe.                                                               |
| **L2** | Chỉ check trùng lịch ở tầng Java thô, dễ bị race condition khi nhiều người book.   | Yêu cầu chặn đặt trùng tuyệt đối, sử dụng Pessimistic Lock trên DB.                                         | Test case `SPA-TC-005` thực hiện kịch bản đa luồng đồng thời để xác minh khóa DB hoạt động tốt.                                                |
| **L3** | Kỹ thuật viên xem lịch làm việc nhận được toàn bộ Object User bao gồm cả PII.       | Tối thiểu hóa dữ liệu: Ẩn thông tin bếp ăn (allergies), email, passport. Chỉ cung cấp physical condition.   | Test case `SPA-TC-003` kiểm tra API response của therapist schedule chỉ chứa `physicalCondition` và đã được ẩn các trường PII khác.           |
| **L4** | Đặt Spa ngoài gói không cập nhật hóa đơn.                                         | Mọi đặt lịch ngoài gói (Extra Spa Service) phải tự động đẩy chi phí vào hóa đơn tổng (Guest Folio).         | Test case `SPA-TC-INT-002` xác thực sau khi book spa thành công thì subtotal của Invoice liên quan được cập nhật tương ứng.                     |

---

## 3. Test Design Specification (TDS)

### TDS-01 — Scope / Phạm vi
`Spa & Therapy Scheduling Engine` bao gồm các layer được kiểm thử:
* **Domain** (Thực thể `SpaBooking` liên kết với `Users`, `TreatmentRoom`, `SpaService`).
* **Application / Services** (Được kiểm tra thông qua mock repositories, email services và calendar integrations).
* **Controller** (Kiểm tra request validation, status codes, RBAC filters thông qua MockMvc).
* **Integration** (Kiểm tra tích hợp DB thực tế và cấn trừ số lượng buổi trong Retreat Package).

---

## 4. Test Case Specification

### `SPA-TC-001` — Đặt lịch khi chưa đồng ý cam kết điều khoản sức khỏe (BR-07)
* **Pre-conditions**: Khách hàng `guest_id = 3` có Medical Profile nhưng chưa tích chọn `explicitConsentSigned = false`.
* **Input**: Request book Spa service.
* **Expected Result**: Ném ra `BusinessException` với mã lỗi `SPA-400` và HTTP Status `400 Bad Request`.

### `SPA-TC-002` — Tự động ghép lịch thông minh (Auto-match) theo chuyên môn (UC12)
* **Pre-conditions**: Therapist A có specialty là `YOGA` rảnh, Therapist B có specialty là `SPA` rảnh.
* **Input**: Ghép lịch cho dịch vụ có category là `SPA`.
* **Expected Result**: Hệ thống trả về đề xuất gán Therapist B (cùng chuyên môn `SPA`), không gán Therapist A.

### `SPA-TC-003` — Tối thiểu hóa thông tin PII nhạy cảm cho Therapist (UC13 / Data Minimization)
* **Pre-conditions**: Đặt lịch Spa thành công cho Guest C. Guest C có thông tin dị ứng ăn uống (`foodAllergies`) và bệnh lý (`physicalCondition`).
* **Input**: Kỹ thuật viên gọi API lấy lịch làm việc.
* **Expected Result**: DTO trả về chứa `physicalCondition` nhưng các trường dị ứng ăn uống, passport, số điện thoại đều bằng null hoặc không hiển thị.

---

## 5. Security Test Cases

### `SPA-TC-SEC-001` — Phân quyền truy cập lịch làm việc của Kỹ thuật viên (RBAC Guard)
* **Input**: Guest gọi API `GET /v1/spa-bookings/therapist-schedule` bằng token của mình.
* **Expected Result**: HTTP Status `403 Forbidden`. Chỉ vai trò chuyên gia (`THERAPIST`, `YOGA`, `PHYSIO`) hoặc Manager được phép truy cập.

---

## 6. Integration Test Cases

### `SPA-TC-INT-001` — Tự động cấn trừ số buổi Spa trong Retreat Package (BR-30)
* **Pre-conditions**: Khách hàng đặt gói `Royal Spa Retreat` được miễn phí tối đa 2 buổi Spa. Khách đã đặt 2 buổi.
* **Input**: Khách gửi yêu cầu đặt buổi thứ 3 theo gói (`isPackageIncluded = true`).
* **Expected Result**: Hệ thống ném lỗi `SPA-400` báo đã sử dụng hết số lượng buổi Spa trong gói.

---

## 7. Red-Green-Refactor Tracker

| Test Case ID | Trạng thái ban đầu | Trạng thái hiện tại | Ghi chú |
| :--- | :---: | :---: | :--- |
| `SPA-TC-001` | 🔴 FAIL | 🟢 PASS | Đã hoàn thiện logic check consent. |
| `SPA-TC-002` | 🔴 FAIL | 🟢 PASS | Ghép chuyên gia theo chuyên môn thành công. |
| `SPA-TC-003` | 🔴 FAIL | 🟢 PASS | Data minimization đạt tiêu chuẩn NĐ 13. |
| `SPA-TC-INT-001` | 🔴 FAIL | 🟢 PASS | Giới hạn số buổi trong gói hoạt động chính xác. |

---

## 8. Entry / Exit Criteria

* **Entry Criteria**: Database schema đã thêm cột `specialty` cho bảng `users`.
* **Exit Criteria**: 100% test cases của SpaBookingService chạy thành công, không có lỗi Race Condition khi kiểm thử đồng thời.

---

## 9. Rollback Plan

* Nếu xảy ra lỗi không tương thích phiên bản API Google Calendar, vô hiệu hóa cấu hình `google_calendar_sync_enabled` trong Database về `0` để tiếp tục chạy ngoại tuyến (Offline Mode) mà không ảnh hưởng tới tiến trình đặt phòng lưu trú chính của khách hàng.
