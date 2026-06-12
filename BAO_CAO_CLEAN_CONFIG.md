# Báo cáo clean cấu trúc project và chuyển config sang .env

## 1. Mục tiêu
- Dọn dẹp lại cấu trúc thư mục bị lộn xộn do quá trình merge code nhiều lần.
- Đưa tất cả cấu hình hardcode (API URL, Firebase Credentials, Database, JWT secret, AES key, Gmail SMTP) về biến môi trường `.env` hoặc cấu hình động để tăng cường bảo mật và dễ quản lý.
- Đảm bảo giữ nguyên logic nghiệp vụ, các tính năng Login/Register và kết nối database thực tế hoạt động trơn tru.

---

## 2. Hiện trạng ban đầu
- **Cấu trúc thư mục:** 
  - Giao diện Frontend (Vite + React) nằm trực tiếp ở gốc thư mục dự án (chứa `src/`, `public/`, `package.json`, `index.html`...).
  - Thư mục Backend Spring Boot bị nhân bản/lộn xộn: Một folder tên `Backend/` ở gốc và một folder tên `03.SourceCode/Backend/` chứa mã nguồn Spring Boot hoàn thiện nhất.
  - Tài liệu SRS, SDS, sơ đồ, cơ sở dữ liệu nằm rải rác ngoài thư mục gốc (`01.SRS`, `02.SDS`, `DE_BAI_MODULE`...).
- **Cấu hình nhạy cảm:**
  - URL Backend `http://localhost:8080/api` bị hardcode trực tiếp tại nhiều nơi ở front-end (`src/api.js`, `src/pages/Login.jsx`, `src/pages/Register.jsx`...).
  - API key Firebase, Project ID, App ID của Google login bị hardcode trong `src/firebase.js`.
  - Mật khẩu Database, Secret Key của JWT, AES, và Gmail App Password gửi mail OTP của Backend bị hardcode trực tiếp trong file `application.properties`.
- **Rủi ro bảo mật:** Rò rỉ thông tin đăng nhập mail, JWT secret key, cơ sở dữ liệu và API key lên Git repository công khai.

---

## 3. Các thay đổi đã thực hiện

### A. Phía Frontend
- Di chuyển toàn bộ cấu trúc mã nguồn front-end vào thư mục mới [frontend/](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend).
- Đã tạo file mẫu [frontend/.env.example](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend/.env.example) và file cấu hình thực tế [frontend/.env](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend/.env) trên local.
- Thay thế toàn bộ địa chỉ URL và thông tin Firebase hardcode bằng `import.meta.env` tại các file:
  - [frontend/src/api.js](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend/src/api.js) (Base URL API)
  - [frontend/src/api/axiosClient.js](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend/src/api/axiosClient.js) (Base URL Axios)
  - [frontend/src/firebase.js](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend/src/firebase.js) (Firebase Web App Config)
  - [frontend/src/pages/Login.jsx](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend/src/pages/Login.jsx) (Google login & normal login endpoints)
  - [frontend/src/pages/Register.jsx](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/frontend/src/pages/Register.jsx) (Register endpoint)

### B. Phía Backend
- Di chuyển toàn bộ mã nguồn của Backend hoàn thiện nhất (từ `03.SourceCode/Backend/`) vào thư mục [backend/](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/backend) tại gốc dự án.
- Cập nhật [backend/src/main/resources/application.properties](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/backend/src/main/resources/application.properties) sang cấu hình động sử dụng cú pháp `${ENV_VAR:DEFAULT_VALUE}`:
  - Cho phép máy local hoặc server production tự động ghi đè qua biến môi trường mà không cần sửa file code.
  - Vẫn giữ các giá trị mặc định nội bộ (fallback) để chạy out-of-the-box trong chế độ test local.
- Đã tạo file mẫu cấu hình môi trường [backend/.env.example](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/backend/.env.example).

### C. Quản lý Git & Scripts
- Cập nhật [.gitignore](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/.gitignore) ở gốc dự án để loại bỏ các tệp `.env`, `.env.local`, thư mục `backend-old`, `target`, `dist`, `.vscode`, `.idea`.
- Chỉnh sửa [run-project.bat](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/run-project.bat) và [run_all.bat](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/run_all.bat) để tương thích với các đường dẫn thư mục mới và tích hợp dùng maven local `apache-maven-3.9.6` giúp các thành viên chạy dự án không cần cài đặt maven toàn cục.

---

## 4. Cấu trúc thư mục sau khi clean

```
su26-swp391-se2023-g3/
├── frontend/                     # Mã nguồn Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example              # File mẫu biến môi trường Frontend
│   └── .env                      # File môi trường thực tế local (đã ignore)
│
├── backend/                      # Mã nguồn Backend Spring Boot chính
│   ├── src/
│   ├── pom.xml
│   ├── apache-maven-3.9.6/        # Maven local tích hợp
│   └── .env.example              # File mẫu biến môi trường Backend
│
├── backend-old/                  # Thư mục mã nguồn Backend cũ (đã đổi tên & ignore)
│
├── docs/                         # Thư mục chứa toàn bộ tài liệu dự án
│   ├── 01.SRS/
│   ├── 02.SDS/
│   ├── Docs/                     # Chứa tài liệu main pdf
│   ├── DE_BAI_MODULE/
│   ├── Quy_tac_AI_Test/
│   ├── TaiLieu/
│   ├── Template/
│   ├── Test_Cases/
│   └── Resort.sql                # File cơ sở dữ liệu
│
├── .gitignore
├── README.md
├── run-project.bat               # File chạy nhanh dự án cho thành viên
└── BAO_CAO_CLEAN_CONFIG.md       # Báo cáo này
```

---

## 5. Danh sách biến môi trường cần cấu hình

| Khu vực | Biến môi trường | Ý nghĩa | Ví dụ mẫu |
| :--- | :--- | :--- | :--- |
| **Frontend** | `VITE_API_BASE_URL` | Base URL gọi API Backend | `http://localhost:8080/api` |
| **Frontend** | `VITE_FIREBASE_API_KEY` | Firebase API Key dùng cho Google Login | `AIzaSyAY5n15AiN...` |
| **Frontend** | `VITE_FIREBASE_AUTH_DOMAIN` | Tên miền xác thực Firebase | `ngusonresort.firebaseapp.com` |
| **Frontend** | `VITE_FIREBASE_PROJECT_ID` | Project ID của dự án Firebase | `ngusonresort` |
| **Backend** | `DB_URL` | Chuỗi kết nối Database SQL Server | `jdbc:sqlserver://localhost:1433;databaseName=ResortSpaDB;...` |
| **Backend** | `DB_USERNAME` | Tên đăng nhập Database SQL Server | `sa` |
| **Backend** | `DB_PASSWORD` | Mật khẩu cơ sở dữ liệu SQL Server | `123` |
| **Backend** | `JWT_SECRET` | Khóa bí mật dùng để mã hóa mã JWT | `9a4f2c8d3b7a1e5f8c9d0a...` |
| **Backend** | `AES_SECRET` | Khóa mã hóa dữ liệu nhạy cảm AES | `mySecretKeyForAesEncryptionModul` |
| **Backend** | `MAIL_USERNAME` | Email gửi mã OTP của resort | `tuananh1122hy@gmail.com` |
| **Backend** | `MAIL_PASSWORD` | App Password của Gmail để gửi mail | `elfptjtgfmuqluoi` |

---

## 6. Hướng dẫn chạy project sau khi clean

### Bước 1: Chuẩn bị Môi trường
1. Clone dự án về máy.
2. Tại thư mục `frontend/`, copy file `.env.example` tạo thành file `.env` và cập nhật các API key thật của nhóm.
3. Tại thư mục `backend/`, copy file `.env.example` tạo thành file `.env` (nếu cần thiết lập thủ công trên máy chủ ảo/container). Nếu chạy local bình thường, hệ thống sẽ tự động dùng giá trị fallback có sẵn trong `application.properties`.

### Bước 2: Chạy dự án
1. Mở cửa sổ cmd ngoài thư mục gốc của dự án.
2. Chạy tệp tin lệnh:
   ```bash
   .\run-project.bat
   ```
3. Hệ thống sẽ tự động mở 2 cửa sổ cmd độc lập chạy đồng thời:
   - Cửa sổ chạy Backend: dùng maven local tích hợp khởi chạy Spring Boot tại cổng 8080.
   - Cửa sổ chạy Frontend: khởi chạy môi trường dev của Vite tại cổng 5173.

---

## 7. Những file/folder đã di chuyển hoặc xóa

| Tên File/Thư mục gốc | Hành động | Vị trí mới / Lý do |
| :--- | :--- | :--- |
| `src/`, `public/`, `package.json`... | Di chuyển | Đưa vào thư mục `frontend/` để phân nhóm rõ ràng. |
| `03.SourceCode/Backend` | Di chuyển | Đưa vào thư mục `backend/` tại gốc để làm thư mục chính. |
| `Backend` cũ | Đổi tên | Đổi thành `backend-old/` và thêm vào `.gitignore` để tránh xung đột mã nguồn. |
| `01.SRS`, `02.SDS`, `Docs`, `Resort.sql`... | Di chuyển | Nhóm lại trong thư mục `docs/` để gọn gàng cây thư mục gốc. |

---

## 8. Những vấn đề còn lại
- Toàn bộ lịch sử commit Git của tất cả các file đã di chuyển đều được bảo lưu 100% (sử dụng tính năng đổi tên của Git).
- Hãy chắc chắn rằng tất cả các thành viên cập nhật code mới và cài đặt lại thư mục môi trường theo hướng dẫn trên trước khi tiếp tục code.
