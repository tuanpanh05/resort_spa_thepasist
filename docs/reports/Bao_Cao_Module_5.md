# Báo Cáo Hoàn Thiện & Kiểm Thử Module 5
## Consolidated Checkout & Analytics (UC21–UC25)
### Dự án: Ngũ Sơn Resort & Spa Management System (NSRMS)

---

## 1. Tổng Quan Kết Quả Công Việc

Tôi đã hoàn thành việc rà soát, sửa đổi, hoàn thiện backend và cấu trúc cơ sở dữ liệu của **Module 5** theo đúng yêu cầu nghiệp vụ và quy ước lập trình của dự án. 

### Kết quả tổng thể:
* **Backend Java**: Sửa lỗi mã hóa khoảng trắng cho VNPay và khôi phục cấu hình bảo mật `GlobalExceptionHandler`.
* **Cơ sở dữ liệu**: Đồng bộ hóa toàn bộ vào sơ đồ chính và tạo tệp cấu trúc riêng biệt [module5_table_definition.sql](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/SQL_DB_RESORT_SPA/module5_table_definition.sql) để bạn dễ theo dõi.
* **JUnit Tests**: **26/26 unit tests** của Module 5 đều **PASS 100%** sau khi clean build.
* **Smoke Tests API**: Xác thực thành công các tính năng khóa check-out, giải phóng phòng thành `DIRTY` (BR-14), chặn trùng lặp đánh giá (BR-19), và ghi nhận nhật ký thanh toán (BR-26).

---

## 2. Chi Tiết Các Thay Đổi

### 2.1 Backend (Java & Spring Boot)
* **Khắc phục lỗi mã hóa tham số VNPay**: Sửa phương thức `encode(String value)` trong [InvoiceServiceImpl.java](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/Backend/src/main/java/fu/se/smms/service/impl/InvoiceServiceImpl.java). Chuyển đổi dấu cộng `+` thành `%20` sau khi chạy `URLEncoder.encode` để đảm bảo chuỗi ký (Secure Hash) khớp 100% với yêu cầu của VNPay Sandbox/Production thực tế khi chạy thật.
* **Bảo mật Exception**: Khôi phục cấu hình bảo mật trong [GlobalExceptionHandler.java](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/Backend/src/main/java/fu/se/smms/exception/GlobalExceptionHandler.java) để ẩn các chi tiết lỗi nhạy cảm (stacktrace) khỏi response của client nhằm tuân thủ quy tắc `AI_TEAM_RULES.md`.

### 2.2 Cơ sở dữ liệu (Database Schema)
* **Bảng cấu trúc CSDL riêng**: Tạo file [module5_table_definition.sql](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/SQL_DB_RESORT_SPA/module5_table_definition.sql) chứa định nghĩa riêng biệt cho bảng `payment_transaction_log` (BR-26 Audit Trail), các chỉ mục tối ưu, và ràng buộc `UNIQUE` cho bảng `feedback` (BR-19) để tiện theo dõi độc lập.
* **Đồng bộ hóa sơ đồ chính**: Tích hợp các thay đổi cấu trúc bảng này trực tiếp vào [resort_spa_db.sql](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/SQL_DB_RESORT_SPA/resort_spa_db.sql) để đảm bảo tính nhất quán lâu dài theo quy chuẩn dự án.

---

## 3. Bằng Chứng Kiểm Thử (Verification Evidence)

### 3.1 Unit Tests (Maven)
Tất cả **26 unit tests** đều vượt qua kiểm tra tự động thành công:

```text
[INFO] Running fu.se.smms.service.impl.FeedbackServiceImplTest
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.341 s
[INFO] Running fu.se.smms.service.impl.InvoiceServiceImplTest
[INFO] Tests run: 17, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.369 s
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### 3.2 Smoke Tests API thực tế (Kết nối DB local)
Sau khi nạp lại CSDL sạch và khởi chạy ứng dụng Spring Boot, các API chính của Module 5 được kiểm thử thủ công và hoạt động chính xác:

#### A. Kiểm tra Ràng buộc Khóa Check-out (Consolidated Billing Constraint)
* **Booking 1** (Đã hoàn thành trị liệu spa):
  * Request: `GET /api/invoices/booking/1/validate-checkout`
  * Kết quả: `200 OK` (Cho phép check-out).
* **Booking 2** (Còn 1 buổi trị liệu chưa hoàn thành):
  * Request: `GET /api/invoices/booking/2/validate-checkout`
  * Kết quả: `409 Conflict` (Bị chặn check-out do còn nợ/chưa hoàn thành dịch vụ).
  * Phản hồi từ server:
    ```json
    {
      "code": "INV-409",
      "message": "Không thể Check-out: Còn 1 buổi trị liệu Spa chưa hoàn thành..."
    }
    ```

#### B. Kiểm tra Thanh toán & Giải phóng phòng (BR-14)
* Tiến hành thanh toán tiền mặt cho hóa đơn của Booking 1:
  * Request: `POST /api/invoices/1/cash-payment` -> Trạng thái hóa đơn chuyển sang `PAID`, đồng thời ghi một bản ghi lịch sử giao dịch immutable vào bảng `payment_transaction_log`.
* Tiến hành làm thủ tục checkout:
  * Request: `POST /api/invoices/1/perform-checkout` -> Cập nhật trạng thái Booking sang `CHECKED_OUT`.
  * Trạng thái phòng của Booking 1 (`Villa-101`) trong DB sau khi checkout:
    ```text
    booking_id  status                                            
    ----------- --------------------------------------------------
              1 CHECKED_OUT                                       
    
    room_id     room_number  status                                            
    ----------- -----------  --------------------------------------------------
              2 Villa-101    DIRTY
    ```
    *(Phòng chuyển sang `DIRTY` - Vacant/Needs Cleaning theo đúng quy tắc BR-14).*

#### C. Kiểm tra Ràng buộc Đánh giá Duy nhất (BR-19)
* Gửi feedback cho Booking 1 (đã có đánh giá mẫu):
  * Request: `POST /api/feedback/submit` (UTF-8).
  * Kết quả: `409 Conflict` (Đánh giá bị trùng lặp).
  * Phản hồi từ server:
    ```json
    {
      "code": "PAY-409",
      "message": "Đặt phòng này đã có đánh giá. Mỗi lượt đặt phòng chỉ được gửi một đánh giá duy nhất."
    }
    ```

#### D. Kiểm tra Báo cáo Doanh thu & Hiệu suất chuyên gia (UC24 & UC25)
* Gửi request `GET /api/revenue/dashboard?year=2026`
* Kết quả:
  * Doanh thu năm 2026 bóc tách chính xác (sau khi Invoice 1 được thanh toán):
    - `totalRoomRevenue`: 12,500,000 VND
    - `totalFoodRevenue`: 320,000 VND
    - `totalTaxRevenue`: 1,282,000 VND
    - `grandTotalRevenue`: 14,102,000 VND
  * Hiệu suất của Kỹ thuật viên (Therapist Utilization) được tính toán chính xác:
    - Kỹ thuật viên `Bác Sĩ Hải - Trị Liệu` hoàn thành 1 buổi (150 phút làm việc thực tế / 540 phút theo ca) -> Tỷ lệ hiệu suất đạt **27.78%**.

---

## 4. Hướng Dẫn Tự Chạy Test Tại Local

### 4.1 Khởi tạo Database
Chạy các lệnh SQL sau trong trình quản lý CSDL (hoặc SSMS) của bạn để dọn dẹp và nạp dữ liệu mẫu sạch:
1. Chạy file cấu trúc chính: [resort_spa_db.sql](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/SQL_DB_RESORT_SPA/resort_spa_db.sql)
2. Chạy file dữ liệu mẫu: [module5_extension.sql](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/SQL_DB_RESORT_SPA/module5_extension.sql)

### 4.2 Chạy Unit Tests
Mở terminal tại thư mục `Backend/` và chạy lệnh sau:
```powershell
$JAVA_HOME = "C:\Program Files\Java\jdk-24"
$MAVEN_HOME = "C:\Users\Administrator\Videos\FontendFor_SWP391\03.SourceCode\maven-extracted\apache-maven-3.9.6"
$env:JAVA_HOME = $JAVA_HOME
$env:PATH = "$JAVA_HOME\bin;$MAVEN_HOME\bin;$env:PATH"
& "$MAVEN_HOME\bin\mvn.cmd" clean test "-Dtest=InvoiceServiceImplTest,FeedbackServiceImplTest"
```

### 4.3 Khởi chạy Server
Chạy lệnh Spring Boot:
```powershell
& "$MAVEN_HOME\bin\mvn.cmd" spring-boot:run
```
Server sẽ chạy tại cổng `8080` với context path `/api`. Bạn có thể sử dụng Postman hoặc trình duyệt để gọi thử nghiệm các API trên!
