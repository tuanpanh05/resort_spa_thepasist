# EDS - UC23: Đánh giá & Phản hồi dịch vụ (Submit Review & Rating)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng sau khi hoàn tất kỳ nghỉ và trả phòng (Checkout) có thể gửi đánh giá nhận xét và chấm điểm chất lượng phòng, gói trị liệu, ẩm thực và dịch vụ chăm sóc của nhân viên.
* **Review Eligibility (BR-18)**: Chỉ cho phép khách hàng đã checkout (`CHECKED_OUT`) được gửi đánh giá.
* **Single Review (BR-19)**: Mỗi lượt đặt phòng chỉ được phép gửi duy nhất 1 đánh giá.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /api/feedback/submit` (Gửi feedback)
* **Database Tables**:
  * `feedback` (`feedback_id`, `booking_id`, `rating`, `comment`, `submitted_at`)
* **Unique Constraint**:
  * Đặt ràng buộc `UNIQUE` trên cột `booking_id` trong bảng `feedback`.

---

# TDD - UC23: Đánh giá & Phản hồi dịch vụ

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `REV-TC-001` — Chặn gửi review khi chưa checkout
* **Input**: Booking có trạng thái `CHECKED_IN`, gửi request feedback.
* **Expected**: Trả về `400 Bad Request` hoặc `409 Conflict` chặn gửi.

### `REV-TC-002` — Chặn gửi review lần thứ hai (Single Review)
* **Input**: Booking có trạng thái `CHECKED_OUT` đã có sẵn 1 review trong DB. Gửi thêm 1 request feedback.
* **Expected**: Trả về `409 Conflict` chặn hành động gửi trùng.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.FeedbackServiceImplTest` -> `PASS`
