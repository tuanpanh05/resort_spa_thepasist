# TDD - UC24: Biểu đồ doanh thu (Revenue Dashboard)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Management reporting.
* Requirements: Phân tách doanh thu của từng bộ phận: Gói phòng, Spa, F&B.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `REV-TC-001` — Bóc tách doanh thu chính xác
* **Đầu vào (Input)**: Gọi API Dashboard doanh thu cho năm `2026`.
* **Kỳ vọng (Expected)**: API trả về tổng tiền bóc tách chính xác từ các hóa đơn đã thanh toán. Tiền phòng, tiền dịch vụ spa và tiền ăn uống không bị cộng dồn lẫn lộn.

## 3. Xác Minh Code (Verification)
* Unit tests in `fu.se.smms.service.impl.RevenueServiceImplTest`.
