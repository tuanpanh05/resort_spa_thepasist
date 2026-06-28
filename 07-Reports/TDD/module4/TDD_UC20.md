# TDD - UC20: Giao nhận & Cập nhật trạng thái món ăn (Delivery Status Tracking)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Waitstaff room delivery workflow.
* Requirements: Cập nhật trạng thái đơn F&B sang DELIVERED để chốt sổ tài chính Folio.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `DEL-TC-001` — Chuyển trạng thái đơn hàng sang DELIVERED
* **Input**: Nhân viên gọi API cập nhật trạng thái đơn hàng `orderId = 5` sang `DELIVERED`.
* **Kỳ vọng (Expected)**: API trả về `200 OK`, trạng thái cập nhật DB thành công.

## 3. Xác Minh Code (Verification)
* Unit tests in `MealServiceImplTest`.
