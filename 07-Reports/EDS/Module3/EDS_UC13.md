# EDS - UC13: Xem lịch làm việc & Hồ sơ trị liệu (View Daily Schedule & Guest Notes)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Kỹ thuật viên (Therapist) xem lịch biểu làm việc hàng ngày của mình và đọc các ghi chú thể chất nhạy cảm của khách để đảm bảo chất lượng phục vụ và tránh các thao tác mát-xa sai ảnh hưởng đến chấn thương của khách.
* **Quy tắc Tối thiểu hóa Dữ liệu (Nghị định 13)**: Ẩn thông tin bếp ăn (dị ứng thức ăn), hộ chiếu, và thông tin tài chính của khách. Chỉ phơi bày thông tin sức khỏe thể chất (`physicalCondition`).

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /v1/spa-bookings/therapist-schedule`
* **Database Tables**:
  * `spa_booking`, `users`, `medical_profile`

---

# TDD - UC13: Xem lịch làm việc & Hồ sơ trị liệu

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `NOTE-TC-001` — Chuyên gia trị liệu xem ghi chú thể chất của khách hàng
* **Input**: Chuyên gia trị liệu đăng nhập và lấy lịch làm việc ngày `2026-07-20`.
* **Expected**: Trả về danh sách buổi trị liệu kèm theo chuỗi đã giải mã `physicalCondition` ("Đau dây thần kinh tọa").

### `NOTE-TC-002` — Ngăn chặn rò rỉ dữ liệu dị ứng và tài chính
* **Input**: Kiểm tra payload của API trả về cho Kỹ thuật viên.
* **Expected**: Các trường `foodAllergies`, `creditCard`, `passport` hoàn toàn không có trong DTO phản hồi.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.SpaBookingServiceImplTest` -> `PASS`
