# TDD - UC21: Tạo hóa đơn tổng hợp (Generate Consolidated Invoice)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Room billing folio consolidation.
* Requirements: Hợp nhất 70% tiền phòng/gói còn lại, các dịch vụ phụ trợ Spa + F&B và thuế VAT 10%.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `CONSOL-TC-001` — Tính toán chính xác tổng nợ Folio
* **Đầu vào (Input)**: Booking có tiền phòng cọc trước 30% (3.000.000 VNĐ của tổng 10.000.000 VNĐ). Gọi thêm F&B = 1.000.000 VNĐ.
* **Kỳ vọng (Expected)**: Hóa đơn tổng cộng dồn `room_charge = 7.000.000 VNĐ`, `fb_charge = 1.000.000 VNĐ`, `tax_amount = 100.000 VNĐ`. Tổng hóa đơn thanh toán = 8.100.000 VNĐ.

## 3. Xác Minh Code (Verification)
* Unit tests in `fu.se.smms.service.impl.InvoiceServiceImplTest`.
