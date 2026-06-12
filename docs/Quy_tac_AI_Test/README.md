# Quy tắc AI & Testing - Thư mục hướng dẫn cho AI và nhóm

Thư mục này chứa quy tắc bắt buộc và hướng dẫn kiểm thử cho tất cả thành viên nhóm (bao gồm AI, dev, tester) khi làm việc trên dự án **Ngũ Sơn Resort & Spa Management System**.

---

## Mục đích

1. Đảm bảo AI và dev đọc đúng tài liệu trước khi code để tránh lệch nghiệp vụ.
2. Cung cấp quy tắc rõ ràng về kiến trúc, database, API, UI, bảo mật, test.
3. Giảm thiểu conflict merge, lỗi logic, lỗi phân quyền, và data leak.
4. Hướng dẫn viết test case đồng bộ với code.

---

## Cấu trúc thư mục

```text
Quy_tac_AI_Test/
├── README.md                      <- File này
├── AI_TEAM_RULES.md               <- Quy tắc bắt buộc cho AI/dev/team (READ FIRST)
├── TESTING_GUIDELINES.md          <- Tiêu chuẩn kiểm thử kỹ thuật (JUnit, API test, E2E)
└── BUSINESS_PROCESS.md (nếu có)   <- Business flow chi tiết
```

---

## Hướng dẫn sử dụng

### Khi AI được giao task

1. **READ FIRST**: `Quy_tac_AI_Test/AI_TEAM_RULES.md`
2. Đọc `Test_Cases/README.md` và `Test_Cases/TESTCASE_INDEX.md`.
3. Nếu UC đã có test case, đọc `Test_Cases/UCxx_*_TESTCASE.md`.
4. Đọc `SRS/SRS_Summary.md` để hiểu requirement.
5. Đọc `SDS/BACKEND_ARCHITECTURE.md`, `SDS/DATABASE_DESIGN.md`, `SQL_DB_RESORT_SPA/resort_spa_db.sql` nếu task liên quan backend/database.
6. Code đúng phạm vi.
7. Cập nhật hoặc tạo test case markdown.
8. Chạy build/test và ghi kết quả.
9. Báo cáo theo format trong `AI_TEAM_RULES.md`.

### Khi dev thực hiện code review

1. Kiểm tra xem AI/dev có đọc và tuân thủ `AI_TEAM_RULES.md` không.
2. Kiểm tra test case markdown có cập nhật không.
3. Kiểm tra build/test command có được chạy và ghi nhận không.
4. Kiểm tra không có dữ liệu nhạy cảm/secret thật/data thật leak.
5. Kiểm tra không phá kiến trúc/API/database hiện có.

### Khi tester/QA kiểm thử

1. Đọc `Test_Cases/UCxx_*_TESTCASE.md` của UC cần test.
2. Đọc `TESTING_GUIDELINES.md` để hiểu test pyramid, naming, best practices.
3. Chạy test theo test case markdown.
4. Ghi actual result và evidence vào markdown.
5. Tạo bug report nếu có lỗi.
6. Update test case status.

---

## Tài liệu trong thư mục

### AI_TEAM_RULES.md

Quy tắc tổng quan bắt buộc:

- Phạm vi thay đổi code.
- Không phá code của người khác.
- Không tạo duplicate pattern.
- Quy tắc kiến trúc frontend (React/Vite/Tailwind).
- Quy tắc kiến trúc backend (Spring Boot/MVC/JPA).
- Quy tắc database/entity (khớp DDL thật).
- Quy tắc bảo mật và phân quyền.
- Quy tắc nghiệp vụ quan trọng (payment, booking, spa, food).
- Quy tắc test bắt buộc.
- Quy tắc Git/PR.
- Definition of Done.

Đọc file này trước bất kỳ thay đổi code nào.

### TESTING_GUIDELINES.md

Tiêu chuẩn kiểm thử kỹ thuật:

- Test pyramid & coverage target.
- Test naming convention.
- Test data management (synthetic data, cleanup).
- Mock external services.
- Assertion best practices.
- Security & sensitive data testing.
- Database/API/E2E test guidelines.
- CI/CD integration.
- Review checklist.

Dành cho dev viết automated test (JUnit, Mockito, MockMvc, RestAssured).

---

## Quick Start cho AI

Paste đoạn này vào prompt khi giao task cho AI:

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

---

## Quy tắc cập nhật tài liệu

Khi cần sửa quy tắc:

1. Tạo PR riêng cho thay đổi quy tắc/guideline.
2. Thảo luận với team trước khi merge.
3. Cập nhật changelog trong file.
4. Thông báo toàn bộ team/AI về thay đổi.

Không tự ý sửa quy tắc trong khi code UC nếu không có consensus.

---

## Liên hệ & Support

Nếu có thắc mắc về quy tắc hoặc cách dùng:

- Tạo issue trong repo.
- Thảo luận trong team meeting.
- Tag tech lead/project owner trong PR comment.

---

## Changelog

| Date | Change | Author |
| :--- | :--- | :--- |
| 2026-06-10 | Created AI_TEAM_RULES, TESTING_GUIDELINES, and README | Codex |
