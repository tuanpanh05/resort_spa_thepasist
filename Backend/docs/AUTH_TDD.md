# SMMS Authentication & Sensitive Health Profile Backend TDD Specification

* **Document ID:** SMMS-AUTH-TDD-001
* **Version:** 1.0
* **Date:** 2026-06-11
* **Status:** Draft
* **Standard:** ISO/IEC/IEEE 29119-3:2021 aligned
* **Author:** Student 1 - Full-stack Engineer
* **Classification:** Internal

---

## CHANGELOG

| Ngày | Người thực hiện | Nội dung thay đổi |
| :--- | :--- | :--- |
| 2026-06-11 | Student 1 | Khởi tạo tài liệu - Thiết kế TDD spec cho tính năng đăng ký, xác thực, và quản lý hồ sơ bệnh án nhạy cảm |

---

## 1. Thông tin Module

| Field | Value |
| :--- | :--- |
| **Feature / Gap ID** | GAP-AUTH-001 |
| **Module** | Authentication & Sensitive Health Profile |
| **Spec gốc** | `Backend/docs/AUTH_EDS.md` |
| **Priority** | 🔴 P0 (Core Security and PII Compliance) |
| **Sprint** | S1 |
| **Data Classification** | Sensitive-PII / PII |
| **Compliance Scope** | Nghị định 13/2023/NĐ-CP Điều 4, 6; Luật Cư trú 2020 |
| **Upstream Dependencies** | None |
| **Downstream Consumers** | Module 2 (Booking), Module 3 (Spa Schedule), Module 4 (Dietary F&B) |

---

## 2. Logic Issues Resolved

| # | Spec gốc (sai / thiếu) | Thực tế (schema / policy) | Fix áp dụng trong test |
| :--- | :--- | :--- | :--- |
| **L1** | Thiếu ràng buộc Validate Consent trên UI. | Checkbox đồng ý xử lý thông tin nhạy cảm phải trống mặc định. | Test case `AUTH-TC-005` kiểm tra việc API từ chối lưu profile nếu `explicit_consent_signed = false`. |
| **L2** | Xóa dữ liệu sức khỏe phải được Admin duyệt thủ công (SRS UC-15). | Đề bài yêu cầu tự động xóa dữ liệu khi kết thúc kỳ nghỉ để bảo vệ riêng tư. | Test case `AUTH-TC-INT-001` kiểm tra background job scheduler quét các booking `CHECKED_OUT` và tự động xóa data nhạy cảm. |
| **L3** | Chưa đặc tả thiết kế kỹ thuật của mã hóa DB. | Bắt buộc mã hóa AES-256 đối với Passport, Bệnh lý, và Dị ứng. | Test case `AUTH-TC-006` kiểm tra dữ liệu lưu xuống DB là chuỗi mã hóa và Java giải mã chính xác plaintext. |
| **L4** | Chưa chặn đăng nhập của tài khoản bị khóa. | Các tài khoản nhân viên bị Admin khóa (`status = INACTIVE`) phải bị chặn đăng nhập. | Test case `AUTH-TC-004` kiểm tra thông tin đăng nhập đúng của tài khoản locked vẫn trả về 403. |
| **L5** | Phạm vi quản lý Master Data bị phân tán. | Các bảng Master Data được chỉnh sửa bởi Admin nhưng đọc bởi nhiều Module khác. | Định nghĩa rõ ràng interface và endpoints read-only công khai cho packages/room_types/services. |

---

## 3. Test Design Specification (TDS)

### TDS-01 — Scope / Phạm vi
`Authentication & Sensitive Health Profile` bao gồm các layer được kiểm thử:
- [x] **Domain** (AES Crypto Converter pure functions)
- [x] **Application / Use Cases** (Mocking JPA repositories, token providers, mailers)
- [x] **Controller** (MockMvc endpoints, status code assertions, JWT filter testing)
- [x] **Integration** (Integration tests với database test container)

### TDS-02 — Test Basis / Cơ sở Kiểm thử
* `Module_1.md` UC01 -> UC05
* Nghị định 13/2023/NĐ-CP Điều 6 (Sự đồng ý rõ ràng)
* `resort_spa_db.sql` constraints (`CK_User_Role`, `CK_User_Status`)

### TDS-03 — Test Conditions and Coverage Items

| Condition ID | Test Condition | Coverage Item | Test Cases |
| :--- | :--- | :--- | :--- |
| **TC-COND-001** | Trùng email khi đăng ký mới bị từ chối | `UserServiceImpl.register()` | `AUTH-TC-001` |
| **TC-COND-002** | OTP token xác thực email hợp lệ kích hoạt tài khoản | `AuthService.verifyEmailToken()` | `AUTH-TC-002` |
| **TC-COND-003** | Đăng nhập tài khoản hoạt động trả về JWT | `AuthService.login()` | `AUTH-TC-003` |
| **TC-COND-004** | Tài khoản bị khóa (status=INACTIVE) bị từ chối đăng nhập | `AuthService.login()` | `AUTH-TC-004` |
| **TC-COND-005** | Lưu hồ sơ sức khỏe không có consent bị từ chối | `MedicalProfileService.save()` | `AUTH-TC-005` |
| **TC-COND-006** | Lưu hồ sơ sức khỏe có consent thực hiện mã hóa AES tự động | `MedicalProfile` JPA write | `AUTH-TC-006` |
| **TC-COND-007** | Phân quyền RBAC lọc dữ liệu nhạy cảm theo role (Therapist vs Chef) | `MedicalProfileService.getForRole()`| `AUTH-TC-007` |
| **TC-COND-008** | Khách tự yêu cầu xóa sạch hồ sơ nhạy cảm của mình | `MedicalProfileService.delete()` | `AUTH-TC-008` |
| **TC-COND-009** | Scheduler chạy tự động xóa thông tin của khách đã checkout | `SensitiveDataCleanupScheduler` | `AUTH-TC-INT-001` |

### TDS-04 — Test Techniques / Kỹ thuật Kiểm thử
- **Equivalence Partitioning**: Phân nhóm role hợp lệ (`THERAPIST`, `CHEF`, `RECEPTIONIST`) để kiểm tra quyền đọc dữ liệu nhạy cảm.
- **State Transition Testing**: Chuyển trạng thái user `INACTIVE` -> `ACTIVE` qua OTP.
- **Error Guessing**: Giả lập payload không có consent để xem hệ thống chặn ở mức service.

### TDS-05 — Test Data Requirements

| Fixture ID | Type | Value / Logic | Mục đích |
| :--- | :--- | :--- | :--- |
| **FX-001** | DB Seed | User `guest1@gmail.com`, status `ACTIVE` | Đăng nhập hợp lệ |
| **FX-002** | DB Seed | User `locked_staff@nguson.vn`, status `INACTIVE` | Đăng nhập tài khoản bị khóa |
| **FX-003** | DB Seed | Medical profile của guest1 có consent | Kiểm tra phân quyền truy cập |
| **FX-004** | DB Seed | Booking của guest1 có trạng thái `CHECKED_OUT` kết thúc cách đây 8 ngày | Kiểm tra auto deletion |
| **FX-005** | Keys | `security.aes.secret-key=U2FsdGVkX19zZWNyZXQxMjM0NTY3ODk=` | Secret key dùng cho AES converter |

---

## 4. Test Case Specification

### `AUTH-TC-001` — Đăng ký email trùng lặp bị từ chối
* **Severity:** HIGH
* **Feature Under Test:** `UserServiceImpl.register()`
* **TDD Phase:** 🟢 GREEN (Target implementation ready)
* **Condition Ref:** `TC-COND-001`

#### Preconditions:
- Email `guest1@gmail.com` đã tồn tại trong DB (FX-001).

#### Test Steps:
1. Arrange: Tạo request đăng ký mới với email `guest1@gmail.com`.
2. Act: Gọi `userService.register(dto)`.
3. Assert: Kiểm tra exception ném ra là `BusinessException` với code `AUTH-001`.

#### Expected Result (PASS):
- Ném ra `BusinessException` mã `AUTH-001`. Không ghi đè bản ghi cũ.

---

### `AUTH-TC-004` — Tài khoản nhân viên bị khóa không được đăng nhập
* **Severity:** CRITICAL
* **Legal:** BR-22 (Locked staff restriction)
* **Feature Under Test:** `AuthService.login()`
* **TDD Phase:** 🔴 RED
* **Condition Ref:** `TC-COND-004`

#### Preconditions:
- Nhân viên `locked_staff@nguson.vn` có status là `INACTIVE` (FX-002).

#### Test Steps:
1. Arrange: Chuẩn bị payload đăng nhập với email `locked_staff@nguson.vn` và password đúng.
2. Act: Gọi `authService.login(dto)`.
3. Assert: Kiểm tra xem API có chặn đăng nhập và ném ra exception không.

#### Expected Result (PASS):
- Ném ra `BusinessException` với HTTP Status `403 Forbidden` và mã lỗi `AUTH-004`.

#### Expected Result (FAIL):
- Đăng nhập thành công và trả về JWT Token.

---

### `AUTH-TC-005` — Lưu Medical Profile không có consent bị từ chối
* **Severity:** CRITICAL
* **Legal:** Decree 13/2023/NĐ-CP (Consent requirements)
* **Feature Under Test:** `IMedicalProfileService.saveOrUpdateProfile()`
* **TDD Phase:** 🔴 RED
* **Condition Ref:** `TC-COND-005`

#### Preconditions:
- Khách hàng đã đăng nhập và có JWT hợp lệ.

#### Test Steps:
1. Arrange: Tạo `MedicalProfileDTO` với `explicitConsentSigned = false`.
2. Act: Gọi `medicalProfileService.saveOrUpdateProfile(dto, userId)`.
3. Assert: Kiểm tra xem có ném ra exception `AUTH-003` hay không.

#### Expected Result (PASS):
- Trả về lỗi `400 Bad Request` chứa mã lỗi `AUTH-003`.

#### Expected Result (FAIL):
- Lưu thành công dữ liệu xuống DB mặc dù không có sự đồng ý của khách hàng.

---

### `AUTH-TC-006` — Lưu Medical Profile tự động mã hóa AES-256
* **Severity:** CRITICAL
* **OWASP:** A02 Cryptographic Failures
* **CWE:** CWE-311 Missing Encryption of Sensitive Data
* **Feature Under Test:** `IMedicalProfileRepository.save()`
* **TDD Phase:** 🔴 RED
* **Condition Ref:** `TC-COND-006`

#### Preconditions:
- Khách hàng đồng ý cung cấp thông tin (`explicitConsentSigned = true`).

#### Test Steps:
1. Arrange: Chuẩn bị thông tin bệnh lý: "Bị gai cột sống" và dị ứng: "Dị ứng lạc".
2. Act: Gọi `medicalProfileService.saveOrUpdateProfile(dto, userId)`.
3. Assert: Kiểm tra thực thể trong database thô thông qua native SQL.

#### Expected Result (PASS):
- Dữ liệu thô trong bảng `medical_profile` tại các cột `physical_condition_encrypted` và `food_allergies_encrypted` không được chứa plaintext "gai cột sống" hoặc "lạc" mà phải là chuỗi base64 đã mã hóa.
- Khi gọi API GET thông tin, Java giải mã ngược lại chính xác thành plaintext để hiển thị trên UI.

---

### `AUTH-TC-007` - Phân quyền RBAC lọc trường dữ liệu nhạy cảm theo role
* **Severity:** HIGH
* **OWASP:** A01 Broken Access Control
* **Feature Under Test:** `IMedicalProfileService.getForRole()`
* **TDD Phase:** 🔴 RED
* **Condition Ref:** `TC-COND-007`

#### Preconditions:
- Seed dữ liệu Medical Profile của Khách hàng có đầy đủ thông tin bệnh lý và dị ứng (FX-003).

#### Test Steps:
1. Arrange: Đăng nhập với role `CHEF`.
2. Act: Gọi `medicalProfileService.getForRole(customerId, "CHEF")`.
3. Assert: Kiểm tra DTO trả về.
4. Arrange: Đăng nhập với role `THERAPIST`.
5. Act: Gọi `medicalProfileService.getForRole(customerId, "THERAPIST")`.
6. Assert: Kiểm tra DTO trả về.

#### Expected Result (PASS):
- Đối với `CHEF`: DTO chỉ chứa thông tin dị ứng thực phẩm (`foodAllergiesPlaintext`), còn thông tin bệnh lý vật lý (`physicalConditionPlaintext`) bị set thành `null`.
- Đối với `THERAPIST`: DTO chỉ chứa thông tin bệnh lý vật lý, còn thông tin dị ứng bị set thành `null`.

---

### INTEGRATION TEST CASES

### `AUTH-TC-INT-001` — Background Job tự động xóa dữ liệu khách đã checkout
* **Severity:** HIGH
* **Feature Under Test:** `SensitiveDataCleanupScheduler.cleanupSensitiveData()`
* **TDD Phase:** 🔴 RED
* **Condition Ref:** `TC-COND-009`

#### Preconditions:
- Seed thông tin booking của khách đã checkout quá 7 ngày (`CHECKED_OUT`) (FX-004).
- Seed thông tin Medical Profile đầy đủ của khách hàng này trong DB.

#### Test Steps:
1. Act: Kích hoạt chạy phương thức `cleanupSensitiveData()` của background job scheduler.
2. Assert: Đọc lại bản ghi `medical_profile` của khách hàng này trong database.

#### Expected Result (PASS):
- Cột `physical_condition_encrypted` trong DB phải đổi thành `NULL`.
- Cột `food_allergies_encrypted` phải đổi thành `NULL`.
- Cột `explicit_consent_signed` phải đổi thành `0` (false).
- Bản ghi `User` vẫn được giữ lại (chỉ xóa thông tin sức khỏe nhạy cảm).

---

## 5. Red-Green-Refactor Tracker

| TC ID | Test File | 🔴 RED confirmed | 🟢 GREEN (commit) | 🔵 REFACTOR note |
| :--- | :--- | :---: | :--- | :--- |
| `AUTH-TC-004` | `AuthServiceImplTest.java` | [ ] | [ ] | Chặn đăng nhập account bị khóa |
| `AUTH-TC-005` | `MedicalProfileServiceImplTest.java`| [ ] | [ ] | Validate consent checkbox |
| `AUTH-TC-006` | `AESCryptoConverterTest.java` | [ ] | [ ] | Mã hóa tự động mức JPA |
| `AUTH-TC-007` | `MedicalProfileServiceImplTest.java`| [ ] | [ ] | Phân quyền Therapist vs Chef |
| `AUTH-TC-INT-001`| `SensitiveDataCleanupSchedulerTest.java`| [ ] | [ ] | Scheduler tự động xóa |

---

## 6. Entry / Exit Criteria

### Entry Criteria
- [ ] Database schema trong file SQL đã được áp dụng.
- [ ] Interface DAO/Repository cho `User` và `MedicalProfile` đã được định nghĩa.

### Exit Criteria (DoD)
- [ ] 100% unit tests và integration tests liên quan đến bảo mật và mã hóa đạt màu xanh (PASS).
- [ ] Không leak dữ liệu nhạy cảm thô ra log.
- [ ] Test coverage cho các lớp liên quan đến mã hóa và bảo mật đạt $\ge 80\%$.

---

## 7. Rollback Plan

```bash
# Phục hồi mã nguồn trước khi tích hợp
git checkout -- src/main/java/fu/se/smms/config/SecurityConfig.java
git checkout -- src/main/java/fu/se/smms/entity/MedicalProfile.java
```

Nếu dữ liệu bị mã hóa sai khóa và không thể giải mã trên production, tiến hành khôi phục cơ sở dữ liệu từ file backup định kỳ gần nhất:
```sql
USE master;
RESTORE DATABASE ResortSpaDB FROM DISK = 'C:\Backups\ResortSpaDB_backup.bak' WITH REPLACE;
```
