# EDS - UC11: Đặt lịch trị liệu trong gói (Schedule Spa/Therapy Session)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng đã mua Retreat Package tiến hành đặt lịch hẹn ngày, giờ cho các buổi Spa trị liệu miễn phí đi kèm trong gói của mình.
* **Quy tắc đếm số buổi**: Hệ thống giới hạn nghiêm ngặt số lượng buổi Spa đã đặt không được vượt quá số lượng tối đa trong gói đã cấu hình.
* **Quy tắc thời gian (BR-30)**: Giờ trị liệu phải nằm trong khoảng thời gian lưu trú (Check-in đến Check-out).

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /v1/spa-bookings/schedule` (với `isPackageIncluded = true`)
* **Database Tables**:
  * `spa_booking` (`spa_booking_id`, `user_id`, `spa_service_id`, `room_booking_id`, `start_datetime`, `end_datetime`, `is_package_included`, `price_at_booking` = 0)

---

# TDD - UC11: Đặt lịch trị liệu trong gói

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `SPAPKG-TC-001` — Đặt lịch nằm ngoài khoảng thời gian lưu trú (Check-in/Check-out)
* **Input**: Check-in = `2026-07-01`, Check-out = `2026-07-04`. Đặt Spa lúc `2026-07-05T10:00:00`.
* **Expected**: Trả về `400 Bad Request` báo lỗi thời gian không khớp với kỳ nghỉ.

### `SPAPKG-TC-002` — Đặt quá số buổi quy định của gói
* **Input**: Gói Detox có giới hạn 1 buổi Spa. Khách hàng gửi request đặt buổi thứ 2 theo gói.
* **Expected**: Trả về `400 Bad Request` báo vượt quá hạn mức sử dụng gói.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.SpaBookingServiceImplTest` -> `PASS`
