# AI TEAM RULES - Quy tắc chung cho AI và thành viên khi code nhóm

> File này là tài liệu bắt buộc phải đọc trước khi AI hoặc thành viên trong nhóm thực hiện bất kỳ thay đổi code nào trong dự án **Ngũ Sơn Resort & Spa Management System**.

Mục tiêu:

- Giữ code đồng bộ giữa nhiều người.
- Tránh AI tự ý phá kiến trúc, database, API contract hoặc UI flow.
- Đảm bảo mỗi UC có test case rõ ràng trước khi nghiệm thu.
- Giảm lỗi merge, lỗi lệch database/entity, lỗi phân quyền, lỗi thanh toán và lỗi dữ liệu nhạy cảm.

---

## 1. Quy tắc bắt buộc trước khi code

Trước khi code, AI/dev phải đọc theo đúng thứ tự:

1. `Quy_tac_AI_Test/AI_TEAM_RULES.md` - file hiện tại.
2. `README.md` - overview project.
3. `SRS/SRS_Summary.md` - actors, module, business requirement.
4. `SRS/BUSINESS_PROCESS.md` hoặc `Quy_tac_AI_Test/BUSINESS_PROCESS.md` - business flow.
5. `SDS/BACKEND_ARCHITECTURE.md` nếu sửa backend/API.
6. `SDS/DATABASE_DESIGN.md` và `SQL_DB_RESORT_SPA/resort_spa_db.sql` nếu sửa entity/repository/database.
7. `Test_Cases/README.md` và file `Test_Cases/UCxx_*_TESTCASE.md` nếu UC đã có.
8. `Template/EDS_TEMPLATE_V2.0.md` và `Template/TDD_TEMPLATE_V1.md` nếu cần tạo tài liệu mới.

Nếu chưa đọc tài liệu liên quan, không được đoán nghiệp vụ.

---

## 2. Quy tắc phạm vi thay đổi

### 2.1 Chỉ sửa đúng phạm vi task

Không được tự ý sửa file ngoài phạm vi UC/task trừ khi:

- Có bug compile/test bắt buộc phải sửa.
- Có dependency trực tiếp.
- Đã ghi rõ lý do trong báo cáo cuối.

### 2.2 Không phá code của người khác

- Không xóa component/service/controller/entity không thuộc task.
- Không rename API path, DTO field, database column nếu không có yêu cầu rõ ràng.
- Không đổi format dữ liệu trả về nếu frontend/backend bên còn lại đang phụ thuộc.
- Không xóa comment nghiệp vụ quan trọng.
- Không tự ý xóa mock data nếu UI hiện tại vẫn cần để demo.

### 2.3 Không tạo duplicate pattern

Trước khi tạo file/class/component mới, phải search xem đã có phần tương tự chưa.

Ví dụ:

- Có `axiosClient.js` thì không tạo thêm client HTTP khác nếu không cần.
- Có `Button.jsx`, `Card.jsx`, `Table.jsx` thì ưu tiên dùng lại component UI chung.
- Có service/repository/controller cùng module thì mở rộng đúng chỗ thay vì tạo bản song song.

---

## 3. Quy tắc kiến trúc frontend

Stack hiện tại:

- React
- Vite
- React Router
- Tailwind CSS / CSS hiện có
- Lucide React
- `src/api/axiosClient.js`

### 3.1 Component structure

Ưu tiên cấu trúc:

```text
src/
├── api/
├── components/
│   ├── ui/
│   ├── admin/
│   ├── staff/
│   ├── chef/
│   └── specialist/
├── pages/
├── styles/
└── mockData.js
```

Quy tắc:

- Page chịu trách nhiệm layout cấp trang và route-level state.
- Component chịu trách nhiệm UI nhỏ/tái sử dụng.
- API call gom ở `src/api` hoặc service API tương ứng.
- Không gọi `fetch/axios` rải rác khắp component nếu có thể gom lại.
- Không hardcode base URL trong nhiều file; dùng config/axios client.

### 3.2 UI/UX consistency

- Dùng design system/style hiện có trước khi thêm style mới.
- Loading state phải rõ ràng khi gọi API.
- Error state phải hiển thị thông báo dễ hiểu.
- Empty state phải có hướng dẫn người dùng.
- Form phải validate trước khi submit.
- Không hiển thị dữ liệu nhạy cảm cho role không được phép.

### 3.3 Mock data

Mock data chỉ dùng khi:

- Backend chưa có API.
- Đang demo giao diện độc lập.
- Có comment/TODO rõ ràng endpoint sẽ thay thế.

Khi backend đã có API:

- Ưu tiên tích hợp API thật.
- Không để UI vừa gọi API vừa dùng mock gây lệch dữ liệu.

---

## 4. Quy tắc kiến trúc backend

Stack backend:

- Java
- Spring Boot
- Maven
- Spring Data JPA
- Spring Security/JWT nếu có
- SQL Server

### 4.1 Layering bắt buộc

```text
Controller -> Service -> Repository -> Database
DTO <-> Service/Entity mapping rõ ràng
```

Quy tắc:

- Controller chỉ nhận request, validate input, gọi service, trả response.
- Service chứa business logic, transaction, state transition, calculation.
- Repository chỉ truy vấn dữ liệu.
- Entity phải map đúng database thật.
- DTO không được leak field nội bộ hoặc sensitive field nếu không cần.

### 4.2 Exception handling

- Không dùng `catch (Exception e)` chung chung nếu không xử lý có mục đích.
- Lỗi nghiệp vụ phải dùng exception rõ nghĩa, có HTTP status phù hợp.
- Không trả stack trace ra client.
- Error response nên có code/message nhất quán.

Gợi ý mã lỗi:

| Module | Prefix |
| :--- | :--- |
| Authentication | `AUTH` |
| Booking | `BOOK` |
| Payment/Invoice | `PAY` hoặc `INV` |
| Spa/Schedule | `SPA` |
| Food/Menu/Order | `FOOD` |
| Admin | `ADM` |
| Staff | `STAFF` |

---

## 5. Quy tắc database/entity

Database thật là nguồn sự thật cao nhất khi map entity:

```text
SQL_DB_RESORT_SPA/resort_spa_db.sql
```

Bắt buộc:

- Entity field type phải khớp DDL.
- Table/column name phải khớp DDL.
- Enum/status phải khớp constraint trong DB.
- Field tiền tệ dùng `BigDecimal`, không dùng `float/double`.
- Không tự ý đổi schema nếu không có migration/script rõ ràng.
- Không lưu plaintext cho dữ liệu nhạy cảm như passport/medical condition nếu yêu cầu mã hóa.

Nếu phát hiện code và database lệch nhau:

1. Ghi vào tài liệu test/EDS mục `Logic Issues Resolved`.
2. Chọn hướng sửa theo DB hoặc theo requirement đã được thống nhất.
3. Cập nhật test case để bắt lỗi lệch đó.

---

## 6. Quy tắc bảo mật và phân quyền

### 6.1 Authentication/Authorization

- API nhạy cảm phải yêu cầu login.
- API theo role phải kiểm tra role ở backend, không chỉ ẩn button ở frontend.
- Frontend không được tin role từ localStorage nếu backend không xác nhận.
- Không expose endpoint admin cho customer.

### 6.2 Sensitive data

Dữ liệu nhạy cảm trong dự án:

- Hồ sơ sức khỏe/bệnh lý.
- Dị ứng thực phẩm.
- Passport/CCCD.
- Thông tin thanh toán.
- Token/JWT/password.

Quy tắc:

- Không log password/token/full medical note/passport.
- Không ghi secret thật vào markdown hoặc source code.
- Chef chỉ được thấy thông tin liên quan dị ứng/dietary, không xem full medical note nếu không có quyền.
- Specialist được xem hồ sơ trị liệu cần thiết theo nghiệp vụ.
- Admin/Manager xem báo cáo theo quyền, không mặc định xem mọi thông tin nhạy cảm nếu không cần.

---

## 7. Quy tắc nghiệp vụ quan trọng

Các rule sau phải được giữ đồng bộ trong frontend/backend/database/test:

### 7.1 Booking/Payment

- Khách đặt cọc online 30% để giữ phòng/gói.
- Khi đặt cọc thành công, booking phải chuyển trạng thái phù hợp, ví dụ `CONFIRMED`.
- Khi check-out, lễ tân thu 70% còn lại + phụ phí phát sinh.
- Invoice phải tổng hợp lodging, spa, food, extra charge.
- Không được tạo thanh toán mới cho invoice đã `PAID`.
- Callback thanh toán phải verify chữ ký/hash.
- Callback lặp lại phải idempotent, không làm sai trạng thái.

### 7.2 Spa/Yoga/Therapy

- Lịch trị liệu phải xét khách hàng, chuyên gia, phòng trị liệu, thời gian.
- Không double-book cùng chuyên gia/phòng cùng thời điểm.
- Package có thể bao gồm số buổi complimentary; ngoài quota phải tính phí.

### 7.3 Food/Dietary

- Đơn bếp phải hiển thị cảnh báo dị ứng/dietary tag cần thiết.
- Không được để món có thành phần gây dị ứng đi qua mà không warning.
- Chef không cần xem toàn bộ medical record.

### 7.4 Admin/Report

- Báo cáo doanh thu phải lấy từ dữ liệu invoice/payment thật.
- Không dùng mock cho báo cáo nếu backend đã có dữ liệu.
- Số tiền phải tính bằng `BigDecimal` ở backend.

---

## 8. Quy tắc test bắt buộc

Mỗi UC phải có file test case trong `Test_Cases/`.

Trước khi báo hoàn thành task, AI/dev phải:

- [ ] Cập nhật test case liên quan.
- [ ] Chạy build/test phù hợp.
- [ ] Ghi command đã chạy.
- [ ] Ghi test nào pass/fail/blocked.
- [ ] Nếu không chạy được test, ghi rõ lý do.

### 8.1 Minimum test per UC

| UC có tính chất | Test bắt buộc |
| :--- | :--- |
| Có API | Happy path, validation error, not found/conflict |
| Có auth/role | 401 unauthenticated, 403 forbidden, allowed role |
| Có DB write | DB state sau action, rollback/cleanup |
| Có payment | valid callback, invalid signature, duplicate callback, paid invoice guard |
| Có UI form | validation, loading, success, error |
| Có sensitive data | masking/no leak/no plaintext log |
| Có state | valid transition, invalid transition |

---

## 9. Quy tắc Git/PR cho làm việc nhóm

### 9.1 Commit/branch naming gợi ý

```text
feature/UC03-payment-invoice
fix/UC02-booking-status
chore/update-testcase-template
```

Commit message gợi ý:

```text
feat(payment): implement cash payment settlement
fix(booking): prevent duplicate confirmed booking
test(pay): add VNPay invalid hash case
docs(test): add UC03 payment testcase
```

### 9.2 Pull Request checklist

PR không nên merge nếu thiếu:

- [ ] Mô tả UC/task.
- [ ] Danh sách file chính đã sửa.
- [ ] API endpoint thay đổi nếu có.
- [ ] DB thay đổi nếu có.
- [ ] Test case file đã cập nhật.
- [ ] Build/test evidence.
- [ ] Screenshot nếu sửa UI.
- [ ] Known issues nếu còn lỗi.

---

## 10. Quy tắc dành riêng cho AI khi trả kết quả

Khi AI hoàn thành task code/docs, phải báo cáo theo format:

```markdown
## Đã làm
- ...

## File đã tạo/sửa
- `path/to/file`

## Test/Build đã chạy
- `command` - Pass/Fail/Blocked

## Lưu ý/Rủi ro
- ...

## Việc tiếp theo đề xuất
- ...
```

Nếu AI không chạy được test:

- Không được nói chung chung là “có vẻ ổn”.
- Phải ghi rõ: chưa chạy vì thiếu môi trường/dependency/sandbox/config.
- Phải gợi ý command để người trong nhóm chạy lại.

---

## 11. Definition of Done chung

Một task/UC chỉ được xem là xong khi:

- [ ] Code đúng requirement.
- [ ] Không phá flow cũ.
- [ ] Không tạo duplicate architecture.
- [ ] Có test case markdown tương ứng.
- [ ] Build/test phù hợp pass hoặc blocker được ghi rõ.
- [ ] Không leak sensitive data.
- [ ] UI/API/DB đồng bộ.
- [ ] Reviewer có thể đọc tài liệu và tái hiện test.

---

## 12. Quick prompt cho AI trước khi code

Có thể paste đoạn này cho AI mỗi khi giao task:

```text
Trước khi code, hãy đọc:
- Quy_tac_AI_Test/AI_TEAM_RULES.md
- Test_Cases/README.md
- Test_Cases/TESTCASE_INDEX.md
- file UCxx_*_TESTCASE.md liên quan nếu có
- SRS/SRS_Summary.md
- SDS/ hoặc SQL_DB_RESORT_SPA/resort_spa_db.sql nếu task đụng backend/database

Sau đó chỉ sửa đúng phạm vi task. Khi xong phải cập nhật test case markdown, chạy build/test phù hợp và báo cáo file đã sửa + command đã chạy.
```
