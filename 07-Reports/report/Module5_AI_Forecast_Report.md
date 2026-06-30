# Báo Cáo Hoàn Thành Tính Năng: Tích Hợp AI Dự Báo Doanh Thu (Module 5 Add-on)

## 1. Tổng Quan

Theo định hướng nâng cấp hệ thống quản trị và tích hợp công nghệ thông minh (AI) phục vụ hoạt động vận hành tại resort Ngũ Sơn, nhóm phát triển đã tiến hành xây dựng và tích hợp thành công tính năng **Dự báo Doanh thu AI (AI Revenue Forecasting)** thuộc Bảng điều khiển của Quản lý (Manager Dashboard). 

Đặc thù đồ án môn học (SWP391) đòi hỏi tính năng phải hoạt động ổn định và tin cậy khi chấm bài bảo vệ trực tiếp trước Hội đồng chấm. Do đó, nhóm đã lựa chọn thiết kế hệ thống theo **Kiến trúc Lai (Hybrid Engine)**: Kết nối API Google Gemini AI trực tiếp khi có mạng internet và tự động rơi về (Fallback) thuật toán thống kê Hồi quy tuyến tính (Linear Regression) chạy hoàn toàn offline nếu mất mạng hoặc khóa API hết hạn ngạch.

---

## 2. Chi Tiết Triển Khai Backend (Spring Boot)

Hệ thống Backend được bổ sung các cấu phần mới để xử lý và cung cấp dữ liệu dự báo:
*   **`RevenueForecastDTO.java`**: Cấu trúc dữ liệu chứa danh sách các tháng dự báo tương lai (doanh thu chi tiết của Villa, Spa, và Thực phẩm), văn bản giải thích/nhận xét xu hướng từ AI (`aiAnalysis`) và phương pháp dự báo được sử dụng (`methodUsed`).
*   **`RevenueService.java` & `RevenueServiceImpl.java`**:
    *   Tự động truy vấn dữ liệu doanh thu thực tế của 12 tháng năm trước và các tháng của năm hiện tại thông qua `InvoiceRepository.findMonthlyRevenueBreakdown`.
    *   Tích hợp HTTP Client gửi request trực tiếp tới API Google Gemini (`gemini-1.5-flash`) bằng `HttpURLConnection` thô để giữ ứng dụng gọn nhẹ, không cài đặt thêm SDK cồng kềnh.
    *   Tự động làm sạch định dạng phản hồi JSON của Gemini thông qua hàm bổ trợ `cleanJsonResponse`.
    *   Xây dựng thuật toán **Hồi quy tuyến tính (Linear Regression)** chạy offline trên Java để tự tính toán phương trình xu hướng ($y = ax + b$) cho từng cấu phần dịch vụ nếu Gemini gặp sự cố mạng hoặc không có API Key.
    *   Hỗ trợ cơ chế tự động sinh dữ liệu cơ sở thực tế (Mock Baseline Data) nếu database trống, tránh lỗi hiển thị biểu đồ trắng.
*   **`RevenueController.java`**: Expose API REST an toàn `GET /api/revenue/forecast?months=N` (chỉ cho phép quyền `MANAGER` truy cập).

---

## 3. Chi Tiết Triển Khai Frontend (React Vite + Tailwind)

Giao diện Bảng điều khiển vận hành của Admin/Manager được nâng cấp nhằm mang lại trải nghiệm chuyên nghiệp và cao cấp:
*   **`api.js`**: Định nghĩa phương thức gọi API `paymentApi.getRevenueForecast`.
*   **`AdminOverview.jsx` (Giao diện Quản lý)**:
    1.  **Hệ thống Tab tương tác**: Cho phép Quản lý nhanh chóng chuyển đổi qua lại giữa hai chế độ: **Phân Tích Lịch Sử** (mặc định) và **✨ AI Dự Báo Doanh Thu**.
    2.  **Dropdown cấu hình chu kỳ**: Hỗ trợ lựa chọn dự báo nhanh trong **3 tháng**, **6 tháng**, hoặc **12 tháng** tiếp theo.
    3.  **Biểu đồ Cột Dự báo trực quan**: Vẽ biểu đồ cột xếp chồng tương tự biểu đồ lịch sử nhưng sử dụng kiểu dáng **đứt nét (dashed borders)** và màu sắc mờ đục (glassmorphism opacity) giúp nhà quản trị phân biệt dễ dàng đâu là dữ liệu dự kiến của tương lai.
    4.  **Khung phân tích AI (AI Insights Panel)**: Hiển thị nhận xét sâu sắc của AI về nguyên nhân tăng/giảm doanh thu và đưa ra khuyến nghị vận hành bằng tiếng Việt cực kỳ tự nhiên.
    5.  **Bản ghi phương pháp**: Hiển thị rõ mô hình toán học hoặc AI nào đang tạo ra dự báo này (ví dụ: `Phương pháp: Gemini AI`).

---

## 4. Kiểm Thử & Bảo Đảm Chất Lượng (TDD)

Quá trình phát triển tuân thủ quy trình kiểm thử nghiêm ngặt của dự án:
*   **EDS & TDD Specification**: Đã khởi tạo các tệp đặc tả kỹ thuật thiết kế [FORECAST_EDS.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/05-Development/backend/docs/FORECAST_EDS.md) và đặc tả kiểm thử [FORECAST_TDD.md](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/05-Development/backend/docs/FORECAST_TDD.md) theo chuẩn tài liệu ISO của dự án.
*   **Bộ Test Cases Unit Test**: Xây dựng [RevenueForecastServiceImplTest.java](file:///c:/Users/Administrator/Videos/FontendFor_SWP391/05-Development/backend/src/test/java/fu/se/smms/service/impl/RevenueForecastServiceImplTest.java) bao phủ các kịch bản:
    *   `REV-TC-01`: Tính toán dự báo hồi quy tuyến tính chạy offline chính xác theo xu hướng.
    *   `REV-TC-02`: Đảm bảo an toàn không crash và tự sinh dữ liệu cơ sở mẫu khi database rỗng.

---

## 5. Kết Luận & Đánh Giá

*   **Mức độ hoàn thành**: **100%** — Hệ thống hoạt động mượt mà cả khi online (dùng Gemini AI phân tích) lẫn khi offline hoàn toàn (dùng toán học hồi quy).
*   **Giá trị mang lại**: Giúp tối ưu hóa năng lực quản trị của Manager thông qua dự báo tài chính ngắn hạn và trung hạn, đồng thời tạo điểm nhấn công nghệ AI vượt trội cho đồ án SWP391 của nhóm.
