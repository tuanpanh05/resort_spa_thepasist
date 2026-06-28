# EDS - UC21: Tạo hóa đơn tổng hợp (Generate Consolidated Invoice)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Hệ thống tự động cộng dồn toàn bộ các chi phí phát sinh trong kỳ nghỉ của khách lữ hành để xuất hóa đơn tổng hợp (Folio):
* **Phần tiền phòng còn lại**: 70% tổng tiền phòng/gói trị liệu (đã khấu trừ 30% tiền đặt cọc trước đó).
* **Dịch vụ Spa gọi thêm**: Tổng các lịch đặt Spa ngoài gói ở trạng thái xác nhận.
* **Món ăn F&B gọi thêm**: Tổng các đơn đặt món F&B ngoài gói ở trạng thái `DELIVERED`.
* **Thuế & Phụ phí**: Thuế suất VAT (10%) áp dụng trên tổng phụ thu.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /invoices/create?bookingId={bookingId}` (Khởi tạo/Recalculate hóa đơn tổng hợp)
  * `GET /invoices/{id}` (Xem hóa đơn)
* **Database Tables**:
  * `invoices` (`invoice_id`, `booking_id`, `room_charge`, `spa_charge`, `fb_charge`, `tax_amount`, `deposit_amount`, `total_amount`, `paid_amount`, `status`)

---

# TDD - UC21: Tạo hóa đơn tổng hợp

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `CONSOL-TC-001` — Tính toán chính xác số dư nợ còn lại của hóa đơn
* **Pre-conditions**: Khách đặt biệt thự + gói trị liệu = 10.000.000 VNĐ. Khách đã đóng cọc 3.000.000 VNĐ. Khách gọi thêm F&B = 1.000.000 VNĐ (chưa tính thuế).
* **Expected**: 
  * Room Charge còn lại (70%) = 7.000.000 VNĐ.
  * Phụ thu dịch vụ phụ trợ = 1.000.000 VNĐ.
  * Thuế VAT (10% của phụ thu 1.000.000) = 100.000 VNĐ.
  * Tổng tiền hóa đơn checkout = 7.000.000 + 1.000.000 + 100.000 = 8.100.000 VNĐ.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.InvoiceServiceImplTest` -> `PASS`
