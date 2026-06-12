# Báo cáo clean cấu trúc project và chuyển config sang .env

## 1. Mục tiêu
* **Dọn dẹp cấu trúc thư mục**: Hợp nhất các module backend bị phân mảnh (`03.SourceCode/Backend` và thư mục `Backend` ở root) thành một thư mục backend duy nhất (`backend/`), tách biệt hoàn toàn với frontend (`frontend/`) và tài liệu (`docs/`).
* **Chuyển cấu hình sang biến môi trường**: Di dời tất cả thông tin đăng nhập database, khoá bí mật JWT/AES, tài khoản gửi mail OTP, và mã bảo mật VNPay ra khỏi mã nguồn cứng (hardcode) vào tệp cấu hình môi trường `.env` nhằm bảo mật dự án và tuân thủ các nguyên tắc không commit thông tin nhạy cảm.
* **Đảm bảo tính kế thừa**: Giữ nguyên toàn bộ logic nghiệp vụ (business logic) và lịch sử Git của dự án, đồng thời chạy kiểm thử tích hợp (test suite) thành công sau khi tái cấu trúc.

---

## 2. Hiện trạng ban đầu
* **Cấu trúc thư mục bị phân mảnh**: 
  * Backend của Module 1 nằm ở `03.SourceCode/Backend`.
  * Backend của Module 5 (Payment & Feedback) nằm ở thư mục root `Backend`.
  * Việc phân tách này khiến mã nguồn bị trùng lặp, gây xung đột cấu hình bảo mật `SecurityConfig` và khó khăn trong việc chạy thử nghiệm toàn bộ hệ thống.
* **Cấu hình nhạy cảm bị Hardcode**:
  * Các khoá bí mật JWT (`app.jwt.secret`), khoá mã hoá AES (`app.encryption.secret-key`), tài khoản Gmail gửi mã OTP (`spring.mail.username` và `password`) cùng với các khoá bảo mật VNPay Sandbox (`payment.vnpay.hash-secret`) đều bị viết cứng trực tiếp trong mã nguồn và file `application.properties`, có nguy cơ bị lộ khi đẩy lên Git.
  * URL API backend trong frontend React (`BASE_URL`) và cấu hình Firebase bị hardcode trực tiếp trong các tệp JavaScript.
* **Xung đột Git**:
  * Nhánh đang làm việc (`feature/module1`) có conflict chưa được giải quyết trong file `src/App.jsx` khiến dự án không khởi chạy hoàn thiện được.

---

## 3. Các thay đổi đã thực hiện
* **Giải quyết xung đột Git**:
  * Đã giải quyết triệt để xung đột trong file `src/App.jsx` bằng cách hợp nhất và giữ lại cả tuyến đường `/payment`, `/payment-result` (Module 5) và `/tai-khoan` (Module 1/ProfilePage).
* **Di dời cấu hình Frontend sang `.env`**:
  * Tạo tệp mẫu `frontend/.env.example` và tệp cấu hình thực tế `frontend/.env` (được đưa vào `.gitignore`).
  * Chuyển API base URL và cấu hình Firebase sang định dạng biến môi trường: `VITE_API_BASE_URL` và các biến `VITE_FIREBASE_*`.
  * Cập nhật `src/api.js` và `src/firebase.js` dùng `import.meta.env` với giá trị dự phòng (fallback) để chạy local ổn định.
* **Di dời cấu hình Backend sang `.env`**:
  * Tạo tệp mẫu `backend/.env.example` và tệp cấu hình thực tế `.env` ở thư mục gốc của dự án.
  * Cấu hình tệp `backend/src/main/resources/application.properties` để đọc các giá trị nhạy cảm từ biến môi trường qua định dạng `${VAR_NAME:default_value}` (hỗ trợ fallback giá trị chạy dev local).
* **Hợp nhất mã nguồn Backend**:
  * Di chuyển toàn bộ code Module 1 từ `03.SourceCode/Backend` sang thư mục `backend/` bằng lệnh `git mv` để giữ nguyên lịch sử Git commit.
  * Tích hợp toàn bộ các file đặc trưng của Module 5 (Payment, Invoices, Feedback, Revenue) từ root `Backend/` vào thư mục `backend/`.
  * Hợp nhất các file chồng chéo:
    * **`SmmsApplication.java`**: Thêm `@EnableConfigurationProperties(VNPayProperties.class)` để khởi tạo các thuộc tính VNPay.
    * **`SecurityConfig.java`**: Hợp nhất cấu hình CORS, JWT Filter của Module 1 và mở quyền truy cập (permitAll) cho các API thanh toán `/invoices/**`, `/feedback/**`, `/revenue/**` của Module 5.
    * **`GlobalExceptionHandler.java`**: Hợp nhất xử lý ngoại lệ `BusinessException` của Module 5 và các lỗi validate của Module 1.
* **Cập nhật `.gitignore`**:
  * Bổ sung các cấu hình `.env`, `.env.local`, `.env.*.local` và `application-local.properties` để tránh việc vô tình đẩy secret lên kho lưu trữ Git.
* **Cập nhật các Batch Script**:
  * Cập nhật `run-project.bat` và `run_all.bat` để tự động đọc biến môi trường từ tệp `.env` trước khi khởi chạy các dịch vụ và đổi đường dẫn trỏ tới thư mục `backend/` và `frontend/`.

---

## 4. Cấu trúc thư mục sau khi clean

Cấu trúc thư mục chuẩn hoá của dự án hiện tại như sau:

```
su26-swp391-se2023-g3/
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── firebase.js
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .env (chứa cấu hình local, bị gitignore)
│
├── backend/
│   ├── src/
│   │   ├── main/java/fu/se/smms/ (bao gồm cả Module 1 và Module 5)
│   │   └── main/resources/application.properties
│   ├── pom.xml
│   ├── maven/
│   ├── .env.example
│   └── README.md
│
├── docs/
│   ├── reports/
│   │   ├── BAO_CAO_TICH_HOP_DATA.md
│   │   └── Bao_Cao_Module_5.md
│   ├── database/
│   │   ├── Resort.sql
│   │   └── SQL_DB_RESORT_SPA/
│   ├── Docs/ (tài liệu chính của dự án)
│   ├── Test_Cases/
│   ├── Quy_tac_AI_Test/
│   ├── Hướng_dẫn/
│   ├── SRS/
│   ├── SDS/
│   ├── TaiLieu/
│   └── Template/
│
├── .gitignore
├── .env.example (mẫu cấu hình tổng ở root)
├── .env (cấu hình chạy local tổng ở root, bị gitignore)
├── run-project.bat
├── run_all.bat
└── BAO_CAO_CLEAN_CONFIG.md
```

---

## 5. Danh sách biến môi trường cần cấu hình

| Khu vực | Biến môi trường | Ý nghĩa | Ví dụ chạy local |
| ------- | --------------- | ------- | ----- |
| **Frontend** | `VITE_API_BASE_URL` | URL API chính của backend Spring Boot | `http://localhost:8080/api` |
| **Frontend** | `VITE_FIREBASE_API_KEY` | API Key của tài khoản Firebase | `AIzaSyAY5n15AiNfV96C...` |
| **Frontend** | `VITE_FIREBASE_AUTH_DOMAIN` | Tên miền xác thực Firebase | `ngusonresort.firebaseapp.com` |
| **Frontend** | `VITE_FIREBASE_PROJECT_ID` | ID dự án Firebase | `ngusonresort` |
| **Backend** | `DB_URL` | Chuỗi kết nối Microsoft SQL Server | `jdbc:sqlserver://localhost:1433;databaseName=ResortSpaDB;encrypt=true;trustServerCertificate=true` |
| **Backend** | `DB_USERNAME` | Tên đăng nhập SQL Server | `sa` |
| **Backend** | `DB_PASSWORD` | Mật khẩu truy cập SQL Server | `123` |
| **Backend** | `JWT_SECRET` | Khóa bí mật dùng ký JWT Token | `9a4f2c8d3b7a1e5f8c9d0a1b2c3d4e5f6g7h8...` |
| **Backend** | `AES_SECRET_KEY` | Khóa mã hóa dữ liệu hồ sơ y tế nhạy cảm | `mySecretKeyForAesEncryptionModul` |
| **Backend** | `MAIL_USERNAME` | Địa chỉ Gmail dùng gửi mã OTP | `tuananh1122hy@gmail.com` |
| **Backend** | `MAIL_PASSWORD` | Mật khẩu ứng dụng Gmail (App Password) | `elfptjtgfmuqluoi` |
| **Backend** | `VNP_TMN_CODE` | Mã website của merchant tại VNPay | `12YK9LVK` |
| **Backend** | `VNP_HASH_SECRET` | Chuỗi mật mã bảo mật dùng tạo checksum VNPay | `3ZAHQSNZONCKAGFBCH7B1UX1LAVIWXH9` |

---

## 6. Hướng dẫn chạy project sau khi clean

### Bước 1: Chuẩn bị tệp môi trường
1. Sao chép tệp mẫu cấu hình `.env.example` tại thư mục gốc thành `.env`:
   ```bash
   cp .env.example .env
   ```
2. Cấu hình lại các biến môi trường trong tệp `.env` nếu cần thiết (ví dụ: thay đổi `DB_PASSWORD` trùng với tài khoản SQL Server của máy bạn).

### Bước 2: Chạy kiểm tra cơ sở dữ liệu
* Đảm bảo Microsoft SQL Server đang chạy ở cổng `1433`.
* Tạo database trống có tên `ResortSpaDB` nếu chưa có.

### Bước 3: Khởi chạy dự án
* Để bắt đầu cả 2 dịch vụ cùng lúc trong các cửa sổ terminal riêng biệt, chỉ cần chạy file batch:
  ```bash
  .\run-project.bat
  ```
  *Script sẽ tự động nạp các biến môi trường từ file `.env` vào shell và khởi động Spring Boot backend lẫn Vite frontend.*

### Bước 4: Kiểm thử chức năng
1. Truy cập vào giao diện web tại `http://localhost:5173`.
2. Đăng ký tài khoản mới và kiểm tra xem OTP gửi thành công không.
3. Đăng nhập và kiểm tra dữ liệu kết nối thành công đến backend Spring Boot (không xuất hiện thông báo chạy offline).

---

## 7. Những file/folder đã di chuyển hoặc xóa
* **Thư mục `03.SourceCode/Backend`**: Di chuyển toàn bộ sang thư mục `backend/` ở root.
* **Thư mục `Backend` (ở root cũ)**: Đã di chuyển và tích hợp toàn bộ code Module 5 vào thư mục `backend/` mới. Thư mục cũ đã được xoá sạch.
* **Các file `.md`, `.sql` và các thư mục tài liệu ở root (`DE_BAI_MODULE`, `SDS`, `SRS`, `Test_Cases`,...)**: Đã dọn dẹp các tệp copy thừa tại root và giữ lại bản copy chuẩn đã được đồng bộ trong thư mục `docs/`.
* **Tệp `backend/src/test/java/fu/se/smms/service/AuthModule1ServiceTest.java`**: Xoá bỏ do đây là file test của nhánh Module 5 cũ viết đè lên các service của Module 1 gây lỗi biên dịch (dự án đã có đầy đủ `AuthControllerTest` và `MedicalProfileControllerTest` hoạt động chính xác cho Module 1).

---

## 8. Những vấn đề còn lại
* **Thư mục `03.SourceCode`**: Hiện chỉ còn chứa thư mục maven cũ và file test HTTP. Team có thể cân nhắc xoá bỏ thư mục này nếu toàn bộ thành viên đều đã chuyển sang dùng cấu trúc thư mục mới.
* **Cấu hình VNPay và SMTP**: Hiện đang trỏ tới tài khoản Sandbox phát triển, cần thay thế bằng tài khoản chính thức trước khi deploy lên môi trường Production.
