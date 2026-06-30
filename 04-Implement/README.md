# 🏠 INDEX – 04-Implement

> Thư mục này chứa toàn bộ tài liệu triển khai (Implementation) của dự án SMMS, bao gồm lịch sử thay đổi, báo cáo migration database và báo cáo tái cấu trúc code.

## Cấu trúc thư mục

```
04-Implement/
├── IMPLEMENTATION_GUIDE.md          ← Hướng dẫn triển khai tổng quát
├── CHANGE_LOGS/
│   └── CHANGELOG.md                 ← Lịch sử thay đổi theo version (Semantic Versioning)
├── DATABASE_MIGRATION_REPORTS/
│   └── DB_MIGRATION_HISTORY.md      ← Toàn bộ lịch sử thay đổi database schema
├── IMPLEMENTATION_REPORTS/
│   ├── ENVIRONMENT_MIGRATION_REPORT.md
│   ├── REPOSITORY_CLEANUP_REPORT.md
│   └── REPOSITORY_RESTRUCTURE_REPORT.md
└── REFACTOR_REPORTS/
    └── REFACTOR_LOG.md              ← Ghi lại các lần refactoring code
```

## Quy tắc sử dụng thư mục này

> [!IMPORTANT]
> Theo `00-Policy/AI_RULES.md`, **mọi triển khai đều phải có báo cáo đi kèm**. AI Agent KHÔNG được thực hiện thay đổi code mà không ghi log tại đây.

1. **Sau mỗi feature implementation** → Cập nhật `CHANGE_LOGS/CHANGELOG.md`
2. **Sau mỗi database schema change** → Tạo entry mới trong `DATABASE_MIGRATION_REPORTS/`
3. **Sau mỗi refactoring** → Cập nhật `REFACTOR_REPORTS/REFACTOR_LOG.md`
4. **Mỗi implementation report** → Thêm file vào `IMPLEMENTATION_REPORTS/`

## Links nhanh

- [CHANGELOG.md](./CHANGE_LOGS/CHANGELOG.md) – Lịch sử version
- [DB Migration History](./DATABASE_MIGRATION_REPORTS/DB_MIGRATION_HISTORY.md) – Database changes
- [Refactor Log](./REFACTOR_REPORTS/REFACTOR_LOG.md) – Code refactoring
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) – Hướng dẫn

---
*Thư mục được quản lý theo `00-Policy/AI_RULES.md`*
