# EDS - UC09: Quản lý đặt phòng (Booking Management)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng có thể tra cứu lịch sử đặt phòng, Lễ tân có thể sửa đổi hoặc thực hiện hủy đặt phòng của khách theo quy định hủy phòng của resort (hoàn cọc/không hoàn cọc tùy theo thời gian hủy).

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /api/bookings/{id}` (Xem chi tiết đặt phòng)
  * `POST /api/bookings/{id}/cancel` (Hủy đặt phòng)
* **Database Tables**:
  * `room_bookings` (`status`, `updated_at`)

---

# TDD - UC09: Quản lý đặt phòng

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `MNG-TC-001` — Khách hàng hủy đặt phòng trước ngày check-in 3 ngày
* **Input**: Yêu cầu hủy booking có ngày check-in sau 5 ngày nữa.
* **Expected**: Hủy thành công, trạng thái booking chuyển sang `CANCELLED`.

### `MNG-TC-002` — Khách cố tình hủy đặt phòng khi đã check-in
* **Input**: Booking có trạng thái `CHECKED_IN`, gửi request hủy.
* **Expected**: Trả về `400 Bad Request` chặn thao tác.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `BookingServiceImplTest` -> `PASS`
