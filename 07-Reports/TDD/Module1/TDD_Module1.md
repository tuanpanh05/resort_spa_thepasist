# TEST-DRIVEN DEVELOPMENT SPECIFICATION — MODULE 1

## Đặc tả Kiểm thử Hướng Phát triển: Authentication & Sensitive Health Profile

* **Document ID**: SMMS-AUTH-TDD-001
* **Version**: 1.0
* **Date**: 2026-06-14
* **Status**: Approved
* **Standard**: ISO/IEC/IEEE 29119-3:2021 aligned
* **Author**: Hoàng Tuấn Anh — Full-stack Engineer
* **Reviewed by**: Phạm Anh Tuấn — Approved
* **DPO Sign-off**: Approved — 2026-06-14 — All Team
* **Approved by**: Phạm Anh Tuấn — Approved
* **Classification**: Internal — Confidential

### References:

* `04_testing/SOFTWARE_TEST_PLAN.md` — Master Test Plan
* `01_Requirements/SRS.md` — Functional requirements for Module 1
* `02-Requirement/DE_BAI_MODULE/Module_1.md` — Requirement specifications for Module 1
* `05-Development/backend/docs/AUTH_EDS.md` — Technical Specification
* Decree 13/2023/NĐ-CP & Decree 356/2025/ND-CP (Legal basis for sensitive PII data handling)

> [!IMPORTANT]
> **Quy ước TDD**: Tài liệu này mô tả test cases TRƯỚC khi viết production code.
> Thứ tự bắt buộc: viết test &rarr; chạy &rarr; xác nhận FAIL 🔴 &rarr; implement &rarr; PASS 🟢 &rarr; refactor 🔵.
> Chạy test bằng lệnh Maven: `.\apache-maven-3.9.6\bin\mvn.cmd test` và đảm bảo kết quả xanh.
> Test data dùng dữ liệu giả lập (`SYNTHETIC`), không dùng PII thực tế của khách hàng.

---

## CHANGELOG

> **Policy 4.4 — Immutable History**: Không bao giờ xóa thông tin cũ.

| Ngày      | Người thực hiện | Nội dung thay đổi                                                                                                                      |
| :--------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-11 | Student 1           | Khởi tạo tài liệu — Thiết kế TDD spec ban đầu cho Đăng ký, Đăng nhập, và Hồ sơ Sức khỏe nhạy cảm                    |
| 2026-06-14 | Student 1           | Cập nhật logic sửa lỗi tự động ghi đè họ tên của Google Login (`AUTH-TC-009`) và cập nhật kết quả chạy test thực tế |

---

## MỤC LỤC

1. [Thông tin Module](#1-thông-tin-module)
2. [Logic Issues Resolved](#2-logic-issues-resolved)
3. [Test Design Specification (TDS)](#3-test-design-specification-tds)
4. [Test Case Specification](#4-test-case-specification)
5. [Security Test Cases](#security-test-cases)
6. [Integration Test Cases](#integration-test-cases)
7. [Red-Green-Refactor Tracker](#5-red-green-refactor-tracker)
8. [Entry / Exit Criteria](#6-entry--exit-criteria)
9. [Rollback Plan](#7-rollback-plan)

---

## 1. Thông tin Module

| Field                           | Value                                                                                                    |
| :------------------------------ | :------------------------------------------------------------------------------------------------------- |
| **Feature / Gap ID**      | GAP-AUTH-001                                                                                             |
| **Module**                | Authentication & Sensitive Health Profile                                                                |
| **Spec gốc**             | [AUTH_EDS.md](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/docs/AUTH_EDS.md) |
| **Priority**              | 🔴 P0 (Core Security and PII Compliance)                                                                 |
| **Sprint**                | S1                                                                                                       |
| **Milestone**             | M3 Alpha — 2026-06-14                                                                                   |
| **Data Classification**   | Sensitive-PII / PII                                                                                      |
| **Compliance Scope**      | Nghị định 13/2023/NĐ-CP Điều 4 & 6, Luật Cư trú 2020                                            |
| **Upstream Dependencies** | None                                                                                                     |
| **Downstream Consumers**  | Module 2 (Booking), Module 3 (Spa Schedule), Module 4 (F&B), Module 5 (Folio Billing)                    |

---

## 2. Logic Issues Resolved

| #            | Spec gốc (sai / thiếu)                                                                   | Thực tế (schema / policy)                                                                                          | Fix áp dụng trong test / code                                                                                                                  |
| :----------- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **L1** | Thiếu ràng buộc Validate Consent trên UI.                                              | Checkbox đồng ý xử lý thông tin nhạy cảm phải trống mặc định.                                           | Test case `AUTH-TC-005` kiểm tra việc API từ chối lưu profile nếu `explicitConsentSigned = false`.                                     |
| **L2** | Xóa dữ liệu sức khỏe phải được Admin duyệt thủ công (SRS UC-15).               | Đề bài yêu cầu tự động xóa dữ liệu khi kết thúc kỳ nghỉ để bảo vệ riêng tư.                     | Test case `AUTH-TC-INT-001` kiểm tra background job scheduler quét các booking `CHECKED_OUT` và tự động xóa data nhạy cảm.         |
| **L3** | Chưa đặc tả thiết kế kỹ thuật của mã hóa DB.                                    | Bắt buộc mã hóa AES-256 đối với Passport, Bệnh lý, và Dị ứng.                                            | Test case `AUTH-TC-006` kiểm tra dữ liệu lưu xuống DB là chuỗi mã hóa và Java giải mã chính xác plaintext.                       |
| **L4** | Chưa chặn đăng nhập của tài khoản bị khóa.                                       | Các tài khoản nhân viên bị Admin khóa (`status = INACTIVE`) phải bị chặn đăng nhập.                   | Test case `AUTH-TC-004` kiểm tra thông tin đăng nhập đúng của tài khoản locked vẫn trả về 403.                                    |
| **L5** | Phạm vi quản lý Master Data bị phân tán.                                             | Các bảng Master Data được chỉnh sửa bởi Admin nhưng đọc bởi nhiều Module khác.                         | Định nghĩa rõ ràng interface và endpoints read-only công khai cho packages/room_types/services.                                           |
| **L6** | Google Login tự động ghi đè tên người dùng đã cập nhật bằng tên Google cũ. | Khi người dùng cập nhật họ tên mới, lượt đăng nhập Google tiếp theo tự động ghi đè lại tên cũ. | Sửa phương thức `loginWithGoogle` tại `UserServiceImpl` để chỉ cập nhật họ tên từ Google nếu tên trong hệ thống bị trống. |

---

## 3. Test Design Specification (TDS)

### TDS-01 — Scope / Phạm vi

`Authentication & Sensitive Health Profile` bao gồm các layer được kiểm thử:

* **Domain** (`AESCryptoConverter` mã hóa tự động ở tầng thực thể JPA).
* **Application / Services** (Mocking JPA repositories, password encoders, JWT providers).
* **Controller** (Kiểm tra request validation, status codes, RBAC filters thông qua MockMvc).
* **Integration** (Kiểm tra sự tương tác giữa Services, Repository và Cơ sở dữ liệu thật).

### TDS-02 — Test Basis / Cơ sở Kiểm thử

* [Module_1.md](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/02-Requirement/DE_BAI_MODULE/Module_1.md) UC01 &rarr; UC05.
* Nghị định 13/2023/NĐ-CP Điều 6 (Quy định sự đồng ý rõ ràng).
* Database constraints (`CK_User_Role`, `CK_User_Status`).

### TDS-03 — Test Conditions and Coverage Items

| Condition ID          | Test Condition                                                            | Coverage Item                         | Test Cases      |
| :-------------------- | :------------------------------------------------------------------------ | :------------------------------------ | :-------------- |
| **TC-COND-001** | Trùng email khi đăng ký mới bị từ chối                            | `UserServiceImpl.signUp()`          | `AUTH-TC-001` |
| **TC-COND-002** | Đăng nhập tài khoản hoạt động trả về JWT                        | `UserServiceImpl.login()`           | `AUTH-TC-002` |
| **TC-COND-003** | Tài khoản bị khóa (status=INACTIVE) bị từ chối đăng nhập        | `UserServiceImpl.login()`           | `AUTH-TC-003` |
| **TC-COND-004** | Lưu hồ sơ sức khỏe không có consent bị từ chối                  | `MedicalProfileService`             | `AUTH-TC-004` |
| **TC-COND-005** | Lưu hồ sơ sức khỏe có consent thực hiện mã hóa AES tự động   | `MedicalProfile` JPA write          | `AUTH-TC-005` |
| **TC-COND-006** | Phân quyền RBAC lọc dữ liệu nhạy cảm theo role (Therapist vs Chef) | `MedicalProfile` get API            | `AUTH-TC-006` |
| **TC-COND-007** | Khách tự yêu cầu xóa sạch hồ sơ nhạy cảm của mình             | `MedicalProfileService.delete()`    | `AUTH-TC-007` |
| **TC-COND-008** | Google Login tự tạo tài khoản mới nếu chưa tồn tại               | `UserServiceImpl.loginWithGoogle()` | `AUTH-TC-008` |
| **TC-COND-009** | Google Login không ghi đè họ tên hiện tại nếu đã có dữ liệu  | `UserServiceImpl.loginWithGoogle()` | `AUTH-TC-009` |

### TDS-04 — Test Techniques / Kỹ thuật Kiểm thử

* **Equivalence Partitioning**: Chia nhóm role hợp lệ (`THERAPIST`, `CHEF`, `RECEPTIONIST`) để kiểm tra quyền đọc dữ liệu nhạy cảm.
* **Boundary Value Analysis**: Kiểm tra độ dài mật khẩu (tối thiểu 6 ký tự) và định dạng email.
* **Error Guessing**: Giả lập request không đính kèm consent để kiểm tra lớp validation ném lỗi phù hợp.

### TDS-05 — Test Data Requirements

| Fixture ID       | Type    | Value / Logic                                                   | Mục đích                             |
| :--------------- | :------ | :-------------------------------------------------------------- | :-------------------------------------- |
| **FX-001** | DB Seed | User `admin@nguson.com`, status `ACTIVE`, role `ADMIN`    | Test tài khoản admin                  |
| **FX-002** | DB Seed | User `staff@nguson.com`, status `INACTIVE`, role `STAFF`  | Test đăng nhập tài khoản bị khóa |
| **FX-003** | DB Seed | Medical profile của guest có `explicitConsentSigned = true` | Happy path cho lưu hồ sơ             |
| **FX-004** | DB Seed | Dữ liệu nhạy cảm CCCD:`123456789012`                      | Kiểm tra thuật toán mã hóa AES     |

---

## 4. Test Case Specification

### `AUTH-TC-001` — Đăng ký tài khoản mới trùng Email bị từ chối

* **Severity**: HIGH
* **Feature Under Test**: `UserServiceImpl.signUp()`
* **Test File**: [AuthControllerTest.java](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/src/test/java/fu/se/smms/controller/AuthControllerTest.java)
* **TDD Phase**: 🟢 GREEN
* **Condition Ref**: `TC-COND-001`

#### Preconditions:

* Email `guest1@gmail.com` đã tồn tại trong DB.

#### Test Steps:

1. Chuẩn bị `SignUpRequest` với email trùng `guest1@gmail.com`.
2. Gọi API `POST /api/auth/register`.
3. Kiểm tra xem hệ thống có trả về lỗi `400 Bad Request` hay không.

#### Expected Result (PASS):

* Ném ra lỗi báo email đã được sử dụng, không cho phép đăng ký.

---

### `AUTH-TC-002` — Đăng nhập tài khoản hoạt động trả về JWT Token

* **Severity**: CRITICAL
* **Feature Under Test**: `UserServiceImpl.login()`
* **Test File**: [AuthControllerTest.java](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/src/test/java/fu/se/smms/controller/AuthControllerTest.java)
* **TDD Phase**: 🟢 GREEN
* **Condition Ref**: `TC-COND-002`

#### Preconditions:

* Tài khoản hoạt động tồn tại với password đã mã hóa BCrypt trong DB.

#### Test Steps:

1. Gửi payload đăng nhập với email và password đúng.
2. Gọi API `POST /api/auth/login`.
3. Kiểm tra status code là `200 OK` và response chứa JWT token.

#### Expected Result (PASS):

* Trả về JWT token hợp lệ chứa thông tin email và role của người dùng.

---

### `AUTH-TC-003` — Tài khoản bị khóa (status = INACTIVE) bị chặn đăng nhập

* **Severity**: CRITICAL
* **Legal**: BR-22 (Locked staff restriction)
* **Feature Under Test**: `UserServiceImpl.login()`
* **Test File**: [AuthControllerTest.java](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/src/test/java/fu/se/smms/controller/AuthControllerTest.java)
* **TDD Phase**: 🟢 GREEN
* **Condition Ref**: `TC-COND-003`

#### Preconditions:

* Nhân viên `locked_staff@nguson.com` có status là `INACTIVE`.

#### Test Steps:

1. Gửi request đăng nhập cho `locked_staff@nguson.com` với mật khẩu đúng.
2. Gọi API `POST /api/auth/login`.
3. Kiểm tra xem API có chặn và ném lỗi phù hợp không.

#### Expected Result (PASS):

* Trả về lỗi `400 Bad Request` chứa thông điệp cảnh báo tài khoản đang bị khóa.

---

### `AUTH-TC-004` — Lưu hồ sơ sức khỏe không có Consent bị từ chối

* **Severity**: CRITICAL
* **Legal**: Decree 13/2023/NĐ-CP (Consent requirements)
* **Feature Under Test**: `MedicalProfileController` / `MedicalProfileService`
* **Test File**: [MedicalProfileControllerTest.java](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/src/test/java/fu/se/smms/controller/MedicalProfileControllerTest.java)
* **TDD Phase**: 🟢 GREEN
* **Condition Ref**: `TC-COND-004`

#### Preconditions:

* Khách hàng đã đăng nhập và gửi request không tích chọn đồng ý điều khoản xử lý dữ liệu.

#### Test Steps:

1. Tạo request lưu hồ sơ với `explicitConsentSigned = false`.
2. Gửi request tới endpoint `POST /api/medical-profiles/me`.
3. Kiểm tra xem API có trả về lỗi `400 Bad Request` hay không.

#### Expected Result (PASS):

* API trả về lỗi `400 Bad Request` ngăn không cho lưu thông tin y tế xuống database.

---

### `AUTH-TC-005` — Lưu hồ sơ sức khỏe tự động mã hóa AES-256

* **Severity**: CRITICAL
* **OWASP**: A02 Cryptographic Failures
* **CWE**: CWE-311 Missing Encryption of Sensitive Data
* **Feature Under Test**: `AESCryptoConverter`
* **TDD Phase**: 🟢 GREEN
* **Condition Ref**: `TC-COND-005`

#### Preconditions:

* `explicitConsentSigned = true`.

#### Test Steps:

1. Khách hàng gửi thông tin bệnh lý "Đau thắt lưng cột sống".
2. Thực hiện lưu thông tin xuống database.
3. Kiểm tra giá trị lưu tại cột `physical_condition_encrypted` trong DB.

#### Expected Result (PASS):

* Cột trong database chứa chuỗi ký tự đã mã hóa (Base64), không xuất hiện plaintext "Đau thắt lưng cột sống".
* Khi truy vấn thông tin, Java giải mã ngược lại chính xác plaintext ban đầu.

---

### `AUTH-TC-009` — Google Login không ghi đè họ tên hiện tại nếu đã có dữ liệu

* **Severity**: HIGH
* **Feature Under Test**: `UserServiceImpl.loginWithGoogle()`
* **TDD Phase**: 🟢 GREEN
* **Condition Ref**: `TC-COND-009`

#### Preconditions:

* Tài khoản Google đã tồn tại trong hệ thống và người dùng đã thay đổi tên cá nhân của họ thành "Nguyễn Văn B" (khác với tên hiển thị Google mặc định "Nguyễn Văn A").

#### Test Steps:

1. Gửi yêu cầu đăng nhập bằng Google với email tương ứng và `fullName = "Nguyễn Văn A"`.
2. Kiểm tra dữ liệu `fullName` trong database sau khi đăng nhập thành công.

#### Expected Result (PASS):

* Tên hiển thị trong database vẫn là "Nguyễn Văn B" (không bị cập nhật đè lại thành "Nguyễn Văn A").

---

## SECURITY TEST CASES

### `AUTH-TC-SEC-001` — Chặn xem hồ sơ bệnh án nhạy cảm của người dùng khác (Broken Access Control)

* **Severity**: CRITICAL
* **OWASP**: A01:2021 — Broken Access Control
* **CWE**: CWE-285 Improper Authorization
* **Feature Under Test**: `MedicalProfileController` GET API

#### Preconditions:

* Khách hàng A đăng nhập vào hệ thống và có JWT token.

#### Test Steps (Attack Simulation):

1. Khách hàng A gửi request lấy hồ sơ sức khỏe của Khách hàng B (`GET /api/medical-profiles/me` nhưng truyền context hoặc tham số giả mạo ID người khác).
2. Kiểm tra response từ server.

#### Expected Result (PASS = Hệ thống an toàn):

* Trả về lỗi `403 Forbidden` hoặc chỉ lấy ra đúng thông tin của chính tài khoản đang đăng nhập (Khách hàng A).

---

## INTEGRATION TEST CASES

### `AUTH-TC-INT-001` — Đồng bộ cập nhật trạng thái nhân viên từ Admin Controller xuống database

* **Severity**: HIGH
* **Feature Under Test**: `AdminController.updateUserRoleAndStatus()`
* **TDD Phase**: 🟢 GREEN

#### Preconditions:

* Tài khoản Staff ID = 2 có trạng thái ban đầu là `ACTIVE`.
* Tài khoản Admin đăng nhập để thực hiện thay đổi.

#### Test Steps:

1. Admin gửi request `PUT /api/admin/users/2` với body `{ "status": "INACTIVE" }`.
2. Query trực tiếp database tìm dòng user ID = 2.
3. Kiểm tra giá trị cột `status` trong DB.

#### Expected Result (PASS):

* Database cập nhật thành công giá trị `status` thành `INACTIVE`.
* Nhân viên ID = 2 lập tức bị chặn không thể thực hiện các thao tác yêu cầu xác thực.

---

## 5. Red-Green-Refactor Tracker

| TC ID           | Test File                             | 🔴 RED confirmed | 🟢 GREEN (commit) | 🔵 REFACTOR note                            |
| :-------------- | :------------------------------------ | :--------------: | :---------------- | :------------------------------------------ |
| `AUTH-TC-001` | `AuthControllerTest.java`           |        ✅        | `39f997f`       | Tối ưu hóa kiểm tra email tồn tại     |
| `AUTH-TC-003` | `AuthControllerTest.java`           |        ✅        | `39f997f`       | Chặn tài khoản staff bị khóa           |
| `AUTH-TC-004` | `MedicalProfileControllerTest.java` |        ✅        | `39f997f`       | Bắt buộc kiểm tra explicit consent       |
| `AUTH-TC-005` | `AESCryptoConverter.java`           |        ✅        | `39f997f`       | Đưa logic mã hóa vào JPA converter     |
| `AUTH-TC-009` | `UserServiceImpl.java`              |        ✅        | `39f997f`       | Chỉ cập nhật tên từ Google nếu trống |

---

## 6. Entry / Exit Criteria

### Entry Criteria (Điều kiện bắt đầu)

* [X] Cấu trúc database trong [resort_spa_db.sql](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/src/main/resources/application.properties) được thiết lập hoàn tất.
* [X] Định nghĩa API endpoints cho Module 1 trong [AuthController.java](file:///d:/Semester5/P/Project/su26-swp391-se2023-g3/05-Development/backend/src/main/java/fu/se/smms/controller/AuthController.java) được thông qua.

### Exit Criteria (DoD - Điều kiện hoàn thành)

* [X] 100% unit tests của Module 1 chạy thành công vượt qua kiểm thử tự động.
* [X] Đảm bảo dữ liệu CCCD/Hộ chiếu và Tình trạng thể chất nhạy cảm luôn được mã hóa trong database.
* [X] Tỷ lệ kiểm thử tự động bao phủ (test coverage) đạt trên 80% đối với các nghiệp vụ bảo mật cốt lõi.

---

## 7. Rollback Plan

```bash
# Phục hồi mã nguồn trước khi tích hợp
git checkout -- src/main/java/fu/se/smms/service/impl/UserServiceImpl.java
git checkout -- src/main/java/fu/se/smms/controller/AuthController.java

# Khôi phục database từ tệp backup gần nhất nếu có sự cố mã hóa dữ liệu nghiêm trọng
RESTORE DATABASE ResortSpaDB FROM DISK = 'D:\Backups\ResortSpaDB_backup.bak' WITH REPLACE;
```
