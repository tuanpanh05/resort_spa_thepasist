# EDS - UC08: Thanh toán đặt cọc 30% (30% Deposit Payment)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng tiến hành thanh toán khoản đặt cọc bắt buộc tương đương 30% tổng trị giá đơn đặt phòng (gồm tiền phòng + tiền gói trị liệu) để hệ thống chuyển trạng thái booking sang `CONFIRMED`.
* **Quy tắc tính đặt cọc**: `deposit_amount = (room_price + package_price) * 0.30`

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /api/bookings/{id}/deposit-url` (Tạo link VNPay thanh toán đặt cọc)
  * `GET /api/bookings/deposit-callback` (Callback từ cổng thanh toán)
* **Database Tables**:
  * `room_bookings` (`deposit_amount`, `paid_amount`, `status`)

---

# TDD - UC08: Thanh toán đặt cọc 30%

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `DEP-TC-001` — Tính toán chính xác 30% giá trị cọc
* **Input**: Đơn đặt phòng có tổng tiền phòng + gói = 10.000.000 VNĐ.
* **Expected**: Hệ thống tạo hóa đơn đặt cọc với `deposit_amount = 3.000.000 VNĐ` chính xác.

### `DEP-TC-002` — Callback thanh toán thành công chuyển trạng thái booking
* **Input**: VNPay callback trả về mã giao dịch thành công `vnp_ResponseCode = 00`.
* **Expected**: Trạng thái booking chuyển sang `CONFIRMED`, `paid_amount` cập nhật thêm số tiền cọc.

## 2. Kết Quả Xác Minh (Verification Result)
* **Integration Tests**: `BookingServiceImplTest` -> `PASS`
