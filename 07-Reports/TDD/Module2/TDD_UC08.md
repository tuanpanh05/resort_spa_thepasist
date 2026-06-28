# TDD - UC08: Thanh toán đặt cọc 30% (30% Deposit Payment)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Room booking financial deposit.
* Requirements: Tính toán và xử lý cọc 30% trực tuyến để xác nhận đặt phòng.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `DEP-TC-001` — Tính toán giá trị tiền đặt cọc
* **Đầu vào (Input)**: Tổng giá trị phòng + gói = 5.000.000 VNĐ.
* **Kỳ vọng (Expected)**: Trường `deposit_amount` trong DB được tính chính xác bằng 1.500.000 VNĐ.

### `DEP-TC-002` — Confirm booking khi callback thanh toán thành công
* **Đầu vào (Input)**: Gọi API callback VNPay với trạng thái thành công.
* **Kỳ vọng (Expected)**: Trạng thái booking chuyển thành `CONFIRMED`.

## 3. Xác Minh Code (Verification)
* Unit tests in `BookingServiceImplTest`.
