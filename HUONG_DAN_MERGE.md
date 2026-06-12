# Hướng Dẫn Lấy Code (Fetch) và Gộp (Merge) Nhánh `feature/module1`

Tài liệu này hướng dẫn chi tiết các bước chúng tôi đã thực hiện để gộp code từ nhánh `origin/feature/module1` vào nhánh làm việc hiện tại của bạn (`feature/module4`), đồng thời giải thích cách giải quyết các xung đột (conflict) cấu trúc thư mục trên Windows.

---

## 1. Tổng Quan Quá Trình Đã Thực Hiện

Chúng tôi đã hoàn thành việc gộp nhánh `feature/module1` vào nhánh `feature/module4` của bạn với các bước chính sau:
1. **Lưu tạm thời (Stash) các thay đổi chưa commit:** Đảm bảo thư mục làm việc sạch sẽ trước khi merge để tránh mất dữ liệu.
2. **Tải về (Fetch) các cập nhật mới nhất:** Thực hiện `git fetch origin` để lấy danh sách các commit mới của nhánh `feature/module1`.
3. **Gộp nhánh (Merge):** Chạy `git merge origin/feature/module1`.
4. **Giải quyết các xung đột cấu trúc (Directory Restructuring Conflicts):** Nhánh `feature/module1` đã đổi tên thư mục gốc `src` thành `frontend/src` và `Backend` thành `backend`. Trên hệ điều hành Windows (không phân biệt chữ hoa/chữ thường), điều này gây ra lỗi xung đột tên file trùng lặp trong Git index (cả `Backend/` và `backend/` cùng tồn tại). Chúng tôi đã đưa toàn bộ code về dạng chữ thường `backend/` theo chuẩn mới của nhánh remote.
5. **Giải quyết xung đột nội dung file:**
   - `.gitignore`: Gộp các quy tắc loại bỏ của cả 2 nhánh.
   - `backend/pom.xml`: Giữ phiên bản Java 17 đang cài đặt trên máy của bạn và tích hợp thêm biến phiên bản JWT của Module 1.
   - `frontend/src/App.jsx`: Gộp các import và router của cả Dashboard khách hàng và trang thanh toán.
   - `frontend/src/pages/BookingPage.jsx`: Tích hợp các bước từ 5 bước (của Module 1) và phần chọn thực đơn trong gói (F&B) thành một quy trình **6 bước hoàn chỉnh**:
     1. *Bước 1: Thông tin khách*
     2. *Bước 2: Hồ sơ sức khỏe (Decree 356)*
     3. *Bước 3: Chọn Villa & Dịch vụ*
     4. *Bước 4: Chọn Thực đơn trong gói (F&B)*
     5. *Bước 5: Xác nhận đơn đặt*
     6. *Bước 6: Thanh toán cọc*
6. **Khôi phục lại thay đổi chưa commit (Stash Pop):** Áp dụng lại các file bạn đang làm việc dở dang lúc đầu và hoàn tất commit.

---

## 2. Hướng Dẫn Từng Bước Cho Bạn Tự Thực Hiện Trong Tương Lai

Khi bạn muốn lấy code từ một nhánh khác (ví dụ `feature/moduleX`) về và gộp vào nhánh của bạn, hãy làm theo các bước sau:

### Bước 2.1: Cất giữ các thay đổi chưa commit (Stash)
Để đảm bảo quá trình gộp nhánh không bị ghi đè lên những file bạn đang sửa dở, hãy chạy:
```bash
git stash
```

### Bước 2.2: Cập nhật thông tin từ Remote
Lấy danh sách các commit và nhánh mới nhất từ GitLab:
```bash
git fetch origin
```

### Bước 2.3: Thực hiện lệnh gộp nhánh (Merge)
Chạy lệnh merge nhánh cần gộp vào nhánh hiện tại của bạn:
```bash
git merge origin/feature/module1
```

### Bước 2.4: Xử lý các xung đột cấu trúc thư mục (Nếu có)
Nếu nhánh remote có cấu trúc thư mục viết thường (`backend/...`) nhưng local của bạn vẫn giữ chữ hoa (`Backend/...`), Git trên Windows có thể bị bối rối và theo dõi cả hai phiên bản trong Git index. 

Cách xử lý triệt để:
1. Kiểm tra các file bị trùng lặp bằng cách liệt kê danh sách file đang theo dõi:
   ```bash
   git ls-files
   ```
2. Loại bỏ các đường dẫn viết hoa khỏi Git Index (nhưng giữ lại file trên ổ cứng):
   ```bash
   git rm --cached -r Backend/
   ```
3. Thêm lại các file đó bằng đường dẫn viết thường để đồng bộ:
   ```bash
   git add backend/
   ```
4. Tiến hành commit merge:
   ```bash
   git commit -m "Merge branch 'feature/module1' and resolve directory casing"
   ```

### Bước 2.5: Áp dụng lại các thay đổi cũ của bạn
Sau khi merge thành công, hãy khôi phục lại các file sửa dở lúc trước:
```bash
git stash pop
```
*Lưu ý: Nếu có xung đột giữa code bạn sửa dở và code mới gộp, Git sẽ báo conflict ở các file cụ thể. Hãy mở các file đó lên, tìm các ký tự `<<<<<<<`, `=======`, `>>>>>>>` để chọn giữ lại code phù hợp, lưu lại rồi chạy `git add <tên file>` và `git commit`.*

---

## 3. Xác Minh Dự Án Sau Khi Gộp

Sau khi gộp code thành công, hãy kiểm tra lại hoạt động của dự án:

### Khởi động Backend (Java Spring Boot)
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Dọn dẹp và chạy thử dự án:
   ```bash
   mvn clean spring-boot:run
   ```

### Khởi động Frontend (React / Vite)
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện mới (nếu nhánh kia có bổ sung thư viện):
   ```bash
   npm install
   ```
3. Khởi động môi trường dev:
   ```bash
   npm run dev
   ```

Dự án hiện tại của bạn đã được gộp hoàn toàn sạch sẽ, lịch sử commit rõ ràng và không còn file dư thừa nào.
