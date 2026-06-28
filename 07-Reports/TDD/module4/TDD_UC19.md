# TDD - UC19: Cảnh báo dị ứng ăn uống (Allergy Alert Warnings)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Kitchen food safety safety audit.
* Requirements: Tự động đối chiếu thông tin dị ứng của khách với thành phần món ăn đặt chế biến để đưa ra cảnh báo.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `ALLERGY-TC-001` — Cảnh báo khi có nguyên liệu gây dị ứng cho khách
* **Pre-conditions**: Khách dị ứng `Đậu phộng`. Đặt món `Mỳ Quảng` (thành phần chứa Đậu phộng).
* **Expected**: Đơn hàng F&B hiển thị trên Chef Workspace được gắn cờ `allergyAlert = true` kèm thông báo chi tiết.

### `ALLERGY-TC-002` — Đơn hàng an toàn không có cảnh báo
* **Pre-conditions**: Khách dị ứng `Đậu phộng`. Đặt món `Cơm tấm sườn bì chả` (không chứa Đậu phộng).
* **Expected**: Đơn hàng F&B hiển thị có cờ `allergyAlert = false`.

## 3. Xác Minh Code (Verification)
* Unit tests in `MealServiceImplTest` -> `testAllergyAlertSystem`.
