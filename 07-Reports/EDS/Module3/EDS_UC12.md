# EDS - UC12: Tự động ghép lịch thông minh (Auto-match Therapist & Room)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Hệ thống tự động đề xuất một Chuyên gia trị liệu trống lịch và một Phòng trị liệu trống khớp với dịch vụ Spa mà khách yêu cầu tại khung giờ đề xuất.
* **Quy tắc ghép chuyên môn (Specialty matching)**:
  * Trị liệu Yoga -> Huấn luyện viên Yoga.
  * Vật lý trị liệu -> Chuyên viên Vật lý trị liệu.
  * Trị liệu Spa thường -> Kỹ thuật viên Spa.
  * *Graceful Fallback*: Nếu không tìm thấy chuyên gia theo đúng chuyên môn, hệ thống sẽ tự động ghép với chuyên gia bất kỳ còn trống trong giờ đó.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /v1/spa-bookings/auto-match`
* **Database Tables**:
  * `users` (cột `specialty`), `treatment_room` (cột `category`), `spa_booking`

---

# TDD - UC12: Tự động ghép lịch thông minh

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `MATCH-TC-001` — Ghép tự động thành công với đúng chuyên môn
* **Input**: Dịch vụ `Vật lý trị liệu cột sống`, giờ hẹn `2026-07-20T09:00:00`.
* **Expected**: Trả về Kỹ thuật viên Minh (chuyên môn `PHYSIO`) và phòng trị liệu vật lý tương ứng.

### `MATCH-TC-002` — Không có chuyên gia nào trống trong khung giờ
* **Input**: Khung giờ cao điểm đã có toàn bộ nhân viên bận.
* **Expected**: Trả về `409 Conflict` kèm thông báo "Không có chuyên gia trị liệu nào trống".

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.SpaBookingServiceImplTest` -> `PASS`
