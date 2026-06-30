# TEST-DRIVEN DEVELOPMENT SPECIFICATION - REVENUE FORECASTING

## Đặc tả Kiểm thử Hướng Phát triển Tính năng Dự báo Doanh thu AI

* **Document ID**: SMMS-REVENUE-TDD-001
* **Version**: 1.0
* **Date**: 2026-06-28
* **Status**: Approved
* **Standard**: ISO/IEC/IEEE 29119-3:2021 — Software Testing
* **Author**: Antigravity — AI Coding Assistant
* **Reviewed by**: Tech Lead
* **Approved by**: Principal Architect
* **Classification**: Internal — Confidential

### References:
* `05-Development/backend/docs/FORECAST_EDS.md` — Engineering Design Specification
* `05-Development/backend/src/main/java/fu/se/smms/service/impl/RevenueServiceImpl.java` — Implementation class

---

## CHANGELOG

| Ngày | Người thực hiện | Nội dung thay đổi |
| :--- | :--- | :--- |
| 2026-06-28 | Antigravity | Khởi tạo tài liệu đặc tả kiểm thử TDD cho tính năng dự báo doanh thu |

---

## MỤC LỤC

1. [Thông tin Module](#1-thông-tin-module)
2. [Logic Issues Resolved](#2-logic-issues-resolved)
3. [Test Design Specification (TDS)](#3-test-design-specification-tds)
4. [Test Case Specification](#4-test-case-specification)
5. [Entry / Exit Criteria](#5-entry--exit-criteria)

---

## 1. Thông tin Module

| Field | Value |
| :--- | :--- |
| **Feature / Gap ID** | GAP-REVENUE-AI |
| **Module** | Revenue Management (Bounded Context: Operations) |
| **Spec gốc** | [SMMS-REVENUE-IMP-001] |
| **Priority** | 🟠 P1 |
| **Sprint** | Sprint 6 |
| **Data Classification** | Internal |
| **Upstream Dependencies** | InvoiceRepository, RoomRepository |

---

## 2. Logic Issues Resolved

Không có sự sai lệch giữa thiết kế nghiệp vụ và cơ sở dữ liệu. Thiết kế kế thừa trực tiếp cơ cấu doanh thu từ bảng `invoice` có sẵn.

---

## 3. Test Design Specification (TDS)

### TDS-01 — Scope / Phạm vi
Phạm vi kiểm thử bao phủ toàn bộ logic tính toán dự báo doanh thu (bao gồm Hồi quy tuyến tính offline, cơ chế fallback tự động khi Gemini API thất bại, cơ chế khởi tạo dữ liệu giả lập ban đầu) và các lớp kiểm soát bảo mật (Authorization Guard) tại REST API Controller.

### TDS-02 — Test Basis / Cơ sở Kiểm thử

| Source | Items Derived |
| :--- | :--- |
| `FORECAST_EDS.md` §8 | API endpoint `GET /api/revenue/forecast` contract |
| `FORECAST_EDS.md` §3 | Cơ chế Hybrid Fallback (ADR-REV-001) |

### TDS-03 — Test Conditions and Coverage Items

| Condition ID | Test Condition | Coverage Item | Test Cases |
| :--- | :--- | :--- | :--- |
| REV-COND-001 | Tính toán dự báo chính xác theo Hồi quy tuyến tính (Offline) | `RevenueServiceImpl.getRevenueForecast` | `REV-FC-TC-01` |
| REV-COND-002 | Khởi tạo dữ liệu giả lập ban đầu khi database trống | `RevenueServiceImpl.getRevenueForecast` | `REV-FC-TC-02` |
| REV-COND-003 | Fallback tự động khi Gemini API gặp sự cố hoặc sai định dạng JSON | `RevenueServiceImpl.getRevenueForecast` | `REV-FC-TC-03` |
| REV-COND-004 | Kiểm soát quyền truy cập API theo Role (MANAGER được phép, các role khác bị cấm) | `RevenueController.getForecast` | `REV-FC-TC-04` |

---

## 4. Test Case Specification

### `REV-FC-TC-01` — Tính toán dự báo doanh thu tuyến tính thành công (Offline Mode)

* **Severity**: HIGH
* **Feature Under Test**: `RevenueServiceImpl.getRevenueForecast()`
* **Test File**: `fu.se.smms.service.impl.RevenueForecastServiceImplTest.java`
* **TDD Phase**: 🟢 PASS
* **Condition Ref**: REV-COND-001

#### Preconditions:
* Không cấu hình biến `GEMINI_API_KEY` (hoặc giả lập trả về rỗng).
* Database chứa dữ liệu doanh thu thực tế của năm trước và năm nay.

#### Test Steps:
1. Mock `invoiceRepository.findMonthlyRevenueBreakdown` trả về dữ liệu doanh thu tăng trưởng đều đặn của 12 tháng năm ngoái và các tháng năm nay.
2. Gọi hàm `service.getRevenueForecast(3)` để yêu cầu dự báo 3 tháng tới.
3. Kiểm tra danh sách dự báo trả về.

#### Expected Result (PASS):
* Phản hồi trả về có độ dài bằng 3.
* Thuộc tính `methodUsed` chứa chuỗi `"Linear Regression (Offline)"`.
* Các tháng tương lai được dán nhãn đúng thứ tự (ví dụ: T7, T8, T9 của năm hiện tại).
* Doanh thu dự báo không âm và khớp với xu hướng tăng trưởng tuyến tính đã mock.

---

### `REV-FC-TC-02` — Tự động khởi tạo dữ liệu cơ sở mẫu khi database rỗng

* **Severity**: MEDIUM
* **Feature Under Test**: `RevenueServiceImpl.getRevenueForecast()`
* **Test File**: `fu.se.smms.service.impl.RevenueForecastServiceImplTest.java`
* **TDD Phase**: 🟢 PASS
* **Condition Ref**: REV-COND-002

#### Preconditions:
* Cấu hình database trống (không có bất kỳ hóa đơn nào được thanh toán).

#### Test Steps:
1. Mock `invoiceRepository.findMonthlyRevenueBreakdown` trả về danh sách rỗng (Empty List).
2. Gọi hàm `service.getRevenueForecast(6)` để yêu cầu dự báo 6 tháng tới.
3. Xác minh kết quả.

#### Expected Result (PASS):
* Phản hồi trả về có độ dài bằng 6.
* Hệ thống tự động điền dữ liệu baseline mẫu thực tế cho resort thay vì trả về rỗng hoặc báo lỗi.
* Phân tích nhận xét AI vẫn hoạt động dựa trên dữ liệu mẫu này.

---

### `REV-FC-TC-03` — Tự động Fallback về Hồi quy tuyến tính khi Gemini API bị lỗi / Timeout

* **Severity**: HIGH
* **Feature Under Test**: `RevenueServiceImpl.getRevenueForecast()`
* **Test File**: `fu.se.smms.service.impl.RevenueForecastServiceImplTest.java`
* **TDD Phase**: 🟢 PASS
* **Condition Ref**: REV-COND-003

#### Preconditions:
* Có thiết lập `GEMINI_API_KEY` nhưng mô phỏng API trả về chuỗi lỗi HTTP 500 hoặc nội dung JSON bị hỏng cấu trúc.

#### Test Steps:
1. Ghi nhận API Key và giả lập HttpClient gửi request tới Gemini API ném ra Exception.
2. Gọi hàm `service.getRevenueForecast(3)`.
3. Kiểm tra phương pháp dự báo được áp dụng.

#### Expected Result (PASS):
* Ứng dụng không bị crash.
* Kết quả tự động chuyển sang mô hình "Linear Regression (Offline Fallback...)" và hoàn thành tính toán mượt mà.

---

### `REV-FC-TC-04` — Phân quyền truy cập API dự báo doanh thu

* **Severity**: CRITICAL
* **Feature Under Test**: `RevenueController.getForecast()`
* **Test File**: Integration / API Route Access Test
* **TDD Phase**: 🟢 PASS
* **Condition Ref**: REV-COND-004

#### Preconditions:
* Spring Security hoạt động.

#### Test Steps:
1. Thực hiện Request `GET /api/revenue/forecast` bằng tài khoản có Role `RECEPTIONIST`.
2. Thực hiện Request tương tự bằng tài khoản có Role `GUEST`.
3. Thực hiện Request tương tự bằng tài khoản có Role `MANAGER`.

#### Expected Result (PASS):
* Request từ `RECEPTIONIST` và `GUEST` trả về mã lỗi `403 Forbidden`.
* Request từ `MANAGER` trả về mã trạng thái `200 OK` cùng dữ liệu JSON dự báo.

---

## 5. Entry / Exit Criteria

### Entry Criteria
* Đặc tả kỹ thuật `FORECAST_EDS.md` đã được duyệt.
* Tệp kiểm thử `RevenueForecastServiceImplTest.java` được khởi tạo dưới dạng biên dịch được.

### Exit Criteria
* 100% các Test Cases phía trên chạy thành công (Pass).
* Biểu đồ frontend tích hợp thành công và hoạt động ổn định trên môi trường local.
