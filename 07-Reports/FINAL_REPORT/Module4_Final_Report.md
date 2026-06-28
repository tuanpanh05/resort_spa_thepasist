# BÁO CÁO HOÀN THIỆN & KIỂM THỬ MODULE 4
## F&B Engine & Chef Workspace (UC16–UC20)
### Dự án: Ngũ Sơn Resort & Spa Management System (NSRMS)

---

## 1. Tổng Quan Kết Quả Công Việc

Module 4 chịu trách nhiệm quản lý đặt đồ ăn ẩm thực (F&B), thực đơn dinh dưỡng cá nhân hóa, bảng điều khiển chuẩn bị món ăn cho nhà bếp (Chef Workspace) và tích hợp cảnh báo dị ứng ăn uống tự động để bảo đảm an toàn cho khách lưu trú.

### Kết quả tổng thể:
* **F&B Order Dispatcher**: Hệ thống tiếp nhận đơn đặt món ăn từ ứng dụng của khách hoặc từ lễ tân, tự động cấn trừ chi phí về Guest Folio (Invoice) nếu gọi món ngoài gói.
* **Chef Workspace**: Bảng điều khiển thời gian thực cho nhà bếp cập nhật trạng thái chế biến món ăn (`PENDING` &rarr; `PREPARING` &rarr; `READY` &rarr; `DELIVERED`).
* **Allergy Alert System**: Tự động đối chiếu thông tin dị ứng ăn uống (`foodAllergies`) của khách hàng với thành phần nguyên liệu của món ăn. Nếu phát hiện trùng lặp, hệ thống lập tức hiển thị cảnh báo đỏ nổi bật trên màn hình của Đầu bếp.
* **JUnit Tests**: **10/10 tests PASS 100%**.

---

## 2. Chi Tiết Các Tính Năng Hoàn Thành

### 2.1 Xem thực đơn & Đặt món ăn (UC16, UC17)
* Khách hàng xem thực đơn nhà hàng kèm thông tin dinh dưỡng, calo và chất gây dị ứng.
* Cho phép khách đặt món trực tiếp tại phòng, lựa chọn bữa ăn trong gói trị liệu detox/giảm cân hoặc đặt món thêm tính phí.

### 2.2 Chef Workspace & Quản lý chế biến (UC18, UC19)
* Đầu bếp quản lý danh sách món ăn đang chờ chế biến.
* Trực quan hóa mức độ ưu tiên và cảnh báo dị ứng thực phẩm của từng khách hàng để bếp chuẩn bị nguyên liệu thay thế phù hợp.

### 2.3 Giao nhận món ăn & Cập nhật trạng thái (UC20)
* Nhân viên phục vụ cập nhật trạng thái đơn hàng khi giao thành công tới tận Villa của khách.
* Đồng bộ hóa trạng thái thanh toán đơn hàng về Invoice trung tâm lữ hành.

---

## 3. Bằng Chứng Kiểm Thử (Verification Evidence)

### 3.1 Kết quả JUnit Tests
```text
[INFO] Running fu.se.smms.service.impl.MealServiceImplTest
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 3.2 Allergy Alert Verification
* Khách hàng A khai báo dị ứng: `Hải sản, Đậu phộng`.
* Khách đặt món `Salad trộn dầu giấm hải sản` (thành phần chứa hải sản).
* Trên giao diện Chef Workspace: Đơn hàng của Khách hàng A lập tức nhấp nháy đỏ kèm dòng thông báo nổi bật: **"CẢNH BÁO DỊ ỨNG: Khách hàng dị ứng HẢI SẢN! Vui lòng không sử dụng hải sản trong món Salad này!"**.
* Đầu bếp xác nhận cảnh báo trước khi tiến hành chế biến.
