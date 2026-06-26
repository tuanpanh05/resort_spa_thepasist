# EDS - UC16: Xem thực đơn dinh dưỡng (Nutrition Menu & Allergens)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng duyệt xem thực đơn ẩm thực của resort kèm theo các thông tin chi tiết về mặt dinh dưỡng (Calories, Protein, Carb, Fat) và các chất có khả năng gây dị ứng (Allergens) trong món ăn (đậu phộng, hải sản, gluten...).

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /api/meals` (Lấy danh sách món ăn kèm dinh dưỡng và chất gây dị ứng)
* **Database Tables**:
  * `meals` (`meal_id`, `name`, `calories`, `allergens`, `price`, `status`)

---

# TDD - UC16: Xem thực đơn dinh dưỡng

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `MENU-TC-001` — Xem thực đơn trả về đầy đủ chất gây dị ứng
* **Input**: Request `GET /api/meals`.
* **Expected**: Trả về `200 OK` cùng danh sách món ăn, mỗi món ăn có chứa thông tin trường `allergens` (Ví dụ: "Hải sản, trứng").

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `fu.se.smms.service.impl.MealServiceImplTest` -> `PASS`
