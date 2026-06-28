# EDS - UC18: Chef Workspace (Bảng điều khiển nhà bếp)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Đầu bếp (Chef/Kitchen Staff) theo dõi danh sách các món ăn cần chế biến xếp thứ tự theo thời gian đặt món để phục vụ đúng hạn.
* **Cập nhật tiến độ**: `PENDING` -> `PREPARING` -> `READY` (chờ giao).

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /api/meals/chef/orders` (Xem danh sách đơn món ăn của Bếp)
  * `PATCH /api/meals/orders/{id}/status` (Cập nhật trạng thái chế biến)
* **Database Tables**:
  * `food_orders`

---

# TDD - UC18: Chef Workspace

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `CHEF-TC-001` — Đầu bếp cập nhật trạng thái món ăn sang PREPARING
* **Input**: Đơn hàng F&B có trạng thái `PENDING`, đầu bếp chọn bắt đầu chế biến.
* **Expected**: API trả về `200 OK`, trạng thái đơn đổi sang `PREPARING`.

### `CHEF-TC-002` — Khách hàng cố thay đổi trạng thái chế biến của bếp
* **Input**: Đăng nhập bằng tài khoản GUEST, gọi API cập nhật trạng thái đơn F&B của Chef.
* **Expected**: Trả về `403 Forbidden`.

## 2. Kết Quả Xác Minh (Verification Result)
* **API Tests**: `ChefMealControllerTest` -> `PASS`
