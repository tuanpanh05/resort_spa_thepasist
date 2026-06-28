# EDS - UC04: Thiết lập dữ liệu danh mục cốt lõi (Master Data Management)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Hệ thống cung cấp cơ chế khởi tạo và cập nhật các dữ liệu danh mục nền tảng (Master Data) bao gồm: Hạng phòng nghỉ (`RoomType`), Dịch vụ Spa trị liệu (`SpaService`), và các Gói trị liệu phục hồi phục sức khỏe (`RetreatPackage`).
* **Quy tắc bảo mật**: Chỉ Admin mới có quyền sửa đổi (CRUD) các danh mục này. Khách hàng và lễ tân chỉ có quyền đọc (Read-only).

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /api/master-data/room-types` (Xem danh sách loại phòng - Công khai)
  * `POST /api/master-data/room-types` (Thêm loại phòng - Chỉ ADMIN)
  * `GET /api/master-data/spa-services` (Xem danh sách dịch vụ Spa - Công khai)
* **Database Tables**:
  * `room_types`, `spa_services`, `retreat_packages`

---

# TDD - UC04: Thiết lập dữ liệu danh mục cốt lõi

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `MD-TC-001` — Đọc danh sách gói trị liệu không cần đăng nhập (Public Read)
* **Input**: Gửi request `GET /api/master-data/packages` không đính kèm JWT Token.
* **Expected**: Trả về `200 OK` cùng danh sách các gói trị liệu đang hoạt động.

### `MD-TC-002` — Khách hàng cố sửa thông tin dịch vụ Spa
* **Input**: Request `POST /api/master-data/spa-services` bằng tài khoản khách hàng.
* **Expected**: Trả về `403 Forbidden`.

## 2. Kết Quả Xác Minh (Verification Result)
* **API Tests**: `MasterDataControllerTest` -> `PASS`
