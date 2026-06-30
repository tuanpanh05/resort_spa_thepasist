# ENGINEERING DOCUMENT STANDARD (EDS) v2.0 - REVENUE FORECASTING

## Quy chuẩn Kỹ thuật và Đặc tả Hiện thực hóa Tính năng Dự báo Doanh thu AI

| Field              | Value                            |
| :-------------------| :---------------------------------|
| **Document ID**    | SMMS-PAY-IMP-005                 |
| **Version**        | 1.0                              |
| **Date**           | 2026-06-26                       |
| **Status**         | Approved                         |
| **Document Owner** | Pham Anh Tuan                    |
| **Author**         | Pham Anh Tuan                    |
| **Reviewed by**    | All Team                         |
| **DPO Sign-off**   | Approved — 2026-06-26 — All Team |
| **Approved by**    | Hoang Tuan Anh                   |
| **Last Review**    | 2026-06-26                       |
| **Based on EDS**   | v2.0                             |

---

## CHANGELOG

| Ngày | Người thực hiện | Nội dung thay đổi |
| :--- | :--- | :--- |
| 2026-06-28 | Antigravity | Khởi tạo đặc tả kỹ thuật tính năng dự báo doanh thu lai (Hybrid AI & Offline Fallback) |

---

## MỤC LỤC

1. [Tổng quan Module](#1-tổng-quan-module)
2. [Ma trận Truy vết (Traceability Matrix)](#2-ma-trận-truy-vết-traceability-matrix)
3. [Architecture Decision Records (ADR)](#3-architecture-decision-records-adr)
4. [Non-Functional Requirements & SLA](#4-non-functional-requirements--sla)
5. [Static Modeling (Mô hình Tĩnh)](#5-static-modeling-mô-hình-tĩnh)
6. [Dynamic Modeling (Mô hình Động)](#6-dynamic-modeling-mô-hình-động)
7. [Interface Specification (Đặc tả Giao diện)](#7-interface-specification-đặc-tả-giao-diện)
8. [API Specification](#8-api-specification)
9. [Bảng mã lỗi (Error Codes)](#9-bảng-mã-lỗi-error-codes)
10. [Quy trình Triển khai (Step-by-Step)](#10-quy-trình-triển-khai-step-by-step)
11. [Bảng tổng hợp phân quyền (Authorization Matrix)](#11-bảng-tổng-hợp-phân-quyền-authorization-matrix)

---

## 1. Tổng quan Module

Tính năng Dự báo Doanh thu AI (AI Revenue Forecasting) mở rộng cấu phần Analytics thuộc Module 5. Mục tiêu chính là cung cấp cho Quản lý (Manager) cái nhìn trực quan về xu hướng doanh thu của resort trong tương lai (3, 6, hoặc 12 tháng kế tiếp), bao gồm các cấu phần cốt lõi: Villa, Spa trị liệu, và Ẩm thực F&B. 

Tính năng sử dụng cơ chế lai (Hybrid) kết hợp mô hình ngôn ngữ lớn (Google Gemini API) và mô hình toán học hồi quy (Linear Regression) chạy offline trên máy chủ ứng dụng để đảm bảo độ tin cậy và khả năng hoạt động liên tục.

| Field | Value |
| :--- | :--- |
| **Module Name** | Revenue Analytics & Forecasting |
| **Bounded Context** | Operations Dashboard |
| **Data Classification** | Internal (Không chứa thông tin PII nhạy cảm) |
| **Compliance Scope** | N/A |
| **Upstream Dependencies** | InvoiceRepository |
| **Downstream Consumers** | Frontend Manager Dashboard (`AdminOverview.jsx`) |

---

## 2. Ma trận Truy vết (Traceability Matrix)

| Requirement ID | Loại (BR/ADR/US) | Mô tả yêu cầu | Thành phần Code | Compliance Target | ADR liên quan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BR-REV-001 | Business Rule | Dự báo doanh thu phải được chia nhỏ theo từng bộ phận (Villa, Spa, Food) | `RevenueForecastDTO` | Phân tách doanh thu chính xác | — |
| US-REV-006 | User Story | Manager có thể chuyển đổi chế độ xem dự báo 3, 6 hoặc 12 tháng tiếp theo | `RevenueController.getForecast` | Đáp ứng nhu cầu lập kế hoạch | — |
| ADR-REV-001 | Decision | Áp dụng mô hình Hybrid: Gemini API kết hợp Hồi quy tuyến tính Offline Fallback | `RevenueServiceImpl.getRevenueForecast` | Đảm bảo tính khả dụng cao | ADR-REV-001 |

---

## 3. Architecture Decision Records (ADR)

### ADR-REV-001 — Lựa chọn Kiến trúc Mô hình Dự báo Doanh thu Lai (Hybrid Forecasting Engine)

| Field | Value |
| :--- | :--- |
| **Status** | Accepted |
| **Deciders** | G3 Project Architect, Lead Developer |
| **Date** | 2026-06-28 |

#### Bối cảnh (Context)
Giảng viên hướng dẫn (Teacher) yêu cầu tích hợp trí tuệ nhân tạo (AI) vào việc dự báo doanh thu. Để deploy và demo đồ án mượt mà trước hội đồng (không phụ thuộc vào mạng internet yếu hoặc lỗi hết hạn ngạch khóa API), hệ thống cần đảm bảo luôn hiển thị được dữ liệu biểu đồ và phân tích cơ bản thay vì báo lỗi crash ứng dụng.

#### Các phương án đã xem xét (Options Considered)

| Phương án | Mô tả | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- | :--- |
| **A: Chỉ dùng LLM API** | Gửi data lịch sử sang OpenAI/Gemini API | Dự báo thông minh, có kèm phân tích tiếng Việt tự nhiên | Phụ thuộc internet, phản hồi chậm, có thể lỗi nếu mất key |
| **B: Chỉ dùng Java Math** | Viết thuật toán Hồi quy tuyến tính offline | 100% offline, phản hồi siêu nhanh, không tốn tài nguyên | Nhận xét tự động bị rập khuôn, không có tính năng xử lý ngôn ngữ tự nhiên |
| **C: Mô hình Lai (Hybrid)** | Ưu tiên gọi Gemini API, lỗi/không có key tự động fallback về Hồi quy tuyến tính | Tối ưu hóa ưu điểm cả 2 phương án: thông minh khi online, an toàn khi offline | Code backend phức tạp hơn do phải kiểm tra trạng thái và xử lý lỗi ngoại lệ |

#### Quyết định (Decision)
Lựa chọn **Phương án C (Hybrid)** nhằm đảm bảo tính ổn định tối đa cho đồ án SWP391 trong khi vẫn phô diễn được tính năng tích hợp AI hiện đại khi chạy thử thực tế.

---

## 4. Non-Functional Requirements & SLA

### 4.1. Performance & Availability

| Category | Requirement | Target SLA | Measurement Method |
| :--- | :--- | :--- | :--- |
| Latency (Offline Mode) | API response (p99) | < 50ms | JUnit benchmark test |
| Latency (Gemini AI Mode)| API response (p99) | < 3000ms | REST Call monitor |
| Failover Timeout | Thời gian chờ API Gemini | 5000ms | HttpURLConnection timeout |

---

## 5. Static Modeling (Mô hình Tĩnh)

### 5.1. Class Diagram

```text
+-----------------------------------+
|        RevenueController          |
+-----------------------------------+
| + getForecast(months): RespEntity |
+-----------------+-----------------+
                  |
                  v
+-----------------+-----------------+
|         RevenueService            |
+-----------------+-----------------+
| + getRevenueForecast(m): DTO     |
+-----------------+-----------------+
                  |
                  v
+-----------------+-----------------+
|       RevenueServiceImpl          |
+-----------------+-----------------+
| - invoiceRepository: Repo         |
| - getGeminiApiKey(): String       |
| - callGeminiAPI(key, p): String   |
| - calculateRegression(x, y): double[]|
+-----------------------------------+
```

### 5.2. Data Structure (RevenueForecastDTO)

```java
public class RevenueForecastDTO {
    private List<ForecastItem> forecastData;
    private String aiAnalysis;
    private String methodUsed; // "Gemini AI" or "Linear Regression (Offline)"

    public static class ForecastItem {
        private String label; // "Tháng MM/YYYY"
        private BigDecimal roomRevenue;
        private BigDecimal spaRevenue;
        private BigDecimal foodRevenue;
        private BigDecimal totalRevenue;
    }
}
```

---

## 6. Dynamic Modeling (Mô hình Động)

### 6.1. Sequence Diagram — Happy Path với Gemini AI API

```text
Client            Controller            Service             Repository            Gemini API
  |                   |                    |                    |                     |
  |-- GET /forecast ->|                    |                    |                     |
  |                   |-- getForecast() -->|                    |                     |
  |                   |                    |-- findBreakdown() -|                     |
  |                   |                    |<-- [History Data] -|                     |
  |                   |                    |                                          |
  |                   |                    |------- POST generateContent ------------>|
  |                   |                    |<------ [JSON Forecast & Analysis] -------|
  |                   |                    |                                          |
  |                   |<-- ForecastDTO ----|                                          |
  |<-- 200 OK --------|                    |                                          |
```

### 6.2. Sequence Diagram — Error Path / Fallback sang Hồi quy tuyến tính Offline

```text
Client            Controller            Service             Gemini API            Regression Engine
  |                   |                    |                     |                        |
  |-- GET /forecast ->|                    |                     |                        |
  |                   |-- getForecast() -->|                     |                        |
  |                   |                    |-- POST Content ---->|                        |
  |                   |                    |   (Timeout/Mạng lỗi) |                        |
  |                   |                    |--[Exception]------->|                        |
  |                   |                    |                                              |
  |                   |                    |-- Kích hoạt Fallback ----------------------->|
  |                   |                    |<-- [Tính toán toán học y = ax + b] -----------|
  |                   |<-- ForecastDTO ----|                                              |
  |<-- 200 OK --------|                    |                                              |
```

---

## 7. Interface Specification (Đặc tả Giao diện)

### 7.1. Service Contract

```java
package fu.se.smms.service;

import fu.se.smms.dto.RevenueForecastDTO;

public interface RevenueService {
    // ... các method cũ
    
    /**
     * Tính toán dự báo doanh thu dựa trên cơ chế lai (Hybrid).
     * @param months Số lượng tháng cần dự báo tương lai
     */
    RevenueForecastDTO getRevenueForecast(Integer months);
}
```

---

## 8. API Specification

### 8.1. Endpoint Table

| Method | Path | Auth Level | Required Roles | Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/revenue/forecast` | JWT Bearer | `MANAGER` | 60/min |

### 8.2. Request / Response Sample

#### GET `/api/revenue/forecast?months=3`

##### Response — 200 OK (Mô hình Gemini AI hoạt động):
```json
{
  "forecastData": [
    {
      "label": "Tháng 07/2026",
      "roomRevenue": 28500000.00,
      "spaRevenue": 8600000.00,
      "foodRevenue": 5100000.00,
      "totalRevenue": 42200000.00
    },
    {
      "label": "Tháng 08/2026",
      "roomRevenue": 29800000.00,
      "spaRevenue": 9200000.00,
      "foodRevenue": 5400000.00,
      "totalRevenue": 44400000.00
    },
    {
      "label": "Tháng 09/2026",
      "roomRevenue": 31200000.00,
      "spaRevenue": 9700000.00,
      "foodRevenue": 5800000.00,
      "totalRevenue": 46700000.00
    }
  ],
  "aiAnalysis": "Doanh thu resort Ngũ Sơn dự kiến sẽ duy trì đà tăng trưởng khoảng 5% trong 3 tháng tới nhờ mùa du lịch hè tăng cao. Dịch vụ Villa tiếp tục đóng góp trên 60% tỷ trọng doanh thu. Khuyên nghị Manager tập trung đẩy mạnh dịch vụ Spa trị liệu đi kèm gói đặt phòng để tối đa hóa chi tiêu của khách.",
  "methodUsed": "Gemini AI"
}
```

---

## 9. Bảng mã lỗi (Error Codes)

| Code | HTTP Status | Message (VI) | Trigger Condition |
| :--- | :---: | :--- | :--- |
| `REV-500` | 500 | Lỗi tính toán dự báo doanh thu | Xảy ra khi có lỗi logic tính toán hoặc lỗi cú pháp JSON từ API bên ngoài không thể fallback |

---

## 10. Quy trình Triển khai (Step-by-Step)

1.  Thêm khóa `GEMINI_API_KEY` vào tệp `.env` tại thư mục gốc của project (nếu muốn kích hoạt Gemini AI).
2.  Deploy code backend mới lên máy chủ ứng dụng Spring Boot.
3.  Deploy code frontend React cập nhật tab hiển thị trên giao diện của Manager.
4.  Truy cập endpoint `/api/revenue/forecast?months=3` để kiểm thử khói (smoke test).

---

## 11. Bảng tổng hợp phân quyền (Authorization Matrix)

| Endpoint | GUEST | RECEPTIONIST | STAFF | MANAGER | ADMIN | SYSTEM |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `GET /api/revenue/forecast` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
