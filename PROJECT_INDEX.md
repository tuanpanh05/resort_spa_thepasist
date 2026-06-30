# 🗺️ MASTER PROJECT INDEX – SMMS Ngũ Sơn Resort & Spa

> **Cập nhật:** 2026-06-27 | **Nhóm:** SE2023-G3 | **Môn:** SWP391  
> **Đây là tài liệu điều hướng trung tâm cho toàn bộ workspace dự án SMMS.**

---

## 🔑 Đọc ngay nếu bạn mới vào dự án

| Thứ tự | Tài liệu | Mô tả |
|--------|---------|-------|
| 1️⃣ | [README.md](./README.md) | Tổng quan dự án, tech stack, team |
| 2️⃣ | [00-Policy/AI_RULES.md](./00-Policy/AI_RULES.md) | **BẮT BUỘC** – Quy tắc cho AI và developer |
| 3️⃣ | [00-Policy/AI_TEAM_RULES.md](./00-Policy/AI_TEAM_RULES.md) | Quy tắc làm việc nhóm |
| 4️⃣ | [01-Planning/SUMMARY.md](./01-Planning/SUMMARY.md) | Tổng hợp 5 module + business gaps |
| 5️⃣ | [03-Design/SOFTWARE_ARCHITECTURE.md](./03-Design/SOFTWARE_ARCHITECTURE.md) | Kiến trúc C4 Model |
| 6️⃣ | [03-Design/DATABASE_DESIGN.md](./03-Design/DATABASE_DESIGN.md) | Database schema 28 bảng |

---

## 📁 Cấu trúc toàn bộ dự án

```
FontendFor_SWP391/
│
├── 00-Policy/                   ← Quy tắc và chính sách
│   ├── AI_RULES.md              ← Quy tắc cho AI agents
│   ├── AI_TEAM_RULES.md         ← Quy tắc nhóm
│   ├── BUSINESS_PROCESS.md      ← Quy trình nghiệp vụ
│   ├── CODING_STANDARDS.md      ← Tiêu chuẩn code
│   ├── DATABASE_RULES.md        ← Quy tắc database
│   ├── GIT_WORKFLOW.md          ← Git branching strategy
│   ├── TESTING_GUIDELINES.md    ← Hướng dẫn kiểm thử
│   └── TESTCASE_WRITING_GUIDE.md
│
├── 01-Planning/                 ← Kế hoạch dự án
│   ├── PROJECT_PLAN.md          ← Roadmap 3 phase
│   ├── SUMMARY.md               ← Tổng hợp 5 module + gaps analysis
│   ├── Module_1.md – Module_5.md ← Chi tiết từng module
│   └── SWP391-HOS-03 (1).pdf   ← Đề bài gốc
│
├── 02-Requirement/              ← Yêu cầu hệ thống
│   ├── SRS_Summary.md           ← Tóm tắt SRS
│   ├── BUSINESS_PROCESS.md      ← Business flows
│   ├── SRS/                     ← Software Requirements Specification
│   └── DE_BAI_MODULE/           ← Đề bài chi tiết từng module
│
├── 03-Design/                   ← Thiết kế hệ thống
│   ├── SOFTWARE_ARCHITECTURE.md ← C4 Model Architecture (44KB!)
│   ├── DATABASE_DESIGN.md       ← DB schema documentation
│   ├── BACKEND_ARCHITECTURE.md  ← Spring Boot layers
│   ├── SDS/                     ← Software Design Specification
│   ├── database/                ← SQL files
│   └── Template/                ← Design templates
│
├── 04-Implement/                ← Triển khai
│   ├── README.md                ← Index thư mục
│   ├── IMPLEMENTATION_GUIDE.md  ← Hướng dẫn triển khai
│   ├── CHANGE_LOGS/
│   │   └── CHANGELOG.md         ← 🆕 Lịch sử version
│   ├── DATABASE_MIGRATION_REPORTS/
│   │   └── DB_MIGRATION_HISTORY.md ← 🆕 DB migration log
│   ├── IMPLEMENTATION_REPORTS/  ← Báo cáo implementation
│   └── REFACTOR_REPORTS/
│       └── REFACTOR_LOG.md      ← 🆕 Refactoring log
│
├── 05-Development/              ← Source code
│   ├── frontend/                ← React 19 + Vite frontend
│   │   └── src/
│   │       ├── pages/           ← 26 trang UI
│   │       ├── components/      ← Components (admin, chef, staff...)
│   │       ├── api/             ← Axios HTTP client
│   │       └── context/         ← React Contexts
│   ├── backend/                 ← Spring Boot 3.4.2 + Java 21
│   │   └── src/main/java/fu/se/smms/
│   │       ├── controller/      ← 22 REST Controllers
│   │       ├── service/         ← 17 Service classes
│   │       ├── entity/          ← 28 JPA Entities
│   │       ├── repository/      ← Spring Data repositories
│   │       └── config/          ← Security, CORS, JWT config
│   └── database/                ← SQL scripts
│
├── 06-Testing/                  ← Kiểm thử
│   ├── README.md                ← 🆕 Index + Testing pyramid
│   ├── UNIT_TESTS/
│   │   └── UNIT_TEST_GUIDE.md   ← 🆕 JUnit 5 + Mockito guide
│   ├── INTEGRATION_TESTS/
│   │   └── INTEGRATION_TEST_GUIDE.md ← 🆕 SpringBootTest guide
│   ├── SYSTEM_TESTS/
│   │   └── SYSTEM_TEST_GUIDE.md ← 🆕 E2E Playwright guide
│   ├── SECURITY_TESTS/
│   │   └── SECURITY_TEST_GUIDE.md ← 🆕 Security test guide
│   ├── UAT/
│   │   └── UAT_PLAN.md          ← 🆕 36 UAT scenarios
│   ├── TEST_CASES/              ← Test cases đã viết
│   └── TEST_REPORTS/            ← Kết quả test
│
├── 07-Reports/                  ← Báo cáo
│   ├── README.md                ← 🆕 Index + links
│   ├── PROJECT_STATUS_REPORT.md ← 🆕 Dashboard trạng thái dự án
│   ├── SPRINT_REPORTS/
│   │   └── SPRINT_SUMMARY.md    ← 🆕 5 sprint reports
│   ├── WEEKLY_REPORTS/
│   │   └── WEEKLY_PROGRESS.md   ← 🆕 Báo cáo tuần 1-10
│   ├── LESSONS_LEARNED/
│   │   └── LESSONS_LEARNED.md   ← 🆕 Bài học kỹ thuật + quy trình
│   ├── FINAL_REPORT/            ← Báo cáo cuối 5 module
│   ├── EDS/                     ← External Design Spec (5 modules × 6 UCs)
│   └── TDD/                     ← Test Design Doc (5 modules × 6 UCs)
│
└── 08-Document-References/      ← Tài liệu tham khảo
    ├── README.md                ← 🆕 Index
    ├── MeetingMinutes/
    │   └── MEETING_MINUTES.md   ← 🆕 Biên bản 6 cuộc họp
    ├── ResearchPapers/
    │   ├── AI_IN_DEVELOPMENT_REPORT.md ← 🆕 AI tools analysis
    │   └── HOSPITALITY_TECH_MARKET_ANALYSIS.md ← 🆕 Market analysis
    ├── References/
    │   └── REFERENCES_INDEX.md  ← 🆕 All references & resources
    ├── Huong_dan/               ← Hướng dẫn tích hợp
    └── Templates/               ← EDS & TDD templates
```

---

## 🔗 Quick Links theo vai trò

### Nếu bạn là **AI Agent**
1. Đọc [AI_RULES.md](./00-Policy/AI_RULES.md) → Bắt buộc
2. Đọc [AI_TEAM_RULES.md](./00-Policy/AI_TEAM_RULES.md) → Bắt buộc  
3. Đọc [SOFTWARE_ARCHITECTURE.md](./03-Design/SOFTWARE_ARCHITECTURE.md) → Hiểu context
4. Đọc EDS và TDD của module liên quan trước khi code

### Nếu bạn là **Backend Developer**
1. [BACKEND_ARCHITECTURE.md](./03-Design/BACKEND_ARCHITECTURE.md)
2. [DATABASE_DESIGN.md](./03-Design/DATABASE_DESIGN.md)
3. [AI_RULES.md Section 2](./00-Policy/AI_RULES.md) – Spring Boot rules

### Nếu bạn là **Frontend Developer**
1. [AI_TEAM_RULES.md Section 3](./00-Policy/AI_TEAM_RULES.md) – Frontend rules
2. [SOFTWARE_ARCHITECTURE.md](./03-Design/SOFTWARE_ARCHITECTURE.md) – Frontend container
3. [AI_RULES.md Section 3](./00-Policy/AI_RULES.md) – React rules

### Nếu bạn là **Tester**
1. [TESTING_GUIDELINES.md](./00-Policy/TESTING_GUIDELINES.md)
2. [TESTCASE_WRITING_GUIDE.md](./00-Policy/TESTCASE_WRITING_GUIDE.md)
3. [UAT_PLAN.md](./06-Testing/UAT/UAT_PLAN.md)

### Nếu bạn muốn **hiểu dự án nhanh**
→ Đọc [PROJECT_STATUS_REPORT.md](./07-Reports/PROJECT_STATUS_REPORT.md) – ~5 phút để biết tất cả.

---

## 🆕 Files được tạo lần này (2026-06-27)

| File | Thư mục | Nội dung |
|------|---------|---------|
| CHANGELOG.md | 04-Implement/CHANGE_LOGS/ | Lịch sử version v1.0-v1.5 |
| DB_MIGRATION_HISTORY.md | 04-Implement/DATABASE_MIGRATION_REPORTS/ | V1.0-V1.6 migration |
| REFACTOR_LOG.md | 04-Implement/REFACTOR_REPORTS/ | REF-001 đến REF-006 |
| README.md | 04-Implement/ | Index thư mục |
| UNIT_TEST_GUIDE.md | 06-Testing/UNIT_TESTS/ | JUnit 5 + Mockito examples |
| INTEGRATION_TEST_GUIDE.md | 06-Testing/INTEGRATION_TESTS/ | SpringBootTest guide |
| SYSTEM_TEST_GUIDE.md | 06-Testing/SYSTEM_TESTS/ | Playwright E2E guide |
| SECURITY_TEST_GUIDE.md | 06-Testing/SECURITY_TESTS/ | RBAC, JWT, encryption tests |
| UAT_PLAN.md | 06-Testing/UAT/ | 36 scenarios, 5 roles |
| README.md | 06-Testing/ | Testing pyramid index |
| SPRINT_SUMMARY.md | 07-Reports/SPRINT_REPORTS/ | 5 sprints |
| WEEKLY_PROGRESS.md | 07-Reports/WEEKLY_REPORTS/ | 10 tuần |
| LESSONS_LEARNED.md | 07-Reports/LESSONS_LEARNED/ | 8 technical + 5 process |
| PROJECT_STATUS_REPORT.md | 07-Reports/ | Dashboard 25 UC status |
| README.md | 07-Reports/ | Reports index |
| MEETING_MINUTES.md | 08-Document-References/MeetingMinutes/ | 6 cuộc họp |
| AI_IN_DEVELOPMENT_REPORT.md | 08-Document-References/ResearchPapers/ | AI tools analysis |
| HOSPITALITY_TECH_MARKET_ANALYSIS.md | 08-Document-References/ResearchPapers/ | Market research |
| REFERENCES_INDEX.md | 08-Document-References/References/ | Tất cả references |
| README.md | 08-Document-References/ | Doc refs index |

**Tổng cộng: 20 files markdown mới được tạo** ✅

---

*Master Index được tạo ngày 2026-06-27 bởi AI Agent (Claude Sonnet 4) sau khi đọc toàn bộ dự án.*
