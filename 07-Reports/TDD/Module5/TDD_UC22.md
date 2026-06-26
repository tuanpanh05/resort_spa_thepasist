# TDD - UC22: Xử lý thanh toán & Trả phòng (Process Payment & Check-out)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Operational check-out flow.
* Requirements: Khóa check-out nếu còn nợ/đơn chưa hoàn thành, giải phóng phòng thành `DIRTY`, lưu transaction log vĩnh viễn.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `CO-TC-001` — Chặn Checkout khi còn đơn dịch vụ hoạt động
* **Đầu vào (Input)**: Gọi API validate checkout cho booking có đơn hàng chưa hoàn thành.
* **Kỳ vọng (Expected)**: Thất bại, ném `409 Conflict`.

### `CO-TC-002` — Giải phóng phòng thành DIRTY
* **Đầu vào (Input)**: Gọi API checkout hóa đơn đã PAID.
* **Kỳ vọng (Expected)**: Trạng thái phòng nghỉ chuyển sang `DIRTY`.

## 3. Xác Minh Code (Verification)
* Unit tests in `InvoiceServiceImplTest`.
