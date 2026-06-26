# TDD - UC16: Xem thực đơn dinh dưỡng (Nutrition Menu & Allergens)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Restaurant menu viewing.
* Requirements: Khách hàng xem danh sách món ăn đi kèm thông tin các chất có thể gây dị ứng.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `MENU-TC-001` — Đọc danh sách món ăn chứa trường Allergens
* **Đầu vào (Input)**: Gọi API `GET /api/meals`.
* **Kỳ vọng (Expected)**: API trả về danh sách các món ăn, mỗi món ăn có chứa thông tin dị ứng thực phẩm (`allergens`) rõ ràng (Ví dụ: "Hải sản, sữa").

## 3. Xác Minh Code (Verification)
* Unit tests in `MealServiceImplTest` -> `testGetMealsNutritionInfo`.
