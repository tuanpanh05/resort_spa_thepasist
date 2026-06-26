# EDS - UC17: Đặt món ăn (Order Meals)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Khách hàng chọn đặt món ăn tại biệt thự.
* **Món trong gói**: Được miễn phí nếu món đó thuộc gói dinh dưỡng đi kèm Retreat Package của đặt phòng.
* **Món ngoài gói**: Tính phí và tự động đẩy dư nợ vào hóa đơn Folio phòng lữ hành.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `POST /api/meals/order` (Đặt món ăn)
* **Database Tables**:
  * `food_orders` (`order_id`, `booking_id`, `meal_id`, `quantity`, `price_at_order`, `status`, `created_at`)

---

# TDD - UC17: Đặt món ăn

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `ORDER-TC-001` — Đặt món ăn ngoài gói tự cộng tiền vào Folio
* **Input**: Đặt 2 suất Steak bò giá 500.000 VNĐ/suất ngoài gói.
* **Expected**: Lưu đơn hàng F&B thành công ở trạng thái `PENDING`, hóa đơn của phòng tự động cộng thêm 1.000.000 VNĐ.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `MealServiceImplTest` -> `PASS`
