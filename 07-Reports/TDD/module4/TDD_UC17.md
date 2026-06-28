# TDD - UC17: Đặt món ăn (Order Meals)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Food ordering billing integration.
* Requirements: Đặt món ăn và tự động tích hợp chi phí vào Guest Folio (Invoice).

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `FOOD-TC-001` — Đặt món ngoài gói cập nhật Invoice
* **Đầu vào (Input)**: Đặt món ngoài gói trị giá 400.000 VNĐ.
* **Kỳ vọng (Expected)**: Đơn hàng tạo thành công ở trạng thái `PENDING`, tổng chi phí F&B của hóa đơn liên kết (`fb_charge`) cập nhật tăng thêm 400.000 VNĐ.

## 3. Xác Minh Code (Verification)
* Unit tests in `MealServiceImplTest` -> `testOrderExtraFoodUpdatesInvoice`.
