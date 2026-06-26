# TDD - UC23: Đánh giá & Phản hồi dịch vụ (Submit Review & Rating)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Customer satisfaction feedback.
* Requirements: Chỉ cho khách đã checkout gửi đánh giá, và chỉ được đánh giá 1 lần duy nhất cho mỗi booking.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `REV-TC-001` — Chặn gửi review khi chưa checkout
* **Đầu vào (Input)**: Booking status = `CHECKED_IN`, gọi API submit review.
* **Kỳ vọng (Expected)**: Thất bại, ném `400 Bad Request` hoặc `409 Conflict`.

### `REV-TC-002` — Chặn gửi review lần 2
* **Đầu vào (Input)**: Booking status = `CHECKED_OUT` và đã có feedback trong DB, gửi request review tiếp theo.
* **Kỳ vọng (Expected)**: Thất bại, ném lỗi `409 Conflict` (báo trùng lặp).

## 3. Xác Minh Code (Verification)
* Unit tests in `fu.se.smms.service.impl.FeedbackServiceImplTest`.
