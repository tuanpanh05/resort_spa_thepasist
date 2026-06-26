# TDD - UC18: Chef Workspace (Bảng điều khiển nhà bếp)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Kitchen operations.
* Requirements: Cho phép đầu bếp theo dõi và cập nhật trạng thái chế biến.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `CHEF-TC-001` — Cập nhật trạng thái chế biến món ăn
* **Đầu vào (Input)**: Đầu bếp nhận đơn hàng F&B, gọi API cập nhật trạng thái đơn sang `PREPARING`.
* **Kỳ vọng (Expected)**: API trả về `200 OK`, trạng thái đơn đổi sang `PREPARING` thành công.

## 3. Xác Minh Code (Verification)
* Unit tests in `MealServiceImplTest` & API guards in `ChefMealController`.
