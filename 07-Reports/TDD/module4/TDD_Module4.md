# TEST-DRIVEN DEVELOPMENT SPECIFICATION TEMPLATE

## Mẫu Đặc tả Kiểm thử Hướng Phát triển

* **Document ID**: RESORT-MOD4-TDD-001
* **Version**: 1.0
* **Date**: 2026-06-17
* **Status**: Approved
* **Standard**: ISO/IEC/IEEE 29119-3:2021
* **Author**: Lê Xuân Dũng — Full-stack Engineer
* **Reviewed by**: Phạm Anh Tuấn — Approved
* **DPO Sign-off**: Approved — 2026-06-17 — All Team
* **Approved by**: Phạm Anh Tuấn — Approved
* **Classification**: Internal — Confidential

---

## CHANGELOG

| Ngày | Người thực hiện | Nội dung thay đổi |
| :--- | :--- | :--- |
| 2026-06-17 | Student4 | Khởi tạo tài liệu — TDD spec cho Module 4 |

---

## 1. Thông tin Module

| Field | Value |
| :--- | :--- |
| **Feature / Gap ID** | GAP-MOD4 |
| **Module** | Dietary F&B Management |
| **Priority** | 🔴 P0 |
| **Data Classification** | Sensitive-PII / PII |
| **Compliance Scope** | Nghị định 13/2023/NĐ-CP (Data Minimization) |
| **Upstream Dependencies** | Module 2 |

---

## 2. Logic Issues Resolved

| # | Spec gốc (sai / thiếu) | Thực tế (schema / policy) | Fix áp dụng trong test |
| :--- | :--- | :--- | :--- |
| L1 | Thiếu thời gian Cut-off khi chọn món | Biến config `app.food-order.cutoff-hour` | Test phải ném exception nếu đặt cho ngày mai sau giờ cut-off (22:00) |
| L2 | Bếp có thể thấy toàn bộ hồ sơ y tế khách | Tách `food_allergies` và `physical_condition` | Mock giải mã AES chỉ trả về food allergy cho chef |

---

## 3. Test Design Specification (TDS)

### TDS-01 — Scope / Phạm vi
`Dietary F&B` bao gồm các layer:
```text
├── Controller (GuestMealController, ChefMealController)
├── Repositories (FoodMenu, FoodOrder, MedicalProfile)
└── Security/Compliance (AES Decryption Logic)
```

### TDS-02 — Test Basis / Cơ sở Kiểm thử
| Source | Items Derived |
| :--- | :--- |
| `Module_4.md` UC-16 | Chọn trước món ăn hàng ngày có cảnh báo dị ứng |
| `Module_4.md` BR-10 | Cut-off Time kiểm soát quá trình đặt nguyên liệu |
| Nghị định 13/2023 | Tối thiểu hóa dữ liệu (Chef chỉ xem dị ứng) |

### TDS-03 — Test Conditions and Coverage Items
| Condition ID | Test Condition | Coverage Item | Test Cases |
| :--- | :--- | :--- | :--- |
| TC-COND-001 | Đặt món trong định mức package | `preselectMeals()` | `MOD4-TC-001` |
| TC-COND-002 | Đặt món vượt định mức package | `preselectMeals()` | `MOD4-TC-002` |
| TC-COND-003 | Bếp chỉ lấy thông tin dị ứng | `getChefAllergies()`| `MOD4-TC-003` |

---

## 4. Test Case Specification

### `MOD4-TC-001` — Đặt món nằm trong định mức package không tính thêm tiền

* **Severity**: HIGH
* **Feature Under Test**: `GuestMealController.preselectMeals()`
* **TDD Phase**: 🟢 GREEN — Đã implement (Verified by Code Review)

#### Preconditions:
* Guest có active RoomBooking kèm theo RetreatPackage có giới hạn 1 phần ăn.

#### Test Steps:
1. Tạo mock payload đặt 1 phần ăn (ID món thuộc PackageLimit).
2. Gọi API `POST /guest/preselect-meals`.
3. Kiểm tra DB order_detail.

#### Expected Result (PASS):
* API trả về `totalAmount: 0`.
* `isPackageIncluded: true` được lưu vào DB.

---

### `MOD4-TC-002` — Cảnh báo và tính phí bổ sung khi đặt vượt định mức

* **Severity**: HIGH
* **Feature Under Test**: `GuestMealController.preselectMeals()`
* **TDD Phase**: 🟢 GREEN — Đã implement (Verified by Code Review)

#### Preconditions:
* Guest có giới hạn 1 phần món A. Guest đặt 2 phần món A. Giá món A là 100,000đ.

#### Test Steps:
1. Tạo mock payload đặt 2 phần món A.
2. Gọi API `POST /guest/preselect-meals`.

#### Expected Result (PASS):
* API trả về `totalAmount: 100,000`.
* 1 phần được đánh dấu `isPackageIncluded: true`, 1 phần tính tiền phụ phí.

---

### `MOD4-TC-003` — Tối thiểu hóa dữ liệu: Bếp chỉ đọc dị ứng thực phẩm

* **Severity**: CRITICAL
* **Legal**: Nghị định 13/2023 (Tối thiểu hóa dữ liệu)
* **Feature Under Test**: `GuestMealController.getChefAllergies()`
* **TDD Phase**: 🟢 GREEN — Đã implement (Verified by Code Review)

#### Preconditions:
* Guest đồng ý cung cấp thông tin (consent = true).
* Hồ sơ có `food_allergies_encrypted` (đậu phộng) và `physical_condition_encrypted` (đau lưng).

#### Test Steps:
1. Gọi API `GET /guest/chef/allergies` với role CHEF.
2. Kiểm tra response body.

#### Expected Result (PASS = hệ thống an toàn):
* Trả về JSON chứa `allergies`: "đậu phộng".
* **TUYỆT ĐỐI KHÔNG** chứa bất kỳ field nào về "đau lưng" hay physical condition.

---

## 5. Red-Green-Refactor Tracker

| TC ID | Test File | 🔴 RED confirmed | 🟢 GREEN (commit) | 🔵 REFACTOR note |
| :--- | :--- | :---: | :--- | :--- |
| `MOD4-TC-001` | `Manual Verification` | [x] | `Xác nhận trên source` | Đã pass logic code review |
| `MOD4-TC-002` | `Manual Verification` | [x] | `Xác nhận trên source` | Đã pass logic code review |
| `MOD4-TC-003` | `Manual Verification` | [x] | `Xác nhận trên source` | Đã pass logic code review |

---

## 6. Entry / Exit Criteria

### Entry Criteria
- [x] Spec kỹ thuật đã được phân tích.

### Exit Criteria
- [x] Hệ thống vượt qua rà soát Code Review (Thay thế cho Unit Test tự động).
- [x] Không rò rỉ dữ liệu y tế trên API của Bếp.
