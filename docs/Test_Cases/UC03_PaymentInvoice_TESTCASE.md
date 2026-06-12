# UC03 Payment & Invoice Test Cases

---

## Document Control

| Field | Value |
| :--- | :--- |
| **Document ID** | `NSRMS-UC03-TC-001` |
| **Use Case ID** | `UC03` |
| **Use Case Name** | Payment & Invoice |
| **Module** | `PAY` |
| **Version** | `1.0` |
| **Status** | `Draft` |
| **Author** | `Codex` |
| **Reviewer** | `TBD` |
| **Created Date** | `2026-06-10` |
| **Last Updated** | `2026-06-10` |
| **Data Classification** | `Internal, PII-linked` |

---

## Changelog

| Date | Author | Change |
| :--- | :--- | :--- |
| 2026-06-10 | Codex | Created UC03 test case document based on `Backend/docs/PAYMENT_TDD.md`. |

---

## 1. Use Case Summary

### 1.1 Business Goal

Khách hàng thanh toán đặt cọc online 30% khi đặt phòng/gói nghỉ dưỡng. Khi check-out, lễ tân thu 70% còn lại và phụ phí phát sinh. Hệ thống phải tạo invoice chính xác, hỗ trợ thanh toán VNPay hoặc tiền mặt, đồng thời bảo vệ callback thanh toán bằng xác minh chữ ký.

### 1.2 Actors

| Actor | Role in UC |
| :--- | :--- |
| Customer | Thanh toán đặt cọc hoặc thanh toán hóa đơn online |
| Receptionist | Thu tiền mặt, hoàn tất checkout |
| System/VNPay | Tạo payment URL và gửi callback kết quả thanh toán |
| Admin/Manager | Theo dõi doanh thu/invoice |

### 1.3 Scope

| In Scope | Out of Scope |
| :--- | :--- |
| Tạo invoice từ booking và các khoản charge | Real VNPay sandbox settlement |
| Tạo VNPay payment URL | Đối soát ngân hàng thật |
| Xử lý callback VNPay hợp lệ/không hợp lệ | Refund nâng cao |
| Thanh toán tiền mặt tại quầy | Kế toán ngoài hệ thống |
| Kiểm tra trạng thái invoice/booking liên quan |  |

---

## 2. Requirement Traceability

| Requirement ID | Source Document | Requirement Summary | Test Case IDs |
| :--- | :--- | :--- | :--- |
| `UC03-BR-001` | `SRS/SRS_Summary.md` | Customer completes 30% online deposit and later settles remaining balance. | `TC-PAY-API-002`, `TC-PAY-E2E-001` |
| `UC03-BR-002` | `Quy_tac_AI_Test/BUSINESS_PROCESS.md` | Receptionist collects remaining 70% + extra charges at checkout. | `TC-PAY-API-004` |
| `UC03-BR-003` | `Backend/docs/PAYMENT_TDD.md` | Invoice aggregates room, spa and food charges. | `TC-PAY-UNIT-001` |
| `UC03-SEC-001` | `Backend/docs/PAYMENT_TDD.md` | VNPay callback must verify secure hash. | `TC-PAY-SEC-001` |
| `UC03-DB-001` | `SQL_DB_RESORT_SPA/resort_spa_db.sql` | Invoice status must match DB allowed statuses. | `TC-PAY-INT-001` |

---

## 3. Preconditions & Assumptions

### 3.1 Preconditions

- [ ] Backend chạy được tại `http://localhost:8080`.
- [ ] SQL Server có schema và seed booking/invoice test.
- [ ] VNPay test config có secret giả lập, không dùng secret production.
- [ ] Nếu test frontend, frontend chạy được bằng `npm run dev`.

### 3.2 Assumptions

| ID | Assumption | Impact if Wrong |
| :--- | :--- | :--- |
| `ASM-001` | Invoice status hợp lệ gồm `UNPAID`, `PAID`, `CANCELLED`. | Test status transition sẽ fail nếu DB constraint khác. |
| `ASM-002` | Deposit amount được lưu hoặc tính từ booking. | Amount due có thể sai nếu business rule thay đổi. |
| `ASM-003` | VNPay callback dùng `vnp_SecureHash`. | Security test cần sửa nếu provider đổi format. |

---

## 4. Test Data

| Data ID | Type | Value / Setup | Used By | Note |
| :--- | :--- | :--- | :--- | :--- |
| `TD-PAY-001` | DB Seed | Booking hợp lệ có room charge, spa charge, food charge | `TC-PAY-UNIT-001`, `TC-PAY-INT-001` | Synthetic data |
| `TD-PAY-002` | DB Seed | Invoice `UNPAID` | `TC-PAY-API-002`, `TC-PAY-API-004`, `TC-PAY-SEC-001` | Reset sau test |
| `TD-PAY-003` | DB Seed | Invoice `PAID` | `TC-PAY-API-003`, `TC-PAY-API-005` | Dùng test duplicate/idempotency |
| `TD-PAY-004` | Callback Params | `vnp_TxnRef`, `vnp_ResponseCode=00`, `vnp_TransactionStatus=00`, signed hash | `TC-PAY-API-002` | HMAC bằng test secret |
| `TD-PAY-005` | Invalid Callback | Success params nhưng `vnp_SecureHash` sai | `TC-PAY-SEC-001` | Không đổi invoice |

---

## 5. Test Environment

| Item | Value |
| :--- | :--- |
| Frontend | React + Vite |
| Backend | Spring Boot + Maven |
| Database | SQL Server |
| API Base URL | `http://localhost:8080/api` |
| Test Tools | JUnit 5, Mockito, Postman/curl, SQL client |
| Build Commands | `npm run build`, `mvn test`, `mvn package` |

---

## 6. Test Case Summary

| TC ID | Type | Priority | Scenario | Status |
| :--- | :--- | :---: | :--- | :--- |
| `TC-PAY-UNIT-001` | Unit | Critical | Create invoice aggregates charges correctly | Not Run |
| `TC-PAY-API-001` | API | High | Missing booking returns 404 | Not Run |
| `TC-PAY-API-002` | API | Critical | Valid VNPay callback marks invoice paid | Not Run |
| `TC-PAY-API-003` | API | High | Paid invoice cannot generate new payment URL | Not Run |
| `TC-PAY-API-004` | API | Critical | Cash payment marks invoice paid | Not Run |
| `TC-PAY-API-005` | API | Medium | Duplicate callback is idempotent | Not Run |
| `TC-PAY-SEC-001` | Security | Critical | Invalid VNPay hash is rejected | Not Run |
| `TC-PAY-INT-001` | Integration | High | DB invoice status and amount fields persist correctly | Not Run |
| `TC-PAY-E2E-001` | E2E | High | Booking -> invoice -> payment -> paid state | Not Run |

---

## 7. Detailed Test Cases

### TC-PAY-UNIT-001 - Create Invoice Aggregates Charges Correctly

| Field | Value |
| :--- | :--- |
| **Type** | Unit |
| **Priority** | Critical |
| **Layer** | Backend Service |
| **Feature Under Test** | `InvoiceServiceImpl.createInvoice()` |
| **Requirement Ref** | `UC03-BR-003` |
| **Test Data** | `TD-PAY-001` |
| **Automation File** | `Backend/src/test/java/.../InvoiceServiceImplTest.java` |
| **Status** | Not Run |

#### Preconditions

- Booking tồn tại.
- Có room charge.
- Có spa/food charge, trong đó charge thuộc package không bị tính thêm.

#### Steps

1. Arrange booking + charge repository mock.
2. Call `createInvoice(bookingId)`.
3. Assert invoice subtotal, tax/fees, final amount, deposit amount, amount due.
4. Assert status là `UNPAID`.

#### Expected Result

- `roomSubtotal` đúng theo booking/package.
- `spaSubtotal` loại bỏ charge đã included trong package.
- `foodSubtotal` loại bỏ charge đã included trong package.
- `taxAndFees = (room + spa + food) * 10%` nếu rule hiện tại là 10%.
- `amountDue = finalAmount - depositAmount`.
- Invoice không âm tiền.

#### Actual Result

- Not Run.

---

### TC-PAY-API-001 - Missing Booking Returns 404

| Field | Value |
| :--- | :--- |
| **Type** | API |
| **Priority** | High |
| **Endpoint** | `POST /api/invoices/create/{bookingId}` hoặc endpoint thực tế tương ứng |
| **Auth Required** | Yes nếu security bật |
| **Required Role** | `RECEPTIONIST / ADMIN / CUSTOMER` tùy API contract |
| **Requirement Ref** | `UC03-BR-003` |
| **Test Data** | Booking ID không tồn tại |
| **Status** | Not Run |

#### Steps

1. Gọi API tạo invoice với `bookingId = 999999`.
2. Kiểm tra response.
3. Kiểm tra DB không tạo invoice mới.

#### Expected Result

- HTTP Status: `404`.
- Error code: `INV-404` hoặc code thống nhất của module.
- Không có invoice row mới.

#### Actual Result

- Not Run.

---

### TC-PAY-API-002 - Valid VNPay Callback Marks Invoice Paid

| Field | Value |
| :--- | :--- |
| **Type** | API |
| **Priority** | Critical |
| **Endpoint** | `GET/POST /api/invoices/vnpay-callback` hoặc endpoint thực tế |
| **Auth Required** | No for provider callback, nhưng phải verify hash |
| **Requirement Ref** | `UC03-SEC-001` |
| **Test Data** | `TD-PAY-002`, `TD-PAY-004` |
| **Status** | Not Run |

#### Steps

1. Seed invoice `UNPAID`.
2. Tạo VNPay callback params với `vnp_ResponseCode=00` và secure hash hợp lệ.
3. Gọi callback endpoint.
4. Query DB invoice.

#### Expected Result

- API xử lý thành công.
- Invoice chuyển sang `PAID`.
- `paymentTime` khác null.
- `vnpayTranId` bằng transaction no từ VNPay.
- Không tạo duplicate payment record nếu callback gọi lại.

#### Actual Result

- Not Run.

---

### TC-PAY-API-003 - Paid Invoice Cannot Generate New Payment URL

| Field | Value |
| :--- | :--- |
| **Type** | API |
| **Priority** | High |
| **Endpoint** | `POST /api/invoices/{id}/payment-url` hoặc endpoint thực tế |
| **Auth Required** | Yes |
| **Required Role** | `CUSTOMER / RECEPTIONIST` tùy API contract |
| **Requirement Ref** | `UC03-BR-001` |
| **Test Data** | `TD-PAY-003` |
| **Status** | Not Run |

#### Steps

1. Seed invoice `PAID`.
2. Gọi API tạo payment URL.
3. Kiểm tra response.

#### Expected Result

- HTTP Status: `409 Conflict`.
- Error code: `INV-409` hoặc code thống nhất.
- Không sinh URL thanh toán mới.

#### Actual Result

- Not Run.

---

### TC-PAY-API-004 - Cash Payment Marks Invoice Paid

| Field | Value |
| :--- | :--- |
| **Type** | API |
| **Priority** | Critical |
| **Endpoint** | `POST /api/invoices/{id}/cash-payment` hoặc endpoint thực tế |
| **Auth Required** | Yes |
| **Required Role** | `RECEPTIONIST / ADMIN` |
| **Requirement Ref** | `UC03-BR-002` |
| **Test Data** | `TD-PAY-002` |
| **Status** | Not Run |

#### Steps

1. Login bằng role lễ tân/admin.
2. Seed invoice `UNPAID`.
3. Gọi API cash payment.
4. Query DB invoice.

#### Expected Result

- Invoice chuyển sang `PAID`.
- `paymentTime` khác null.
- `vnpayTranId` null hoặc không set vì thanh toán tiền mặt.
- User không đủ quyền bị `403`.

#### Actual Result

- Not Run.

---

### TC-PAY-API-005 - Duplicate Callback Is Idempotent

| Field | Value |
| :--- | :--- |
| **Type** | API |
| **Priority** | Medium |
| **Endpoint** | VNPay callback endpoint thực tế |
| **Requirement Ref** | `UC03-SEC-001` |
| **Test Data** | `TD-PAY-003`, `TD-PAY-004` |
| **Status** | Not Run |

#### Steps

1. Seed invoice đã `PAID`.
2. Gửi lại callback hợp lệ cùng `vnp_TxnRef`.
3. Kiểm tra response và DB.

#### Expected Result

- Không crash.
- Invoice vẫn `PAID`.
- Không ghi đè payment state nguy hiểm.
- Không nhân đôi payment/ledger nếu hệ thống có bảng giao dịch.

#### Actual Result

- Not Run.

---

### TC-PAY-SEC-001 - Invalid VNPay Hash Is Rejected

| Field | Value |
| :--- | :--- |
| **Type** | Security |
| **Priority** | Critical |
| **Endpoint/UI** | VNPay callback endpoint |
| **Security Rule** | Verify cryptographic signature/hash before trusting callback |
| **Requirement Ref** | `UC03-SEC-001` |
| **Status** | Not Run |

#### Attack / Negative Scenario

Attacker gửi callback giả với `vnp_ResponseCode=00` nhưng `vnp_SecureHash` sai để đánh dấu hóa đơn là đã thanh toán.

#### Steps

1. Seed invoice `UNPAID`.
2. Gửi callback params success nhưng secure hash sai/rỗng.
3. Kiểm tra response.
4. Query DB invoice.

#### Expected Result

- HTTP Status: `403 Forbidden` hoặc business error tương ứng.
- Error code: `INV-403` hoặc code thống nhất.
- Invoice giữ nguyên `UNPAID`.
- Không ghi nhận `paymentTime`.
- Không ghi secret/hash đầy đủ vào log.

#### Actual Result

- Not Run.

---

### TC-PAY-INT-001 - DB Invoice Status And Amount Persist Correctly

| Field | Value |
| :--- | :--- |
| **Type** | Integration |
| **Priority** | High |
| **Layer** | Service + Repository + SQL Server |
| **Requirement Ref** | `UC03-DB-001` |
| **Test Data** | `TD-PAY-001`, `TD-PAY-002` |
| **Status** | Not Run |

#### Steps

1. Seed booking và charges.
2. Tạo invoice qua service/API.
3. Query DB invoice.
4. So sánh amount/status với expected.

#### Expected Result

- Status nằm trong enum/constraint hợp lệ của DB.
- Amount fields không null nếu business bắt buộc.
- Amount dùng decimal chính xác, không sai do floating point.

#### DB Verification Sample

```sql
SELECT invoice_id, status, final_amount, deposit_amount, amount_due, payment_time, vnpay_tran_id
FROM dbo.invoice
WHERE invoice_id = <test_invoice_id>;
```

#### Actual Result

- Not Run.

---

### TC-PAY-E2E-001 - Booking To Invoice To Paid State

| Field | Value |
| :--- | :--- |
| **Type** | E2E |
| **Priority** | High |
| **Business Flow** | Customer booking -> invoice created -> payment callback/cash payment -> paid state |
| **Actors** | Customer, Receptionist, VNPay/System |
| **Requirement Ref** | `UC03-BR-001`, `UC03-BR-002` |
| **Status** | Not Run |

#### Steps

1. Customer tạo booking hoặc dùng booking seed.
2. System/Receptionist tạo invoice.
3. Customer thanh toán online hoặc Receptionist thu cash.
4. Kiểm tra invoice paid.
5. Kiểm tra booking/payment state liên quan nếu có.

#### Expected Result

- Invoice được tạo đúng tổng tiền.
- Payment thành công chuyển invoice sang `PAID`.
- Booking state liên quan được đồng bộ theo business rule.
- UI/API hiển thị trạng thái thanh toán đúng.

#### Actual Result

- Not Run.

---

## 8. State Transition Matrix

| Entity | From State | Action | To State | Allowed? | Test Case |
| :--- | :--- | :--- | :--- | :---: | :--- |
| Invoice | `UNPAID` | VNPay success callback valid hash | `PAID` | Yes | `TC-PAY-API-002` |
| Invoice | `UNPAID` | Cash payment by receptionist | `PAID` | Yes | `TC-PAY-API-004` |
| Invoice | `UNPAID` | VNPay callback invalid hash | `UNPAID` | No state change | `TC-PAY-SEC-001` |
| Invoice | `PAID` | Create payment URL | `PAID` | No | `TC-PAY-API-003` |
| Invoice | `PAID` | Duplicate callback | `PAID` | Idempotent | `TC-PAY-API-005` |
| Invoice | `CANCELLED` | Payment attempt | `CANCELLED` | No | Add if implemented |

---

## 9. Database Verification

| Check ID | SQL / Verification | Expected Result | Test Case |
| :--- | :--- | :--- | :--- |
| `DB-PAY-001` | Query invoice after create | Correct totals and `UNPAID` | `TC-PAY-INT-001` |
| `DB-PAY-002` | Query invoice after valid callback | `PAID`, payment time exists | `TC-PAY-API-002` |
| `DB-PAY-003` | Query invoice after invalid hash | Still `UNPAID` | `TC-PAY-SEC-001` |
| `DB-PAY-004` | Query invoice after cash payment | `PAID`, `vnpayTranId` null | `TC-PAY-API-004` |

---

## 10. Build & Test Execution Log

| Date | Runner | Command | Result | Note |
| :--- | :--- | :--- | :--- | :--- |
| 2026-06-10 | Codex | Documentation only | Not Run | Created markdown test docs; no code test executed. |

---

## 11. Defects Found

| Defect ID | Test Case | Severity | Description | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| - | - | - | No defects logged yet | - | - |

---

## 12. Exit Criteria

UC03 chỉ được nghiệm thu khi:

- [ ] `TC-PAY-UNIT-001` pass.
- [ ] `TC-PAY-API-002` pass.
- [ ] `TC-PAY-API-004` pass.
- [ ] `TC-PAY-SEC-001` pass.
- [ ] Không có bug Critical/High đang Open.
- [ ] Backend build/test pass.
- [ ] Nếu có frontend payment UI, frontend build pass.
- [ ] Không leak secret/hash/token trong log hoặc markdown.

---

## 13. Final Review

| Role | Name | Decision | Date | Note |
| :--- | :--- | :--- | :--- | :--- |
| Developer | TBD | Pending | - |  |
| Tester/QA | TBD | Pending | - |  |
| Tech Lead | TBD | Pending | - |  |
