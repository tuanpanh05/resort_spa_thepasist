# EDS - UC15: Đặt thêm dịch vụ Spa ngoài gói (Book Extra Spa Service)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng hoặc Lễ tân đặt thêm các dịch vụ Spa ngoài hạn mức gói trị liệu chính. 
* **Quy tắc cộng dồn hóa đơn**: Chi phí dịch vụ Spa gọi thêm này được tính phí theo đơn giá của dịch vụ và tự động cộng dồn (auto route) vào Folio hóa đơn (`Invoice`) phòng lữ hành của khách.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /v1/spa-bookings/schedule` (với `isPackageIncluded = false`)
* **Database Tables**:
  * `spa_booking`, `invoices`
* **Trigger recalculate logic**: Sau khi lưu Spa Booking trả phí thành công, gọi `invoiceService.createInvoice(bookingId)` để cập nhật tổng tiền Folio.

---

# TDD - UC15: Đặt thêm dịch vụ Spa ngoài gói

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `SPAFEE-TC-001` — Đặt dịch vụ ngoài gói thành công cập nhật Subtotal của hóa đơn
* **Input**: Đơn đặt phòng có hóa đơn tiền phòng hiện tại là 5.000.000 VNĐ. Khách đặt thêm dịch vụ Spa trị liệu đá nóng có giá 1.200.000 VNĐ.
* **Expected**: Lưu đặt Spa thành công, tổng giá trị trên hóa đơn Folio cập nhật tăng lên 6.200.000 VNĐ (chưa tính thuế).

## 2. Kết Quả Xác Minh (Verification Result)
* **Integration Tests**: `SpaBookingServiceImplTest` -> `PASS`
