# 🌿 SMMS Resort & Spa – Quy trình Nghiệp vụ (Workflows)

Tài liệu này chi tiết 6 quy trình nghiệp vụ cốt lõi (workflows) tương ứng với 5 Module của hệ thống **SMMS Ngũ Sơn Resort & Spa** sử dụng sơ đồ tuần tự (Sequence Diagram) và sơ đồ hoạt động (Activity Diagram) bằng cú pháp Mermaid.

---

## 🔐 Workflow 1: Đăng ký, Đăng nhập & Khai báo Hồ sơ Y tế (Module 1)

Quy trình này mô tả việc đăng nhập, bảo mật hồ sơ sức khỏe nhạy cảm bằng mã hóa AES-256 và quyền được xóa dữ liệu cá nhân theo tiêu chuẩn GDPR.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    participant FE as Frontend UI (React)
    participant BE as Backend API (Spring Boot)
    participant DB as Cơ sở dữ liệu (SQL Server)
    
    %% Đăng nhập & Đăng ký
    Customer->>FE: Yêu cầu Đăng nhập bằng OTP / Tài khoản
    FE->>BE: Gửi thông tin định danh (Email, Mật khẩu / SĐT)
    BE->>DB: Truy vấn thông tin người dùng
    DB-->>BE: Trả về tài khoản
    BE->>BE: Sinh JWT Token & Lưu Refresh Token
    BE-->>FE: Trả về JWT Access Token & Refresh Token
    FE-->>Customer: Hiển thị Dashboard Khách hàng
    
    %% Khai báo Hồ sơ Y tế
    Customer->>FE: Khai báo tình trạng sức khỏe & dị ứng món ăn
    FE->>FE: Yêu cầu tích chọn Explicit Consent (Chấp thuận bảo mật)
    FE->>BE: Gửi thông tin y tế + chữ ký đồng thuận
    Note over BE: Mã hóa AES-256 các trường:<br/>physical_condition -> encrypted<br/>food_allergies -> encrypted
    BE->>DB: INSERT / UPDATE bảng `medical_profile`
    DB-->>BE: Thành công
    BE-->>FE: Trả về trạng thái lưu hồ sơ y tế thành công
    FE-->>Customer: Hiển thị thông tin hồ sơ sức khỏe đã lưu
```

---

## 🛏️ Workflow 2: Tìm kiếm & Đặt phòng cùng Gói trị liệu (Module 2)

Khách hàng tìm kiếm phòng trống theo thời gian thực và thực hiện đặt phòng kết hợp Gói trị liệu (Retreat Package) kèm thanh toán đặt cọc 30%.

```mermaid
activityDiagram
    %% Note: Cú pháp flowchart thường được dùng làm Activity Diagram đẹp hơn trong Mermaid.
```
```mermaid
flowchart TD
    Start([Khởi đầu]) --> Search[Tìm phòng & Gói trị liệu]
    Search --> InputDates[Nhập Ngày nhận phòng, Ngày trả phòng & Số khách]
    InputDates --> QueryDB{Hệ thống kiểm tra trùng lặp phòng trống?}
    
    QueryDB -- Có phòng trùng lặp --> Warn[Cảnh báo phòng đã có người đặt] --> InputDates
    QueryDB -- Phòng sẵn sàng AVAILABLE --> SelectRoom[Khách chọn phòng & Gói trị liệu phù hợp]
    
    SelectRoom --> CalcPrice[Tính toán tổng chi phí & số tiền cọc 30%]
    CalcPrice --> CreateBooking[Tạo booking nháp: Status = PENDING_DEPOSIT]
    CreateBooking --> RedirectVNPay[Chuyển hướng đến Cổng thanh toán VNPay]
    
    RedirectVNPay --> PayCheck{Khách thanh toán thành công?}
    PayCheck -- Không / Hủy --> CancelBooking[Booking tự động hủy sau 15 phút] --> End([Kết thúc])
    PayCheck -- Thành công --> Callback[VNPay gửi Callback về Backend]
    
    Callback --> UpdateStatus[Cập nhật Booking: Status = CONFIRMED, Lưu tiền cọc]
    UpdateStatus --> GenDraftInvoice[Tạo hóa đơn nháp UNPAID gộp tiền phòng]
    GenDraftInvoice --> SendMail[Gửi email xác nhận đặt phòng tự động] --> End
```

---

## 🪪 Workflow 3: Thủ tục Check-In & Khai báo Tạm trú (Module 2)

Nhân viên lễ tân thực hiện làm thủ tục nhận phòng cho khách lưu trú khi đến resort.

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Khách hàng
    actor Receptionist as Nhân viên Lễ tân
    participant FE as Frontend UI (React)
    participant BE as Backend API (Spring Boot)
    participant DB as Cơ sở dữ liệu (SQL Server)

    Receptionist->>FE: Tìm kiếm thông tin Đặt phòng (ID / Tên / Email)
    FE->>BE: GET /api/bookings?search=...
    BE->>DB: SELECT * FROM room_booking WHERE status = 'CONFIRMED'
    DB-->>BE: Trả về danh sách đặt phòng
    BE-->>FE: Hiển thị danh sách lên màn hình lễ tân
    
    Receptionist->>Guest: Yêu cầu cung cấp giấy tờ tùy thân (CCCD / Passport)
    Guest-->>Receptionist: Cung cấp giấy tờ vật lý
    
    Receptionist->>FE: Nhập số CCCD/Passport của khách và người đi cùng
    FE->>FE: Validate định dạng CCCD (12 chữ số khởi đầu bằng 0)
    
    Receptionist->>FE: Nhấp nút "Thực hiện Check-In"
    FE->>BE: POST /api/checkin (Dữ liệu khai báo tạm trú & ID đặt phòng)
    Note over BE: Mã hóa AES-256 giấy tờ tùy thân<br/>id_passport_encrypted
    
    BE->>DB: INSERT INTO room_guest_declaration (khai báo tạm trú)
    BE->>DB: UPDATE room SET status = 'OCCUPIED' (Cập nhật trạng thái phòng)
    BE->>DB: UPDATE room_booking SET status = 'CHECKED_IN'
    DB-->>BE: Ghi nhận thành công
    BE-->>FE: Trả về kết quả check-in thành công
    FE-->>Receptionist: Hiển thị thông báo hoàn tất, giao phòng
```

---

## 💆 Workflow 4: Đặt lịch Trị liệu Spa/Yoga & Điều phối Chuyên gia (Module 3)

Quy trình tự động hóa lập lịch hẹn dịch vụ và phân bổ chuyên gia y tế/trị liệu dựa trên năng lực và thời gian trống.

```mermaid
flowchart TD
    Start([Bắt đầu đặt lịch Spa/Yoga]) --> SelectService[Khách chọn dịch vụ Spa/Yoga & Giờ hẹn]
    SelectService --> CheckPackage{Khách đi theo Gói Trị liệu?}
    
    CheckPackage -- Có --> CheckLimit{Còn hạn mức sử dụng Spa trong gói?}
    CheckLimit -- Hết hạn mức --> ChargePrice[Tính theo đơn giá lẻ à la carte] --> MatchEngine
    CheckLimit -- Còn hạn mức --> MarkComplimentary[Đánh dấu dịch vụ MIỄN PHÍ đi kèm gói] --> MatchEngine
    
    CheckPackage -- Không --> ChargePrice
    
    MatchEngine[Chạy Công cụ điều phối Specialist Assignment Engine] --> GetAvailableSpecialists[Truy vấn Chuyên gia có kỹ năng phù hợp & có lịch trống ca trực]
    GetAvailableSpecialists --> GetAvailableRooms[Truy vấn phòng trị liệu treatment_room trống]
    
    GetAvailableRooms --> VerifyMatch{Tìm thấy Chuyên gia & Phòng trống?}
    VerifyMatch -- Không --> SuggestAlt[Gợi ý khung giờ khác] --> SelectService
    VerifyMatch -- Tìm thấy --> CreateSpaBooking[Tạo Spa Booking: Status = CONFIRMED]
    
    CreateSpaBooking --> SyncCalendar[Đồng bộ lịch hẹn lên Google Calendar của Chuyên gia & Khách]
    SyncCalendar --> RunSession[Chuyên gia thực hiện trị liệu theo giờ hẹn]
    RunSession --> SaveMedicalNotes[Chuyên gia viết ghi chú bệnh án phục hồi & Cập nhật Status = COMPLETED]
    SaveMedicalNotes --> End([Kết thúc])
```

---

## 🍲 Workflow 5: Đặt món ăn ẩm thực trị liệu & Cảnh báo Dị ứng (Module 4)

Quy trình đặt món ăn an toàn cho sức khỏe và kích hoạt cảnh báo dị ứng thời gian thực cho nhà bếp.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    actor Chef as Bếp trưởng / Đầu bếp
    participant FE as Frontend UI (React)
    participant BE as Backend API (Spring Boot)
    participant DB as Cơ sở dữ liệu (SQL Server)

    Customer->>FE: Truy cập thực đơn món ăn (Restaurant)
    FE->>BE: GET /api/menu (Đồng thời gửi kèm ID Khách hàng)
    BE->>DB: SELECT hồ sơ dị ứng y tế `medical_profile` của khách
    DB-->>BE: Trả về thông tin dị ứng (ví dụ: dị ứng đậu phộng)
    BE->>BE: Đối chiếu nguyên liệu các món trong thực đơn.<br/>Gắn nhãn cảnh báo đỏ cho các món chứa chất gây dị ứng.
    BE-->>FE: Trả về danh sách món đã lọc & cảnh báo
    FE-->>Customer: Hiển thị thực đơn cá nhân hóa (Món gây dị ứng bị cảnh báo)
    
    Customer->>FE: Chọn món & Gửi yêu cầu đặt món (Order)
    FE->>BE: POST /api/food-orders
    BE->>DB: INSERT INTO food_order & food_order_detail
    DB-->>BE: Ghi nhận thành công
    
    %% Kích hoạt cảnh báo bếp
    BE->>BE: Phát hiện món ăn đặt có nhãn dị ứng của khách hàng
    BE-->>FE: [SSE / Websocket] Gửi thông báo khẩn cấp đến Chef Dashboard
    FE->>Chef: Hiển thị thẻ đơn hàng nhấp nháy đỏ + Phát chuông cảnh báo dị ứng
    
    Chef->>Chef: Chế biến món ăn bằng dụng cụ riêng biệt
    Chef->>FE: Cập nhật trạng thái: READY / DELIVERED
    FE->>BE: PUT /api/food-orders/status
    BE->>DB: Cập nhật trạng thái đơn món ăn
    DB-->>BE: Thành công
    BE-->>FE: Trả về kết quả cập nhật
    FE-->>Chef: Hoàn tất đơn hàng bếp
```

---

## 🧾 Workflow 6: Hóa đơn Tổng hợp & Làm thủ tục Trả phòng (Module 5)

Quy trình kết xuất hóa đơn consolidated folio, thanh toán phần còn lại qua cổng VNPay và hoàn tất check-out.

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Khách hàng
    actor Receptionist as Nhân viên Lễ tân
    participant FE as Frontend UI (React)
    participant BE as Backend API (Spring Boot)
    participant DB as Cơ sở dữ liệu (SQL Server)

    Receptionist->>FE: Yêu cầu thực hiện Checkout cho phòng
    FE->>BE: GET /api/invoices/booking/{id}/recalculate
    
    Note over BE: Thực hiện tính toán Folio:<br/>1. Room Subtotal (Đơn giá x Số ngày)<br/>2. Extra Spa Charges (Lịch spa vượt gói)<br/>3. Add-on F&B (Gọi món ngoài thực đơn gói)<br/>4. Incurred Services (Tiền giặt là, mini-bar)
    
    BE->>DB: Truy vấn dữ liệu chi phí và tính toán tổng tiền
    DB-->>BE: Trả về kết quả
    BE->>DB: Cập nhật `invoice` tổng tiền, thuế VAT và `amount_due`
    BE-->>FE: Trả về thông tin Hóa đơn tổng hợp
    FE-->>Receptionist: Hiển thị bảng kê chi tiết hóa đơn (Folio Ledger)
    
    %% Kiểm tra nợ
    Receptionist->>FE: Nhấp nút "Xác nhận Checkout"
    FE->>BE: POST /api/checkout/confirm
    
    alt Số dư nợ lớn hơn 0 (amount_due > 0)
        BE-->>FE: Trả về lỗi: CHECKOUT-409 (Block Checkout do còn nợ)
        FE-->>Receptionist: Hiển thị cảnh báo và yêu cầu thanh toán số tiền còn lại
        
        Receptionist->>Guest: Yêu cầu thanh toán nợ còn lại
        Guest->>Receptionist: Chọn thanh toán bằng thẻ/VNPay
        Receptionist->>FE: Nhấp nút "Thanh toán VNPay nợ còn lại"
        FE->>BE: GET /api/payment/vnpay-url
        BE-->>FE: Trả về URL thanh toán VNPay
        FE->>Guest: Thực hiện quét mã QR / Thanh toán
        Guest-->>BE: Thanh toán thành công qua cổng VNPay
        BE->>DB: UPDATE invoice SET status = 'PAID', amount_due = 0
    end
    
    %% Cho phép checkout khi nợ = 0
    BE->>DB: UPDATE room_booking SET status = 'CHECKED_OUT'
    BE->>DB: UPDATE room SET status = 'DIRTY' (Yêu cầu buồng phòng dọn dẹp)
    DB-->>BE: Hoàn tất giao dịch
    
    %% Kết xuất hóa đơn PDF
    BE->>BE: Xuất tệp PDF hóa đơn bằng OpenPDF (Hỗ trợ tiếng Việt UTF-8)
    BE-->>FE: Trả về luồng file PDF hóa đơn
    FE-->>Receptionist: Hiển thị PDF hóa đơn và tự động tải về máy để in ấn
    Receptionist->>Guest: Giao hóa đơn thanh toán giấy & Tạm biệt khách
```
