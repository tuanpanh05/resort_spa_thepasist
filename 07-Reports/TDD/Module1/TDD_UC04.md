# TDD - UC04: Thiết lập dữ liệu danh mục cốt lõi (Master Data Management)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Master Data catalog.
* Requirements: CRUD biệt thự, dịch vụ spa, và gói trị liệu.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `MSTD-TC-001` — Đọc danh mục công khai không cần Token
* **Đầu vào (Input)**: Gửi request `GET /api/master-data/spa-services` không kèm Authorization header.
* **Kỳ vọng (Expected)**: API trả về `200 OK` cùng danh sách các dịch vụ spa.

### `MSTD-TC-002` — Thêm mới hạng phòng nghỉ bởi tài khoản không phải ADMIN
* **Đầu vào (Input)**: Gửi request `POST /api/master-data/room-types` bằng token vai trò `RECEPTIONIST`.
* **Kỳ vọng (Expected)**: API trả về `403 Forbidden`.

## 3. Xác Minh Code (Verification)
* Security constraints on `MasterDataController`.
