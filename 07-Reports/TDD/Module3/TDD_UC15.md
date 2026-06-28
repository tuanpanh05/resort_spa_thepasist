# TDD - UC15: Đặt thêm dịch vụ Spa ngoài gói (Book Extra Spa Service)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Spa booking pricing & invoice integration.
* Requirements: Đặt Spa ngoài gói tính phí dịch vụ phát sinh và đồng bộ vào Guest Folio (Invoice).

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `EXTRA-TC-001` — Đặt ngoài gói cập nhật tiền hóa đơn tổng hợp
* **Đầu vào (Input)**: Đặt Spa với `isPackageIncluded = false`, giá dịch vụ = 800.000 VNĐ.
* **Kỳ vọng (Expected)**: Đơn hàng tạo thành công ở trạng thái `CONFIRMED`. API gọi cập nhật hóa đơn Folio tự động cộng thêm 800.000 VNĐ vào trường `spa_charge`.

## 3. Xác Minh Code (Verification)
* Unit tests in `SpaBookingServiceImplTest` -> `testBookExtraSpaServiceUpdatesInvoice`.
