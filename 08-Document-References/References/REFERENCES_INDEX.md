# 📖 REFERENCES & EXTERNAL RESOURCES – SMMS Project

> **Thư mục:** `08-Document-References/References/`  
> **Mục đích:** Tổng hợp tất cả tài liệu tham khảo, công cụ, thư viện và nguồn học tập được sử dụng trong dự án SMMS.

---

## 1. Tài liệu Kỹ thuật chính thức

### Spring Boot & Java

| Tài liệu | URL | Ghi chú |
|---------|-----|---------|
| Spring Boot 3.4.x Reference | https://docs.spring.io/spring-boot/docs/3.4.x/reference/ | Official docs |
| Spring Security Reference | https://docs.spring.io/spring-security/reference/ | JWT, OAuth2 |
| Spring Data JPA | https://docs.spring.io/spring-data/jpa/docs/current/reference/ | Repository patterns |
| jjwt Documentation | https://github.com/jwtk/jjwt | JWT library 0.12.5 |
| OpenPDF (iText fork) | https://github.com/LibrePDF/OpenPDF | PDF generation |
| JavaMail | https://javaee.github.io/javamail/ | Email service |

### React & Frontend

| Tài liệu | URL | Ghi chú |
|---------|-----|---------|
| React 19 Documentation | https://react.dev | Official React docs |
| Vite Documentation | https://vitejs.dev/guide/ | Build tool |
| React Router v7 | https://reactrouter.com/en/main | Routing |
| Axios | https://axios-http.com/docs/intro | HTTP client |
| Tailwind CSS | https://tailwindcss.com/docs | CSS framework |
| Lucide React | https://lucide.dev/guide/packages/lucide-react | Icons |
| Firebase SDK | https://firebase.google.com/docs/web/setup | Google SSO |

### Database

| Tài liệu | URL | Ghi chú |
|---------|-----|---------|
| SQL Server 2019 Documentation | https://docs.microsoft.com/en-us/sql/sql-server/ | Official docs |
| Hibernate ORM | https://hibernate.org/orm/documentation/ | JPA implementation |
| H2 Database | https://h2database.com/html/main.html | Test database |

---

## 2. External Services & APIs

### Payment

| Dịch vụ | URL | Tài khoản | Ghi chú |
|---------|-----|---------|---------|
| VNPay Developer Portal | https://sandbox.vnpayment.vn/apis/ | Sandbox account | Integration docs |
| VNPay Sandbox Test | https://sandbox.vnpayment.vn/paymentv2/vpcpay.html | - | Test environment |

**VNPay Test Cards:**
```
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mã OTP: 123456
```

### Google APIs

| API | URL | Ghi chú |
|-----|-----|---------|
| Google Calendar API v3 | https://developers.google.com/calendar/api/v3/reference | Event CRUD |
| Google Cloud Console | https://console.cloud.google.com | API key management |
| Firebase Console | https://console.firebase.google.com | Auth setup |
| Google OAuth2 | https://developers.google.com/identity/protocols/oauth2 | SSO flow |

### Email

| Dịch vụ | URL | Ghi chú |
|---------|-----|---------|
| Gmail SMTP | smtp.gmail.com:587 | TLS encryption |
| MailHog (test) | https://github.com/mailhog/MailHog | Local SMTP testing |

---

## 3. Tiêu chuẩn & Quy định Pháp lý

| Tài liệu | Số hiệu | Nội dung liên quan |
|---------|---------|------------------|
| Nghị định Bảo vệ Dữ liệu Cá nhân | 13/2023/NĐ-CP | AES encryption, consent checkbox |
| Luật Cư trú | 2020 | Khai báo tạm trú |
| AHLEI Accounting Standards | USALI 12th Ed. | Consolidated invoice format |
| OWASP Top 10 | 2021 | Security checklist |

---

## 4. Design References & UI Inspiration

| Nguồn | URL | Dùng cho |
|-------|-----|---------|
| Dribbble – Resort UI | https://dribbble.com/tags/resort | UI design inspiration |
| Refactoring UI | https://refactoringui.com | Design principles |
| Google Material Design 3 | https://m3.material.io | Component patterns |
| Booking.com | https://booking.com | Hotel booking UX reference |
| Spa Retreat Website (reference) | - | Wellness aesthetic |

---

## 5. Architecture & Design Patterns

| Tài liệu | Tác giả | Ghi chú |
|---------|---------|---------|
| C4 Model for Software Architecture | Simon Brown | https://c4model.com |
| Domain-Driven Design | Eric Evans | Entity design |
| Clean Architecture | Robert C. Martin | Package structure |
| REST API Design Guidelines | Google | API naming conventions |
| Spring Boot Best Practices | Baeldung | https://www.baeldung.com/spring-boot |

---

## 6. Testing Resources

| Tài liệu | URL | Framework |
|---------|-----|----------|
| JUnit 5 User Guide | https://junit.org/junit5/docs/current/user-guide/ | Unit testing |
| Mockito Documentation | https://javadoc.io/doc/org.mockito/mockito-core/latest/ | Mocking |
| Playwright Documentation | https://playwright.dev/docs/intro | E2E testing |
| k6 Load Testing | https://k6.io/docs/ | Performance testing |
| OWASP ZAP | https://www.zaproxy.org/docs/ | Security testing |
| Newman CLI | https://learning.postman.com/docs/collections/using-newman-cli/ | API testing automation |

---

## 7. AI Tools & Resources

| Tool | URL | Sử dụng trong dự án |
|------|-----|-------------------|
| Claude (Anthropic) | https://claude.ai | Architecture, docs, code review |
| GitHub Copilot | https://github.com/features/copilot | Code completion |
| ChatGPT | https://chat.openai.com | Debugging, Q&A |
| Cursor AI | https://cursor.sh | Multi-file refactoring |

**Tài liệu về AI-Assisted Development:**
- [Anthropic – Claude Model Overview](https://www.anthropic.com/claude)
- [GitHub – Copilot for Students](https://education.github.com/students)
- [Microsoft – Responsible AI Practices](https://www.microsoft.com/en-us/ai/responsible-ai)

---

## 8. Learning Resources cho Nhóm

### Spring Boot & Java
- **Baeldung:** https://www.baeldung.com – Best Java/Spring Boot tutorials
- **Java Brains (YouTube):** Spring Boot fundamentals
- **Amigoscode (YouTube):** Spring Security, JWT

### React & Frontend
- **React Dev Tutorials:** https://react.dev/learn
- **Fireship.io (YouTube):** React hooks, modern patterns
- **Kevin Powell (YouTube):** CSS best practices

### Database
- **Use The Index, Luke:** https://use-the-index-luke.com – SQL performance
- **SQL Server Central:** https://www.sqlservercentral.com

### Security
- **PortSwigger Web Security Academy:** https://portswigger.net/web-security – Free security training
- **OWASP Cheat Sheet Series:** https://cheatsheetseries.owasp.org

---

## 9. Tools & Development Utilities

| Tool | URL | Mục đích |
|------|-----|---------|
| Postman | https://postman.com | API testing & documentation |
| DBeaver | https://dbeaver.io | SQL Server GUI client |
| IntelliJ IDEA | https://jetbrains.com/idea | Java/Spring Boot IDE |
| VS Code | https://code.visualstudio.com | React/Frontend IDE |
| Git + GitHub | https://github.com | Version control |
| PlantUML | https://plantuml.com | Diagram generation (C4 Model) |
| draw.io | https://app.diagrams.net | Flowcharts, ER diagrams |

---

## 10. Tài liệu Nhóm nội bộ

| Tài liệu | Đường dẫn |
|---------|----------|
| AI Rules & Policy | `00-Policy/AI_RULES.md` |
| Team Rules | `00-Policy/AI_TEAM_RULES.md` |
| Business Process | `00-Policy/BUSINESS_PROCESS.md` |
| Testing Guidelines | `00-Policy/TESTING_GUIDELINES.md` |
| Software Architecture | `03-Design/SOFTWARE_ARCHITECTURE.md` |
| Database Design | `03-Design/DATABASE_DESIGN.md` |
| EDS Template | `08-Document-References/Templates/EDS_TEMPLATE_V2.0.md` |
| TDD Template | `08-Document-References/Templates/TDD_TEMPLATE_V1.md` |

---

*Danh sách được cập nhật khi có tài liệu mới. Mọi thành viên có thể bổ sung.*
