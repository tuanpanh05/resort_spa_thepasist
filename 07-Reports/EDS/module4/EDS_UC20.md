# EDS - UC20: Giao nhận & Cập nhật trạng thái món ăn (Delivery Status Tracking)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Nhân viên phục vụ (Staff) giao đồ ăn đến phòng của khách lữ hành và cập nhật trạng thái đơn hàng sang `DELIVERED`.
* **Trạng thái cuối**: Khi đơn hàng ở trạng thái `DELIVERED`, chi phí món ăn chính thức được xác nhận chốt sổ trên hóa đơn Folio.

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `PATCH /api/meals/orders/{id}/status?status=DELIVERED`
* **Database Tables**:
  * `food_orders`

---

# TDD - UC20: Giao nhận & Cập nhật trạng thái món ăn

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `DELIV-TC-001` — Cập nhật trạng thái giao món thành công
* **Input**: Đơn hàng F&B có trạng thái `READY`, nhân viên giao đến biệt thự và gọi API chuyển sang `DELIVERED`.
* **Expected**: Trả về `200 OK`, trạng thái đơn đổi sang `DELIVERED`.

## 2. Kết Quả Xác Minh (Verification Result)
* **API Tests**: `ChefMealControllerTest` -> `PASS`
