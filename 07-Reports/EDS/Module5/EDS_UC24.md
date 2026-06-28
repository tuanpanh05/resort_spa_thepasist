# EDS - UC24: Biểu đồ doanh thu (Revenue Dashboard)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Quản lý (Manager) xem báo cáo thống kê doanh thu trực quan, phân tách rõ nguồn thu tài chính cụ thể đến từ các bộ phận:
* Doanh thu từ Gói trị liệu / Phòng nghỉ.
* Doanh thu từ Dịch vụ Spa phát sinh ngoài gói.
* Doanh thu từ Ẩm thực F&B phát sinh ngoài gói.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /api/revenue/dashboard?year={year}` (Lấy dữ liệu biểu đồ doanh thu theo năm)
* **Database Tables**:
  * `invoices`

---

# TDD - UC24: Biểu đồ doanh thu

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `REVDB-TC-001` — Lọc và bóc tách doanh thu chính xác
* **Input**: Có 1 hóa đơn thanh toán gồm 5.000.000 VNĐ tiền phòng, 2.000.000 VNĐ tiền Spa, 1.000.000 VNĐ tiền ăn uống.
* **Expected**: API Dashboard trả về bóc tách chính xác:
  * `roomRevenue` = 5.000.000 VNĐ
  * `spaRevenue` = 2.000.000 VNĐ
  * `fbRevenue` = 1.000.000 VNĐ.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.RevenueServiceImplTest` -> `PASS`
