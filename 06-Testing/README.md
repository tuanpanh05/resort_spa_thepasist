# 🧪 INDEX – 06-Testing

> Thư mục này chứa toàn bộ tài liệu kiểm thử (Testing) của dự án SMMS, từ test case definition đến test results và UAT.

## Cấu trúc thư mục

```
06-Testing/
├── test-medical-profiles.http       ← HTTP test file cho Medical Profile API
├── UNIT_TESTS/
│   └── UNIT_TEST_GUIDE.md           ← Hướng dẫn + ví dụ Unit Test (JUnit 5 + Mockito)
├── INTEGRATION_TESTS/
│   └── INTEGRATION_TEST_GUIDE.md    ← Hướng dẫn Integration Test (SpringBootTest)
├── SYSTEM_TESTS/
│   └── SYSTEM_TEST_GUIDE.md         ← Kịch bản E2E System Test (Playwright)
├── SECURITY_TESTS/
│   └── SECURITY_TEST_GUIDE.md       ← Kiểm thử bảo mật (RBAC, JWT, Encryption)
├── UAT/
│   └── UAT_PLAN.md                  ← Kế hoạch UAT với 36 scenarios cho 5 roles
├── TEST_CASES/
│   ├── README.md
│   ├── TESTCASE_INDEX.md
│   ├── UC03_PaymentInvoice_TESTCASE.md
│   ├── UC21-25_CheckoutAnalytics_TESTCASE.md
│   └── UC_TESTCASE_TEMPLATE.md
└── TEST_REPORTS/
    └── TEST_REPORT_Module4.md       ← Báo cáo test Module 4
```

## Testing Strategy

Dự án SMMS áp dụng **Testing Pyramid**:

```
         /\
        /  \   E2E System Tests (Playwright)
       /────\  ← Ít nhất, chậm, chi phí cao
      /      \
     /────────\ Integration Tests (SpringBootTest)
    /          \ ← Trung bình
   /────────────\
  / Unit Tests   \  ← Nhiều nhất, nhanh, rẻ
 /______________  \  (JUnit 5 + Mockito)
```

## Hướng dẫn chạy tests

### Backend Unit Tests
```bash
cd 05-Development/backend
./mvnw test
```

### Backend Integration Tests
```bash
./mvnw test -Dtest="*IntegrationTest" -Dspring.profiles.active=test
```

### Frontend E2E Tests
```bash
cd 05-Development/frontend
npx playwright test
```

## Coverage Target

| Layer | Target | Hiện tại |
|-------|--------|---------|
| Unit Tests (Service) | ≥ 70% | ~72% |
| Integration Tests | Key flows | ✅ Done |
| E2E (Happy paths) | All 5 modules | ✅ Done |
| Security | OWASP checklist | ~85% |
| UAT | 36 scenarios | 🟡 Pending |

## Links nhanh

- [UAT Plan](./UAT/UAT_PLAN.md) – User Acceptance Testing
- [Unit Test Guide](./UNIT_TESTS/UNIT_TEST_GUIDE.md) – Hướng dẫn unit test
- [Integration Test Guide](./INTEGRATION_TESTS/INTEGRATION_TEST_GUIDE.md)
- [Security Tests](./SECURITY_TESTS/SECURITY_TEST_GUIDE.md)
- [System Tests](./SYSTEM_TESTS/SYSTEM_TEST_GUIDE.md)
- [Test Cases Index](./TEST_CASES/TESTCASE_INDEX.md)

---
*Xem thêm: `00-Policy/TESTING_GUIDELINES.md` và `00-Policy/TESTCASE_WRITING_GUIDE.md`*
