# 🌿 Module 5: Consolidated Checkout & Analytics
**Vai trò:** Student 5 (Full-stack: DB -> DAO -> Controller -> UI)

---

## 1. Tổng quan Module
Module 5 chịu trách nhiệm tổng hợp tài chính và kết thúc vòng đời lưu trú của khách hàng tại resort, đồng thời cung cấp các công cụ phân tích số liệu kinh doanh cho ban quản lý. Đây là điểm cuối của quy trình vận hành, đòi hỏi tính chính xác tuyệt đối trong việc tích hợp dữ liệu tài chính từ tất cả các bộ phận khác (phòng nghỉ, ẩm thực, spa).

---

## 2. Chi tiết Yêu cầu Chức năng (Use Cases)

| Mã UC (Đề bài) | Mã UC (SRS Nhóm 3) | Tên Use Case | Mô tả chi tiết hành vi |
| :--- | :--- | :--- | :--- |
| **UC21** | UC-05 | Tạo hóa đơn tổng hợp (Generate Consolidated Invoice) | Khi khách Check-out, hệ thống tự động tổng hợp tất cả chi phí: tiền phòng/gói trị liệu còn lại (70%), các dịch vụ Spa gọi thêm và các đơn ăn uống phát sinh vào một hóa đơn duy nhất. |
| **UC22** | UC-05 | Xử lý thanh toán & Trả phòng (Process Payment & Check-out) | Lễ tân thực hiện thanh toán qua cổng VNPay/Stripe/PayPal và cập nhật trạng thái Villa vật lý sang "Trống/Cần dọn dẹp" (Vacant/Needs Cleaning). |
| **UC23** | UC-17 | Đánh giá & Phản hồi dịch vụ (Submit Review & Rating) | Khách sau khi hoàn thành Check-out gửi đánh giá và nhận xét về chất lượng gói trị liệu, phòng ở, món ăn và nhân viên. |
| **UC24** | UC-27, UC-28 | Biểu đồ doanh thu (Revenue Dashboard) | Quản lý (Manager) xem báo cáo doanh thu trực quan dạng biểu đồ cột/tròn, phân tách nguồn thu cụ thể từ: Các Gói trị liệu, Dịch vụ Spa, và Dịch vụ Ăn uống (F&B). |
| **UC25** | UC-28 (Báo cáo) | Xuất báo cáo hiệu suất ra Excel (Export Occupancy & Utilization Report) | Quản lý xuất file Excel báo cáo công suất sử dụng phòng (Occupancy Rate) và hiệu suất làm việc của Chuyên gia trị liệu (Therapist Utilization) hàng tháng. |

---

## 3. Quy tắc Nghiệp vụ (Business Rules) & Ràng buộc Hệ thống
1. **Ràng buộc Khóa Check-out (Consolidated Billing Constraint):** 
   - Lễ tân tuyệt đối **không thể làm thủ tục Check-out** nếu hệ thống phát hiện khách hàng còn bất kỳ đơn đặt dịch vụ Spa hoặc gọi món F&B nào ở trạng thái chưa hoàn thành hoặc chưa được ghi nhận thanh toán trong Folio phòng.
2. **BR-14 (Villa Release Update):** Sau khi hoàn tất thủ tục thanh toán trả phòng, trạng thái Villa lập tức được cập nhật thành "Vacant/Needs Cleaning".
3. **BR-15 (Invoice Generation):** Hóa đơn cuối cùng phải được tự động tạo lập từ việc đối chiếu Room_Booking_ID trung tâm.
4. **BR-18 (Review Eligibility) & BR-19 (Single Review):** Chỉ khách đã hoàn thành lưu trú (Checked-out) mới được gửi đánh giá, và mỗi lượt đặt phòng chỉ được phép gửi duy nhất 1 đánh giá.
5. **BR-26 (Transaction Audit Trail):** Mọi giao dịch tài chính đã thanh toán thành công phải được lưu lịch sử vĩnh viễn và không được phép sửa đổi/xóa bỏ để phục vụ mục đích kiểm toán.
6. **BR-27 (Revenue Calculation Rule):** Doanh thu thu về phải được bóc tách chính xác theo bộ phận để phục vụ báo cáo hiệu quả tài chính.

---

## 4. Tiêu chuẩn miền & Tuân thủ Pháp lý (Compliance & Standards)
* **Tiêu chuẩn AHLEI (American Hotel & Lodging Educational Institute) về Folio Khách hàng & Night Audit:**
   - Hệ thống kế toán phải tuân thủ chuẩn AHLEI: mọi điểm bán hàng (Point of Sale - POS) độc lập trong resort (Nhà hàng, Quầy Spa, Dịch vụ buồng phòng) bắt buộc phải đẩy các khoản nợ của khách hàng trực tiếp về tài khoản trung tâm (**Guest Folio**) thông qua liên kết khóa ngoại `Room_Booking_ID`.
* **Tích hợp Cổng thanh toán trực tuyến:**
   - Hỗ trợ thanh toán bảo mật đa dạng qua Stripe, VNPay Sandbox hoặc PayPal.

---

## 5. Tổng hợp các Vấn đề & Khoảng trống (Gaps / Issues)

> [!WARNING]
> **Các điểm xung đột và thiếu sót giữa Đề bài (HOS-03) và Đặc tả SRS chính thức:**

1. **Thiếu thiết kế kiểm soát trạng thái đơn hàng để khóa Check-out:**
   Mặc dù SRS đã ghi nhận quy tắc chặn Check-out khi có nợ chưa settle (BR-15), nhưng tài liệu chưa đặc tả cơ chế kiểm tra trạng thái của các đơn hàng dịch vụ Spa và F&B. Làm thế nào để hệ thống biết một đơn ăn đang được chế biến ("Preparing") chưa giao hoặc một buổi trị liệu đang diễn ra ("In Progress") chưa kết thúc để khóa nút "Check-out" của Lễ tân? Cần bổ sung cột trạng thái thanh toán và trạng thái hoàn thành vào các bảng đơn hàng dịch vụ.
2. **Bỏ sót Báo cáo Hiệu suất Chuyên gia (Therapist Utilization) trong SRS:**
   UC25 của đề bài yêu cầu rất rõ việc xuất báo cáo hiệu suất sử dụng của kỹ thuật viên Spa (ví dụ: Kỹ thuật viên A làm việc bao nhiêu giờ trị liệu thực tế trong tháng so với tổng số giờ làm việc theo ca). Tuy nhiên, trong đặc tả UC28 của SRS hiện tại chỉ tập trung vào phân tích doanh thu và công suất phòng lưu trú mà **bỏ quên hoàn toàn chỉ số hiệu suất Kỹ thuật viên**. Cần bổ sung thiết kế công thức tính toán và cấu trúc bảng chấm công trị liệu.
3. **Thiếu cơ chế quản lý đặt cọc và hoàn trả (Refund/Deposit Flow):**
   Khách hàng đã đặt cọc 30% trực tuyến trước khi đến. Khi làm hóa đơn tổng hợp cuối cùng, hệ thống cần khấu trừ chính xác khoản 30% này và tính toán phần 70% còn lại cộng với phụ phí phát sinh. SRS chưa vẽ sơ đồ luồng dữ liệu tài chính (Cash Flow) mô tả cách cấn trừ tiền cọc này, có thể gây nhầm lẫn cho lập trình viên khi viết logic tính hóa đơn.
4. **Thiếu cấu trúc dữ liệu bảng Folio theo tiêu chuẩn AHLEI:**
   Để hỗ trợ dồn hóa đơn (Consolidated Billing), cơ sở dữ liệu cần có bảng `Folio` đóng vai trò trung gian chứa các giao dịch kế toán (`Folio_Item` / `Transaction_Ledger`). SRS hiện tại trong mục thiết kế DB chưa chỉ rõ cách tổ chức bảng này, có nguy cơ gây sai lệch kế toán khi truy vấn cộng dồn thủ công từ các bảng dịch vụ riêng lẻ.
