# EDS - UC22: Xử lý thanh toán & Trả phòng (Process Payment & Check-out)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Lễ tân xử lý thanh toán hóa đơn tổng hợp (Tiền mặt hoặc cổng thanh toán trực tuyến) và làm thủ tục Checkout cho khách hàng.
* **Consolidated Billing Constraint**: Chặn Checkout nếu còn đơn hàng Spa hoặc F&B chưa hoàn thành.
* **Early Checkout Option**: Cho phép Lễ tân hủy bỏ có kiểm soát (Force Cancel) các đơn hàng F&B hoặc Spa ở trạng thái chờ chế biến (`PENDING`, `PREPARING`) để tiến hành trả phòng khẩn cấp.
* **Room Release (BR-14)**: Sau khi Checkout thành công, trạng thái phòng lập tức chuyển sang `DIRTY`.
* **Audit Trail (BR-26)**: Lưu lịch sử giao dịch immutable sang bảng `payment_transaction_log`.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /invoices/booking/{bookingId}/validate-checkout` (Xác thực điều kiện checkout)
  * `POST /invoices/{id}/perform-checkout` (Thực hiện trả phòng)
  * `POST /invoices/{id}/early-checkout` (Trả phòng khẩn cấp)
* **Database Tables**:
  * `invoices`, `room_bookings` (`status` = `CHECKED_OUT`), `rooms` (`status` = `DIRTY`), `payment_transaction_log`

---

# TDD - UC22: Xử lý thanh toán & Trả phòng

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `CO-TC-001` — Chặn Checkout do còn đơn F&B chưa hoàn thành
* **Pre-conditions**: Khách có 1 đơn F&B đang chế biến (`PREPARING`).
* **Input**: Lễ tân gọi API validate checkout.
* **Expected**: Trả về `409 Conflict` chặn checkout.

### `CO-TC-002` — Giải phóng phòng sang DIRTY sau khi checkout
* **Pre-conditions**: Hóa đơn đã thanh toán.
* **Input**: Gọi API perform-checkout.
* **Expected**: Trạng thái phòng nghỉ của đặt phòng chuyển sang `DIRTY`.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.InvoiceServiceImplTest` -> `PASS`
