# TDD - UC13: Xem lịch làm việc & Hồ sơ trị liệu (View Daily Schedule & Guest Notes)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Therapist workspace data access.
* Requirements: Tối thiểu hóa thông tin PII nhạy cảm của khách lữ hành hiển thị cho Kỹ thuật viên (Nghị định 13/2023/NĐ-CP).

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `THER-TC-001` — Lấy lịch biểu chứa ghi chú thể chất
* **Đầu vào (Input)**: Kỹ thuật viên A gọi API xem lịch làm việc ngày `2026-07-20`.
* **Kỳ vọng (Expected)**: DTO chứa `physicalCondition` ("Thoát vị đĩa đệm").

### `THER-TC-002` — Ẩn các trường thông tin nhạy cảm khác
* **Đầu vào (Input)**: Kiểm tra cấu trúc DTO phản hồi.
* **Kỳ vọng (Expected)**: Các thông tin dị ứng thực phẩm (`foodAllergies`), số CCCD/Hộ chiếu, số thẻ tín dụng không tồn tại trong DTO.

## 3. Xác Minh Code (Verification)
* Unit tests in `SpaBookingServiceImplTest` -> `testGetTherapistScheduleDataMinimization`.
