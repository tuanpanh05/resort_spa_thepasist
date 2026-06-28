# TDD - UC25: Báo cáo hiệu năng vận hành & xuất Excel (Export Occupancy & Utilization Report)

## 1. Cơ Sở Thiết Kế Kiểm Thử (Test Basis)
* Bounded Context: Operational metrics export.
* Requirements: Xuất file Excel định dạng bảng tính chứa công suất sử dụng phòng nghỉ và hiệu năng kỹ thuật viên.

## 2. Kịch Bản Kiểm Thử Chi Tiết (Test Cases)

### `EXCEL-TC-001` — Xuất Excel định dạng binary chính xác
* **Đầu vào (Input)**: Gọi API xuất báo cáo Excel cho tháng 6 năm 2026.
* **Kỳ vọng (Expected)**: API trả về mã `200 OK` với kiểu content-type là `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, thân phản hồi dạng binary không trống.

## 3. Xác Minh Code (Verification)
* Controller mappings in `RevenueController`.
