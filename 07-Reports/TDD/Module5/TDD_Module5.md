# TEST-DRIVEN DEVELOPMENT SPECIFICATION — MODULE 5

## Đặc tả Kiểm thử Hướng Phát triển: Consolidated Checkout & Analytics

* **Document ID**: SMMS-PAY-TDD-005
* **Version**: 1.0
* **Date**: 2026-06-26
* **Status**: Approved
* **Standard**: ISO/IEC/IEEE 29119-3:2021 aligned
* **Author**: Student 5 — Full-stack Engineer
* **Reviewed by**: Tech Lead — Approved
* **DPO Sign-off**: Approved — 2026-06-26 — DPO Team
* **Approved by**: Principal Architect
* **Classification**: Internal — Confidential

---

### References:

* `04_testing/SOFTWARE_TEST_PLAN.md` — Master Test Plan
* `02-Requirement/DE_BAI_MODULE/Module_5.md` — Requirement specifications for Module 5
* `07-Reports/EDS/Module5/EDS_Module5.md` — Technical Design Specification for Module 5
* AHLEI (Uniform System of Accounts for the Lodging Industry)

> [!IMPORTANT]
> **Quy ước TDD**: Tài liệu này mô tả test cases TRƯỚC khi viết/chạy production code.
> Chạy test bằng lệnh Maven: `mvn test` và đảm bảo kết quả xanh.
> Test data dùng dữ liệu giả lập (`SYNTHETIC`), không dùng PII thực tế của khách hàng.

---

## CHANGELOG

> **Policy 4.4 — Immutable History**: Không bao giờ xóa thông tin cũ.

| Ngày      | Người thực hiện | Nội dung thay đổi                                                                                                                      |
| :--------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-26 | Student 5           | Khởi tạo tài liệu — Thiết kế TDD spec cho Quy trình dồn hóa đơn, VNPay Integration, Check-out constraint, và Báo cáo Doanh thu |

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
| **Feature / Gap ID**            | GAP-PAY-005                                                                                              |
| **Module**                      | Consolidated Checkout & Analytics                                                                        |
| **Spec gốc**                    | [EDS_Module5.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/07-Reports/EDS/Module5/EDS_Module5.md) |
| **Priority**                    | 🔴 P0 (Financial Calculation accuracy, Audit Trail preservation)                                         |
| **Sprint**                      | S2                                                                                                       |
| **Milestone**                   | M3 Alpha — 2026-06-26                                                                                    |
| **Data Classification**         | Financial Data / PII                                                                                     |
| **Compliance Scope**            | AHLEI Uniform System of Accounts                                                                         |
| **Upstream Dependencies**       | Module 2 (Room Booking), Module 3 (Spa Booking), Module 4 (F&B)                                          |
| **Downstream Consumers**        | Financial Auditing / Manager Analytics                                                                   |

---

## 2. Logic Issues Resolved

| #      | Spec gốc (sai / thiếu)                                                            | Thực tế (schema / policy)                                                                                   | Fix áp dụng trong test / code                                                                                                                  |
| :----- | :-------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **L1** | Thiếu thiết kế kiểm soát trạng thái đơn hàng khi check-out (BR-15).                | Lễ tân không được phép check-out nếu còn đơn hàng Spa hoặc F&B chưa hoàn thành.                             | Test case `PAY-TC-001` kiểm tra API validate check-out trả về 409 Conflict khi phát hiện đơn hàng Spa chưa completed.                          |
| **L2** | VNPay callback mã hóa khoảng trắng sử dụng dấu cộng `+` gây lỗi xác thực chữ ký.  | VNPay yêu cầu mã hóa khoảng trắng thành `%20` thay vì `+` để chuỗi Secure Hash khớp 100%.                   | Test case `PAY-TC-003` xác thực phương thức mã hóa URL encode chuyển đổi khoảng trắng thành `%20` chính xác.                                   |
| **L3** | Thiếu cơ chế ghi nhận nhật ký giao dịch không thể sửa đổi (BR-26).                 | Mọi giao dịch thành công bắt buộc phải lưu bản ghi log sang bảng audit trail riêng biệt.                    | Test case `PAY-TC-INT-003` kiểm tra sau khi gọi cash-payment, bản ghi log giao dịch được thêm vào DB thành công và không thể sửa đổi/xóa.      |
| **L4** | Khách chưa check-out hoặc gửi đánh giá lần thứ hai vẫn được hệ thống chấp nhận.   | BR-18 & BR-19: Chỉ cho phép gửi đánh giá 1 lần duy nhất cho các đặt phòng đã hoàn thành checkout.           | Test case `PAY-TC-005` kiểm tra gửi feedback lần 2 trả về 409 Conflict và gửi feedback khi chưa checkout trả về 400 Bad Request.               |

---

## 3. Test Design Specification (TDS)

### TDS-01 — Scope / Phạm vi
`Consolidated Checkout & Analytics` bao gồm các layer được kiểm thử:
* **Domain** (Thực thể `Invoice` tự động tính tổng hợp chi phí, `PaymentTransactionLog` lưu vết giao dịch).
* **Application / Services** (Tính toán số dư nợ còn lại 70%, khấu trừ cọc 30%, bóc tách doanh thu).
* **Controller** (Kiểm tra request validation, status codes, callback VNPay thông qua MockMvc).
* **Integration** (Kiểm tra luồng nghiệp vụ liên thông từ đặt phòng đến check-out thực tế trên DB).

---

## 4. Test Case Specification

### `PAY-TC-001` — Chặn Checkout khi còn đơn dịch vụ Spa chưa hoàn tất (Consolidated Billing Constraint)
* **Pre-conditions**: Guest A có booking phòng nghỉ, kèm theo 1 buổi trị liệu Spa trạng thái `CONFIRMED` (chưa làm).
* **Input**: Lễ tân gọi API `GET /v1/invoices/booking/{bookingId}/validate-checkout`.
* **Expected Result**: Ném ra ngoại lệ `BusinessException` với HTTP Status `409 Conflict`.

### `PAY-TC-002` — Tự động cập nhật trạng thái phòng thành DIRTY khi checkout thành công (BR-14)
* **Pre-conditions**: Hóa đơn trạng thái `PAID` và phòng đang ở trạng thái `OCCUPIED`.
* **Input**: Lễ tân gọi API `POST /invoices/{id}/perform-checkout`.
* **Expected Result**: Cập nhật trạng thái Booking thành `CHECKED_OUT`, cập nhật trạng thái phòng thành `DIRTY`.

### `PAY-TC-003` — Sửa lỗi mã hóa tham số ký cổng thanh toán VNPay
* **Pre-conditions**: Khởi chạy Service tạo URL thanh toán.
* **Input**: Chuỗi tham số chứa khoảng trắng (Ví dụ: "Thanh toan hoa don 1").
* **Expected Result**: Ký tự khoảng trắng trong chuỗi query parameters phải được encode thành `%20` thay vì `+` để đảm bảo khớp chữ ký sha256 với hệ thống VNPay.

---

## 5. Security Test Cases

### `PAY-TC-SEC-001` — Chặn sửa đổi/xóa Transaction Log (BR-26 Audit Trail Integrity)
* **Input**: Gửi request DELETE/PUT giả lập vào endpoint hoặc gọi trực tiếp qua service layer để xóa bản ghi trong `PaymentTransactionLog`.
* **Expected Result**: Không có phương thức cập nhật/xóa được phơi bày ra lớp Service. Bản ghi giao dịch là bất biến (Immutable).

---

## 6. Integration Test Cases

### `PAY-TC-INT-001` — Bóc tách doanh thu báo cáo chính xác theo nguồn thu (BR-27)
* **Pre-conditions**: Booking có Invoice gồm: Tiền phòng = 5.000.000 VNĐ, Tiền Spa = 1.000.000 VNĐ, Tiền F&B = 500.000 VNĐ. Đã thanh toán.
* **Input**: Manager gọi Dashboard doanh thu.
* **Expected Result**: Dữ liệu phản hồi bóc tách chính xác: Room Revenue = 5.000.000 VNĐ, Spa Revenue = 1.000.000 VNĐ, F&B Revenue = 500.000 VNĐ.

---

## 7. Red-Green-Refactor Tracker

| Test Case ID | Trạng thái ban đầu | Trạng thái hiện tại | Ghi chú |
| :--- | :---: | :---: | :--- |
| `PAY-TC-001` | 🔴 FAIL | 🟢 PASS | Đã hoàn thiện logic khóa checkout. |
| `PAY-TC-002` | 🔴 FAIL | 🟢 PASS | Phòng tự động chuyển sang DIRTY thành công. |
| `PAY-TC-003` | 🔴 FAIL | 🟢 PASS | Đã sửa lỗi encode dấu cách thành %20. |
| `PAY-TC-INT-001` | 🔴 FAIL | 🟢 PASS | Doanh thu bóc tách chính xác tuyệt đối. |

---

## 8. Entry / Exit Criteria

* **Entry Criteria**: Database schema đã khởi tạo bảng log giao dịch.
* **Exit Criteria**: 100% test cases của InvoiceService và FeedbackService đều PASS.

---

## 9. Rollback Plan

* Nếu cổng thanh toán VNPay gặp sự cố kéo dài, hệ thống hỗ trợ lễ tân mark cash payment bằng tiền mặt để giải phóng phòng kịp thời cho khách hàng.
