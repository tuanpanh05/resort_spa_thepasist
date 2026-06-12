# 🌿 Ngũ Sơn Resort & Spa - Sơ đồ & Quy trình Nghiệp vụ (Business Process)

Tài liệu này chứa các định dạng sơ đồ quy trình nghiệp vụ đã được tối ưu hóa để bạn **dán trực tiếp vào Draw.io** nhằm tự động tạo ra sơ đồ đẹp mắt, tiết kiệm thời gian vẽ thủ công.

---

### Cách 1: Sử dụng cấu hình CSV (Tạo ra các khối hình độc lập, dễ chỉnh sửa vị trí)
1. Truy cập [Draw.io](https://app.diagrams.net/).
2. Chọn **Arrange** (Sắp xếp) -> **Insert** (Chèn) -> **Advanced** (Nâng cao) -> **CSV...**
3. Copy toàn bộ nội dung ở **Mục 2 (Cấu hình CSV Draw.io)** dưới đây và dán đè vào khung text.
4. Nhấn **Import** (Nhập). Hệ thống sẽ tự động sinh ra các shape chữ nhật bo góc, tự động nối mũi tên và tô màu theo vai trò cực kỳ sắc nét. Bạn có thể tự do di chuyển các ô này.

---



## 1. CẤU HÌNH CSV DRAW.IO (Tạo sơ đồ tự động có màu sắc và liên kết tốt nhất)

```csv
# label: <div style="font-weight: bold; font-family: 'Inter', sans-serif; padding: 2px;">%step%</div><div style="font-size: 10px; font-family: 'Inter', sans-serif; color: %textColor%; opacity: 0.8; margin-top: 4px; font-style: italic;">%role%</div>
# style: shape=%shape%;rounded=1;whiteSpace=wrap;html=1;fillColor=%fillColor%;strokeColor=%strokeColor%;strokeWidth=2;fontColor=%textColor%;fontSize=12;spacing=4;shadow=1;gradientColor=none;
# namespace: csvimport-
# connect: {"from": "refs", "to": "id", "style": "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jetty=1;endArrow=block;endFill=1;strokeWidth=1.5;strokeColor=%arrowColor%;dashed=%dashed%;"}
# width: auto
# height: auto
# padding: 20
# ignore: id,fillColor,strokeColor,textColor,arrowColor,dashed,refs
#
id,step,role,shape,fillColor,strokeColor,textColor,arrowColor,dashed,refs
1,Khởi tạo hệ thống phòng & dịch vụ,Quản trị viên,rectangle,#ECEFF1,#546E7A,#263238,#546E7A,0,
2,Xem danh sách phòng & Gói trị liệu,Khách hàng,rectangle,#E3F2FD,#1E88E5,#0D47A1,#1E88E5,0,1
3,Đăng ký thành viên & Đăng nhập,Khách hàng,rectangle,#E3F2FD,#1E88E5,#0D47A1,#1E88E5,0,2
4,Chọn phòng & Gói dịch vụ đi kèm,Khách hàng,rectangle,#E3F2FD,#1E88E5,#0D47A1,#1E88E5,0,3
5,Khai báo hồ sơ sức khỏe & Yêu cầu dị ứng ăn uống,Khách hàng,rectangle,#E3F2FD,#1E88E5,#0D47A1,#1E88E5,0,4
6,Thanh toán cọc trực tuyến 30%,Khách hàng,rectangle,#E3F2FD,#1E88E5,#0D47A1,#1E88E5,0,5
7,Duyệt & ghi nhận đơn đặt cọc,Lễ tân,rectangle,#FFF3E0,#FB8C00,#E65100,#FB8C00,0,6
8,Làm thủ tục Check-in & Giao phòng,Lễ tân,rectangle,#FFF3E0,#FB8C00,#E65100,#FB8C00,0,7
9,Phân phối thông tin trị liệu & Ăn uống,Lễ tân,rectangle,#FFF3E0,#FB8C00,#E65100,#FB8C00,0,8
10,Tiếp nhận hồ sơ sức khỏe & chẩn đoán,Chuyên gia,rectangle,#E8F5E9,#43A047,#1B5E20,#43A047,1,9
11,Thực hiện liệu trình Spa / Yoga / Vật lý trị liệu,Chuyên gia,rectangle,#E8F5E9,#43A047,#1B5E20,#43A047,0,10
12,Cập nhật hồ sơ bệnh án khách hàng,Chuyên gia,rectangle,#E8F5E9,#43A047,#1B5E20,#43A047,0,11
13,Kiểm tra thông tin dị ứng & Dinh dưỡng,Đầu bếp,rectangle,#F3E5F5,#8E24AA,#4A148C,#8E24AA,1,9
14,Xây dựng thực đơn & Chế biến món dinh dưỡng,Đầu bếp,rectangle,#F3E5F5,#8E24AA,#4A148C,#8E24AA,0,13
15,Phục vụ ẩm thực trị liệu theo chế độ,Đầu bếp,rectangle,#F3E5F5,#8E24AA,#4A148C,#8E24AA,0,14
16,Ghi nhận dịch vụ phát sinh & Xử lý phản hồi,Lễ tân,rectangle,#FFF3E0,#FB8C00,#E65100,#FB8C00,0,12
17,Cập nhật chi phí ăn uống & dịch vụ buồng phòng,Lễ tân,rectangle,#FFF3E0,#FB8C00,#E65100,#FB8C00,0,15
18,Tính hóa đơn & Thực hiện Check-out,Lễ tân,rectangle,#FFF3E0,#FB8C00,#E65100,#FB8C00,0,16
19,Thanh toán 70% hóa đơn còn lại & Phụ phí,Khách hàng,rectangle,#E3F2FD,#1E88E5,#0D47A1,#1E88E5,0,18
20,Gửi feedback đánh giá dịch vụ tổng thể,Khách hàng,rectangle,#E3F2FD,#1E88E5,#0D47A1,#1E88E5,0,19
21,Cập nhật báo cáo hiệu suất & Doanh thu,Quản trị viên,rectangle,#ECEFF1,#546E7A,#263238,#546E7A,1,18
```

---

## 3. GIẢI THÍCH CHI TIẾT QUY TRÌNH HỢP NHẤT

Quy trình vận hành tại **Ngũ Sơn Resort & Spa** được cá nhân hóa cao dựa trên dữ liệu sức khỏe và dinh dưỡng của khách hàng:

### Bước 1: Chuẩn bị & Trải nghiệm Trực tuyến (Khách hàng & Hệ thống)
* **Quản trị viên (Admin)** thiết lập các phòng trống (VIP, Standard, Deluxe, Villa) và các dịch vụ đi kèm (như *Massage đá núi lửa, Tắm lá thuốc Dao Đỏ, Yoga, Vật lý trị liệu*).
* **Khách hàng** truy cập trang chủ, lựa chọn thời gian và phòng/villas phù hợp.
* Khách hàng tiến hành **Đăng ký tài khoản hội viên** để nhận ưu đãi và bắt đầu quy trình khai báo thông tin sức khỏe trực tuyến (nhập ghi chú bệnh lý, dị ứng thức ăn để bếp trưởng và chuyên gia y tế nắm bắt sớm).
* Thực hiện **Thanh toán đặt cọc 30%** trực tuyến qua thẻ quốc tế hoặc chuyển khoản QR để giữ phòng.

### Bước 2: Đón tiếp & Phân phối Lịch trình (Lễ tân)
* Khi nhận được giao dịch đặt cọc, **Lễ tân** kiểm tra và chuyển trạng thái đặt chỗ thành **Confirmed** (Đã xác nhận).
* Khi khách đến resort, **Lễ tân** làm thủ tục Check-in thực tế, giao khóa phòng và đồng bộ dữ liệu hồ sơ lên hệ thống.
* **Lễ tân** phân phối yêu cầu y tế của khách hàng sang cho **Chuyên gia sức khỏe** và **Bếp trưởng** ngay khi Check-in hoàn tất.

### Bước 3: Thực hiện Dịch vụ chuyên biệt (Chuyên gia & Đầu bếp)
* **Chuyên gia trị liệu (Specialist)** (Bác sĩ Hải, Coach Yoga, Nhân viên Spa) nhận hồ sơ sức khỏe, xếp lịch và thực hiện các gói trị liệu y khoa (vật lý trị liệu cột sống thắt lưng, trị liệu khớp gối, massage đá nóng). Sau khi hoàn tất, họ cập nhật lại bệnh án y khoa của khách trên hệ thống.
* **Đầu bếp (Chef)** kiểm tra thông tin dị ứng (ví dụ: dị ứng hải sản, dị ứng đậu phộng) và thực đơn ăn kiêng (Vegan, Halal, Gluten-free) để phục vụ các món ăn dinh dưỡng an toàn tại phòng (Room Service) hoặc tại nhà hàng.

### Bước 4: Thanh toán & Phản hồi (Khách hàng & Lễ tân)
* **Lễ tân** ghi nhận tất cả chi phí dịch vụ phát sinh (laundry, tour ngoài, dịch vụ ẩm thực).
* Khi khách Check-out, **Lễ tân** in hóa đơn tạm tính, thu **70% giá trị phòng còn lại + Phụ phí phát sinh** và trả phòng.
* **Khách hàng** nhận hóa đơn thanh toán và gửi đánh giá dịch vụ (Feedback) qua hệ thống. Dữ liệu tài chính và phản hồi của khách sẽ lập tức đổ về **Dashboard Quản trị** của Admin.
