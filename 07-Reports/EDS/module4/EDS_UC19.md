# EDS - UC19: Cảnh báo dị ứng ăn uống (Allergy Alert Warnings)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Hệ thống đối chiếu hồ sơ dị ứng thực phẩm (`foodAllergies`) của khách hàng với thành phần nguyên liệu món ăn khi hiển thị trên Chef Workspace.
* **Quy tắc cảnh báo**: Nếu có sự trùng khớp (ví dụ: khách dị ứng đậu phộng, món ăn chứa đậu phộng), hệ thống hiển thị cảnh báo đỏ nổi bật để đầu bếp thay thế nguyên liệu chế biến an toàn.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Logic**:
  * Khi lấy danh sách đơn hàng cho Chef, hệ thống load thông tin `food_allergies` của User và map với trường `allergens` của Meal. Nếu giao nhau (contains), gắn cờ cảnh báo `allergyAlert = true`.
* **Database Tables**:
  * `medical_profile`, `meals`, `food_orders`

---

# TDD - UC19: Cảnh báo dị ứng ăn uống

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `ALRT-TC-001` — Hiển thị cảnh báo dị ứng khi có sự trùng khớp
* **Pre-conditions**: Khách hàng dị ứng `Hải sản`. Đặt món `Mỳ Ý tôm hùm` (chứa chất gây dị ứng là "Hải sản").
* **Expected**: DTO trả về chứa cờ cảnh báo `allergyAlert = true` và chuỗi cảnh báo tương ứng.

### `ALRT-TC-002` — Không có cảnh báo dị ứng khi món ăn an toàn
* **Pre-conditions**: Khách hàng dị ứng `Đậu phộng`. Đặt món `Mỳ Ý tôm hùm` (chất gây dị ứng là "Hải sản").
* **Expected**: DTO trả về có cờ `allergyAlert = false`.

## 2. Kết Quả Xác Minh (Verification Result)
* **Unit Tests**: `MealServiceImplTest` -> `PASS`
