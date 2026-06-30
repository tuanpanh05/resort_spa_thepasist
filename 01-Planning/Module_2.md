# 🌿 Module 2: Retreat Package & Accommodation Booking

**Vai trò:** Student 2 (Full-stack: DB -> DAO -> Controller -> UI)

---

## 1. Tổng quan Module

Module 2 tập trung vào luồng nghiệp vụ cốt lõi của resort: cho phép khách hàng tìm kiếm, lọc và đặt phòng kèm gói trị liệu sức khỏe tổng hợp. Module này cũng chịu trách nhiệm cho các tác vụ tại quầy lễ tân như quản lý khách đến (Arrivals), thực hiện thủ tục Nhận phòng (Check-In), quản lý phòng vật lý và đồng bộ lịch trình trải nghiệm (Itinerary Timeline) cho khách.

---

## 2. Chi tiết Yêu cầu Chức năng (Use Cases)

| Mã UC (Đề bài) | Mã UC (SRS Nhóm 3) | Tên Use Case                                                                    | Mô tả chi tiết hành vi                                                                                                                                                        |
| :---------------| :-------------------| :--------------------------------------------------------------------------------| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **UC06**       | UC-03              | Tìm kiếm & Lọc gói trị liệu (Filter Retreat Packages)                           | Khách hàng tìm kiếm các gói trị liệu và lọc theo mục tiêu sức khỏe (Giảm cân - Weight Loss, Giảm căng thẳng - Stress Relief, Tập Yoga...).                                    |
| **UC07**       | UC-13              | Đặt gói trị liệu & Thanh toán cọc (Book Retreat Package)                        | Khách chọn gói trị liệu, chọn ngày đi, loại Villa mong muốn và tiến hành thanh toán cọc trực tuyến an toàn.                                                                   |
| **UC08**       | UC-04, UC-09       | Nhận phòng & Quản lý danh sách khách đến (Check-In & Arrivals Dashboard)        | Lễ tân theo dõi danh sách khách sắp đến trong ngày, thực hiện Check-In khi khách tới, kiểm tra thông tin đặt cọc, thu thập giấy tờ cá nhân và bàn giao khóa/số Villa thực tế. |
| **UC09**       | UC-06              | Quản lý trạng thái biệt thự (Manage Villa Status)                               | Lễ tân theo dõi và thay đổi trạng thái của các Villa vật lý (Trống - Available, Đang có khách - Occupied, Bảo trì - Maintenance).                                             |
| **UC10**       | UC-07, UC-14       | Xem chi tiết đặt phòng & Lịch trình (View Booking Details & Itinerary Timeline) | Khách hàng (hoặc Lễ tân) xem toàn bộ thông tin đặt chỗ kèm theo một trục thời gian lịch trình trải nghiệm (bao gồm giờ ăn, lịch hẹn trị liệu Spa/Yoga).                       |

---

## 3. Quy tắc Nghiệp vụ (Business Rules) & Ràng buộc Hệ 

## thống

1. **BR-04 (Active Package Availability):** Chỉ các gói trị liệu đang ở trạng thái hoạt động (Active) mới hiển thị cho khách hàng đặt.
2. **BR-05 (Deposit Requirement):** Đơn đặt chỗ chỉ chuyển sang trạng thái "Confirmed" (Đã xác nhận) sau khi hoàn tất giao dịch đặt cọc trực tuyến.
3. **BR-06 (Villa Availability Validation):** Hệ thống chỉ cho phép đặt các Villa còn trống trong khoảng thời gian khách yêu cầu.
4. **BR-12 (Check-in Validation):** Chỉ những đơn đặt chỗ đã được xác nhận (Confirmed) và đã thanh toán cọc mới đủ điều kiện làm thủ tục Check-In.
5. **BR-13 (Villa Occupancy Update):** Sau khi Check-In thành công, trạng thái của Villa đó tự động chuyển sang "Occupied" (Đang có khách).
6. **BR-30 (Booking Timeline Consistency):** Tất cả các hoạt động trị liệu, lịch hẹn Spa, lịch dọn phòng và ăn uống của khách hàng phải nằm hoàn toàn trong khoảng thời gian lưu trú (từ ngày Check-In đến ngày Check-Out).

---

## 4. Tiêu chuẩn miền & Tuân thủ Pháp lý (Compliance & Standards)

* **Luật Cư trú Việt Nam 2020:**
  - Quy định bắt buộc mọi cơ sở lưu trú phải khai báo tạm trú cho khách lưu trú qua đêm (cả khách trong nước và nước ngoài) với cơ quan Công an địa phương.
  - *Ứng dụng:* Hệ thống phải thu thập thông tin định danh cá nhân (CCCD hoặc Số hộ chiếu/Visa đối với người nước ngoài) tại bước Check-In. Dữ liệu này phải được mã hóa khi lưu trữ và hỗ trợ xuất file Excel báo cáo tạm trú hàng ngày (Daily Residence Report).
* **Tiêu chuẩn Master Data về Y tế & Sức khỏe của GWI (Global Wellness Institute):**
  - Việc thiết lập danh mục Gói trị liệu phải sử dụng các thuật ngữ chuẩn hóa về du lịch sức khỏe (ví dụ: *Mindfulness Retreat, Detoxification, Ayurveda*) thay vì các từ ngữ đặt phòng khách sạn thông thường để tăng tính chuyên nghiệp của hệ thống.

---

## 5. Tổng hợp các Vấn đề & Khoảng trống (Gaps / Issues)

> [!WARNING]
> **Các điểm xung đột và thiếu sót giữa Đề bài (HOS-03) và Đặc tả SRS chính thức:**

1. **Ràng buộc tỷ lệ đặt cọc trực tuyến:**
   Nghiệp vụ tổng thể của resort yêu cầu khách thanh toán **đặt cọc cố định là 30%** giá trị đơn hàng để xác nhận giữ chỗ. Tuy nhiên, tài liệu SRS (UC13) lại quy định tỷ lệ đặt cọc này có thể cấu hình được bởi ban quản lý ("configurable by resort management"). Điều này cần được thống nhất: hệ thống sẽ khóa cứng 30% ở mã nguồn hay xây dựng bảng cấu hình tham số trong cơ sở dữ liệu.
2. **Thiếu cấu trúc dữ liệu cho Báo cáo Tạm trú (Luật Cư trú 2020):**
   SRS mới chỉ nêu yêu cầu thu thập thông tin ID của khách hàng để làm thủ tục tạm trú nhưng chưa đặc tả các trường dữ liệu chi tiết bắt buộc pháp lý (như Quốc tịch, Số thị thực nhập cảnh, Ngày nhập cảnh gần nhất...). Thiết sót này sẽ khiến tính năng xuất báo cáo gửi Công an địa phương bị thiếu thông tin quan trọng.
3. **Cơ chế chuyển giao trạng thái Villa sau khi dọn dẹp:**
   Khi khách làm thủ tục Check-Out (ở Module 5), trạng thái Villa sẽ chuyển thành "Vacant/Needs Cleaning" (Trống/Cần dọn dẹp). Tài liệu SRS chưa làm rõ quy trình chuyển đổi từ trạng thái này quay trở lại "Available" (Sẵn sàng đón khách): Ai là người xác nhận phòng đã dọn xong (nhân viên buồng phòng hay lễ tân), và hệ thống có màn hình cập nhật trạng thái này riêng biệt không?
4. **Đồng bộ Itinerary Timeline (Trục thời gian lịch trình):**
   UC10 yêu cầu hiển thị một trục lịch trình trực quan cho khách hàng. Lịch trình này tự động lấy dữ liệu từ lịch Spa (Module 3) và lịch ăn uống (Module 4). Trong tài liệu SRS, thiết kế API lấy dữ liệu tổng hợp này chưa được định nghĩa rõ, có nguy cơ gây tắc nghẽn hiệu năng khi truy vấn từ nhiều bảng dữ liệu khác nhau.
