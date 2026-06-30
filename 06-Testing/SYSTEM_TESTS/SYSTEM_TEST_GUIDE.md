# 🖥️ SYSTEM TESTS – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `06-Testing/SYSTEM_TESTS/`  
> **Mục đích:** Kiểm thử toàn hệ thống End-to-End (E2E) – mô phỏng luồng sử dụng thực tế của từng vai trò người dùng xuyên suốt các module.  
> **Công cụ:** Playwright (E2E Browser Tests) | Postman Collection Runner | Newman CLI

---

## Chiến lược System Test

System test kiểm tra các **kịch bản đầu-cuối (End-to-End scenarios)** – không phải từng API riêng lẻ mà là toàn bộ journey của người dùng:

```
Guest Journey:   Homepage → Search Rooms → Select Package → Health Profile → Pay → Check-In → 
                 Book Spa → Order Food → Check-Out → Invoice → Rate Resort

Staff Journey:   Login → View Arrivals → Check-In Guest → Monitor Bookings → Manage Tasks

Chef Journey:    Login → View Today's Orders → Check Allergy Alerts → Update Order Status

Therapist:       Login → View My Schedule → Update Session Status → Sync Calendar
```

---

## Kịch bản 1: Guest Full Journey (Happy Path)

### Test: `guest_full_journey.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Guest Full Booking & Stay Journey', () => {
  
  test('SYS-001: Đăng ký tài khoản và xác thực email', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Click đăng ký
    await page.click('#btn-register');
    await page.fill('#input-email', 'newguest.test@gmail.com');
    await page.fill('#input-password', 'SecurePass123!');
    await page.fill('#input-fullname', 'Nguyen Van Test');
    await page.click('#btn-submit-register');
    
    // Kiểm tra thông báo gửi OTP
    await expect(page.locator('#toast-success')).toContainText('Vui lòng kiểm tra email');
  });

  test('SYS-002: Tìm kiếm và đặt phòng với gói trị liệu', async ({ page }) => {
    // Login
    await loginAs(page, 'guest@test.com', 'Pass123!');
    
    // Tìm phòng
    await page.goto('/rooms');
    await page.fill('#input-checkin', '2026-07-15');
    await page.fill('#input-checkout', '2026-07-18');
    await page.click('#btn-search-rooms');
    
    // Chọn phòng
    await page.click('.room-card:first-child #btn-book-now');
    
    // Chọn gói trị liệu Xoai Aura 3 ngày
    await page.click('#package-3-days');
    
    // Kiểm tra giá hiển thị đúng
    const priceText = await page.locator('#total-price').textContent();
    expect(priceText).toContain('7,500,000');
    
    // Xác nhận đặt phòng
    await page.click('#btn-confirm-booking');
    
    // Chuyển sang thanh toán deposit VNPay
    await expect(page).toHaveURL(/vnpayment\.vn|\/payment/);
  });

  test('SYS-003: Khai báo hồ sơ sức khỏe với unchecked consent', async ({ page }) => {
    await loginAs(page, 'guest@test.com', 'Pass123!');
    await page.goto('/health-profile');
    
    // Verify các checkbox PHẢI ở trạng thái unchecked mặc định
    const consentCheckbox = page.locator('#consent-health-data');
    await expect(consentCheckbox).not.toBeChecked();
    
    // Thử submit khi chưa tích consent
    await page.click('#btn-submit-health');
    await expect(page.locator('#error-consent')).toBeVisible();
    
    // Tích consent và submit
    await consentCheckbox.check();
    await page.fill('#input-physical-condition', 'Đau lưng nhẹ');
    await page.fill('#input-food-allergies', 'Hải sản');
    await page.click('#btn-submit-health');
    
    await expect(page.locator('#toast-success')).toContainText('Hồ sơ đã được lưu');
  });

  test('SYS-004: Đặt lịch Spa trong gói trị liệu', async ({ page }) => {
    await loginAs(page, 'guest@test.com', 'Pass123!');
    await page.goto('/spa');
    
    // Chọn dịch vụ
    await page.click('#service-swedish-massage');
    
    // Chọn ngày giờ
    await page.click('#date-2026-07-16');
    await page.click('#timeslot-10-00');
    
    // Chọn therapist
    await page.click('.therapist-card:first-child');
    
    // Xác nhận đặt lịch
    await page.click('#btn-confirm-spa');
    
    await expect(page.locator('#confirmation-modal')).toBeVisible();
    await expect(page.locator('#google-calendar-link')).toBeVisible();
  });

  test('SYS-005: Đặt món ăn với menu đã lọc dị ứng', async ({ page }) => {
    await loginAs(page, 'guest_seafood_allergy@test.com', 'Pass123!');
    await page.goto('/restaurant');
    
    // Verify không hiển thị món hải sản
    const seafoodItems = page.locator('.menu-item[data-category="seafood"]');
    await expect(seafoodItems).toHaveCount(0);
    
    // Đặt món an toàn
    await page.click('.menu-item:first-child #btn-add-to-order');
    await page.click('#btn-confirm-order');
    
    await expect(page.locator('#order-status')).toContainText('Đang chờ xác nhận');
  });

  test('SYS-006: Checkout và thanh toán hóa đơn cuối', async ({ page }) => {
    await loginAs(page, 'receptionist@resort.com', 'Recept123!');
    await page.goto('/staff-dashboard');
    
    // Tìm booking cần checkout
    await page.click('#tab-departures');
    await page.click('.booking-row:first-child #btn-checkout');
    
    // Kiểm tra nút Checkout disabled khi còn nợ
    const checkoutBtn = page.locator('#btn-confirm-checkout');
    await expect(checkoutBtn).toBeDisabled(); // Còn nợ F&B
    
    // Sau khi khách thanh toán
    await simulatePayment(page);
    await expect(checkoutBtn).toBeEnabled();
    
    // Xác nhận checkout
    await checkoutBtn.click();
    await expect(page.locator('#checkout-success')).toBeVisible();
  });
});
```

---

## Kịch bản 2: Receptionist Journey

### Test: `staff_journey.spec.ts`

```typescript
test.describe('Receptionist Daily Operations', () => {

  test('SYS-010: Xem và quản lý danh sách khách đến hôm nay', async ({ page }) => {
    await loginAs(page, 'receptionist@resort.com', 'Recept123!');
    
    await page.goto('/staff-dashboard');
    await page.click('#tab-todays-arrivals');
    
    // Phải thấy danh sách khách check-in hôm nay
    const arrivalRows = page.locator('#arrivals-table .booking-row');
    await expect(arrivalRows).toHaveCount(greaterThan(0));
    
    // Mỗi row có đủ thông tin cần thiết
    await expect(arrivalRows.first().locator('.guest-name')).toBeVisible();
    await expect(arrivalRows.first().locator('.room-number')).toBeVisible();
    await expect(arrivalRows.first().locator('.btn-checkin')).toBeVisible();
  });

  test('SYS-011: Làm thủ tục Check-In với khai báo tạm trú', async ({ page }) => {
    await loginAs(page, 'receptionist@resort.com', 'Recept123!');
    
    await page.click('.booking-row:first-child #btn-checkin');
    
    // Nhập số CCCD/Hộ chiếu (sẽ được mã hóa phía server)
    await page.fill('#input-passport', 'A12345678');
    await page.fill('#input-guest-fullname', 'Nguyen Van A');
    await page.click('#btn-confirm-checkin');
    
    await expect(page.locator('#checkin-success')).toBeVisible();
    
    // Trạng thái phòng phải đổi sang OCCUPIED
    await expect(page.locator('.room-status')).toContainText('OCCUPIED');
  });
});
```

---

## Kịch bản 3: Chef Dashboard Journey

### Test: `chef_journey.spec.ts`

```typescript
test.describe('Chef Kitchen Operations', () => {

  test('SYS-020: Chef xem danh sách order với cảnh báo dị ứng', async ({ page }) => {
    await loginAs(page, 'chef@resort.com', 'Chef123!');
    
    await page.goto('/chef-dashboard');
    
    // Phải thấy cảnh báo dị ứng nổi bật
    const allergyWarnings = page.locator('.allergy-warning-badge');
    await expect(allergyWarnings.first()).toBeVisible();
    
    // Click vào order có dị ứng
    await page.click('.order-row[data-has-allergy="true"]:first-child');
    
    // Modal phải hiển thị THÔNG TIN DỊ ỨNG, không phải medical condition
    await expect(page.locator('#allergy-details')).toBeVisible();
    await expect(page.locator('#physical-condition')).not.toBeVisible(); // RBAC enforcement
  });

  test('SYS-021: Chef cập nhật trạng thái món ăn', async ({ page }) => {
    await loginAs(page, 'chef@resort.com', 'Chef123!');
    
    await page.click('.order-row:first-child #btn-start-cooking');
    await expect(page.locator('.order-status')).toContainText('PREPARING');
    
    await page.click('#btn-ready-to-serve');
    await expect(page.locator('.order-status')).toContainText('READY');
  });
});
```

---

## Kịch bản 4: Admin Analytics Journey

### Test: `admin_analytics.spec.ts`

```typescript
test.describe('Admin Revenue & Analytics', () => {

  test('SYS-030: Admin xem báo cáo doanh thu theo tháng', async ({ page }) => {
    await loginAs(page, 'manager@resort.com', 'Manager123!');
    
    await page.goto('/admin-dashboard');
    await page.click('#tab-revenue-reports');
    
    // Chọn tháng 6/2026
    await page.selectOption('#select-month', '2026-06');
    await page.click('#btn-generate-report');
    
    // Phải có biểu đồ doanh thu
    await expect(page.locator('#revenue-chart')).toBeVisible();
    
    // Phải có breakdown theo loại dịch vụ
    await expect(page.locator('#room-revenue')).toBeVisible();
    await expect(page.locator('#spa-revenue')).toBeVisible();
    await expect(page.locator('#food-revenue')).toBeVisible();
    
    // Có thể xuất Excel/PDF
    await page.click('#btn-export-excel');
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('revenue_report');
  });

  test('SYS-031: Admin xem báo cáo utilization của Therapist', async ({ page }) => {
    await loginAs(page, 'manager@resort.com', 'Manager123!');
    
    await page.goto('/admin-dashboard');
    await page.click('#tab-therapist-utilization');
    
    // Mỗi therapist phải có % utilization hiển thị
    const therapistRows = page.locator('#therapist-table .therapist-row');
    await expect(therapistRows.first().locator('.utilization-percent')).toBeVisible();
  });
});
```

---

## Performance Tests

### Lighthouse Performance Audit

```bash
# Chạy Lighthouse audit cho trang Home
npx lighthouse http://localhost:5173 --output=json --output-path=./lighthouse-home.json
npx lighthouse http://localhost:5173/booking --output=json --output-path=./lighthouse-booking.json
```

**Chỉ số Performance target:**

| Trang | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|---------------|-----|
| Home | ≥ 80 | ≥ 90 | ≥ 90 | ≥ 90 |
| Booking | ≥ 75 | ≥ 90 | ≥ 90 | ≥ 85 |
| Chef Dashboard | ≥ 75 | ≥ 85 | ≥ 90 | ≥ 80 |
| Admin Dashboard | ≥ 70 | ≥ 85 | ≥ 90 | ≥ 80 |

### Load Test (k6)

```javascript
// load_test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% requests < 2s
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  const response = http.get('http://localhost:8080/api/villas');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

---

## Hướng dẫn chạy System Tests

### Playwright E2E
```bash
cd 05-Development/frontend
npx playwright install
npx playwright test system_tests/ --reporter=html
# Xem kết quả: npx playwright show-report
```

### Postman Newman
```bash
newman run system_tests.postman_collection.json \
  --environment production.json \
  --delay-request 500 \
  --reporters cli,html,json
```

---

*Xem thêm: `06-Testing/TEST_CASES/` và `06-Testing/UAT/` cho User Acceptance Testing.*
