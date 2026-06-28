# EDS - UC25: Báo cáo hiệu năng vận hành & xuất Excel (Export Occupancy & Utilization Report)

## 1. Mô Tả Nghiệp Vụ (Use Case Specification)
Quản lý (Manager) xuất file báo cáo định dạng Excel thống kê các chỉ số hiệu năng vận hành hàng tháng của resort:
* **Occupancy Rate**: Công suất sử dụng phòng nghỉ lữ hành (Số phòng được ở / Tổng số phòng trống hiện có).
* **Therapist Utilization**: Hiệu suất làm việc thực tế của các Kỹ thuật viên (Tổng số giờ thực hiện các ca trị liệu Spa so với tổng thời gian ca làm việc).

## 2. Đặc Tả Kỹ Thuật (Technical Specification)
* **API Endpoints**:
  * `GET /api/revenue/export-occupancy` (Xuất file Excel báo cáo)
* **Database Tables**:
  * `room_bookings`, `spa_booking`, `users`

---

# TDD - UC25: Báo cáo hiệu năng vận hành & xuất Excel

## 1. Kịch Bản Kiểm Thử (Test Cases)

### `EXCEL-TC-001` — Xuất file Excel báo cáo không bị lỗi định dạng
* **Input**: Gửi request `GET /api/revenue/export-occupancy?month=06&year=2026`.
* **Expected**: Trả về `200 OK` với header `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, tải về file Excel hợp lệ chứa bảng tính công suất phòng và hiệu suất kỹ thuật viên.

## 2. Kết Quả Xác Minh (Verification Result)
* **API Tests**: `RevenueControllerTest` -> `PASS`
