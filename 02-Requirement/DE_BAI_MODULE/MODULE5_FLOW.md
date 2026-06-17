# Module 5 - Payment & Checkout Flow (Consolidated)

## 1. Tổng quan kiến trúc

Module 5 quản lý toàn bộ luồng thanh toán, hóa đơn, phản hồi và báo cáo doanh thu. Bao gồm các UC21-UC25.

### 1.1 Security Config
```
File: Backend/src/main/java/fu/se/smms/config/SecurityConfig.java
```

| Endpoint | Access | Ghi chú |
|----------|--------|---------|
| `POST /bookings` | Public (`.permitAll()`) | Hỗ trợ cả khách ẩn danh, controller có fallback email `guest1@gmail.com` khi Principal null |
| `GET /invoices/{id}` | Authenticated (`.authenticated()`) | Yêu cầu JWT token |
| `POST /payments/vnpay/create` | Authenticated | Tạo URL thanh toán VNPay |
| `GET /payments/vnpay/return` | Public | VNPay redirect browser về sau thanh toán |
| `GET /payments/vnpay/verify` | Public | Frontend gọi xác thực callback VNPay |
| `GET|POST /payments/vnpay/ipn` | Public | VNPay server gọi IPN (Instant Payment Notification) |
| `GET /invoices/vnpay-return` | Public | Legacy callback endpoint |
| `GET /invoices/vnpay-callback` | Public | Legacy callback endpoint |
| `GET /invoices/vnpay-ipn` | Public | Legacy IPN endpoint |

## 2. Luồng chính: Đặt phòng → Thanh toán cọc VNPay → Xác nhận

### 2.1 Frontend: BookingPage.jsx

```
File: frontend/src/pages/BookingPage.jsx
API helper: frontend/src/api.js (bookingApi, paymentApi)
```

**Wizard 6 bước:**
1. **Step 1:** Thông tin khách hàng (check auth không bắt buộc)
2. **Step 2:** Hồ sơ sức khỏe & dị ứng (NĐ 356 consent)
3. **Step 3:** Chọn Villa & dịch vụ
4. **Step 4:** Chọn thực đơn (meal selections)
5. **Step 5:** Xác nhận đơn đặt (review)
6. **Step 6:** Thanh toán cọc (QR mock, hoặc auto-redirect VNPay)

### 2.2 Tạo Booking

**Frontend:** Bấm "Xác nhận & Thanh toán cọc" ở Step 5:

```javascript
// BookingPage.jsx - handleConfirmBooking
bookingApi.createBooking(payload)
  .then((data) => {
    if (data && data.invoiceId) {
      navigate(`/payment?invoiceId=${data.invoiceId}&paymentType=DEPOSIT`);
    }
  })
```

**API:** `POST /api/bookings`
- Controller: `BookingController.createBooking`
- Service: `BookingServiceImpl.createBooking`
- Response DTO: `BookingResponseDTO { bookingId, invoiceId, message, status, ... }`

**Backend flow:**
```
BookingController.createBooking
  └─ Principal principal (có thể null → fallback "guest1@gmail.com")
  └─ bookingService.createBooking(request, email)
      ├─ Validate packageId (tồn tại trong retreat_package table)
      ├─ Tạo User nếu chưa tồn tại (findByEmail + create nếu null)
      ├─ Tạo Booking entity
      ├─ Chọn Room available (phòng trống theo roomTypeId, check-in/check-out)
      ├─ Tạo RoomBookingDetail
      ├─ Tạo Invoice + InvoiceItems
      └─ Trả về BookingResponseDTO { bookingId, invoiceId, ... }
```

### 2.3 Trang Payment

**Frontend:** `frontend/src/pages/Payment.jsx`

Redirect từ BookingPage:
```
/payment?invoiceId={id}&paymentType=DEPOSIT
```

**Auth check:** Payment page kiểm tra token:
- **Có token** → gọi `GET /invoices/{id}` → hiển thị invoice + options thanh toán
- **Không token** → redirect `/dang-nhap?returnUrl=/payment?invoiceId=...` → sau login quay lại

**UI Payment tabs:**
- Tab **VNPay Sandbox**: Hiển thị thẻ test NCB + nút "Thanh toán cọc (DEPOSIT)" hoặc "Thanh toán số dư (FINAL)"
- Tab **Tiền mặt tại quầy**: Dành cho lễ tân

### 2.4 Chuỗi URL khi bấm nút "Thanh toán cọc"

#### Sơ đồ tổng quát

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     FULL URL CHAIN - THANH TOÁN VNPAY                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FRONTEND (Browser)                    BACKEND (Spring Boot)                 │
│  ─────────────────                     ─────────────────────                 │
│                                                                              │
│  [1] Payment.jsx                                                             │
│      Bấm "Thanh toán cọc (DEPOSIT)"                                          │
│      │                                                                       │
│      │  POST /api/payments/vnpay/create    ──────────────────────────────►   │
│      │  Body: { invoiceId, paymentType,                                     │
│      │          paymentMethod }                                              │
│      │                                      [2] PaymentServiceImpl            │
│      │                                      .createPaymentUrl()               │
│      │                                      │                                 │
│      │                                      ├─ Fetch Invoice                 │
│      │                                      ├─ Calc amount (30% or remaining) │
│      │                                      ├─ Create Payment (PENDING)       │
│      │                                      ├─ Build VNPay params (HMAC-512) │
│      │                                      └─ Return paymentUrl             │
│      │  ◄────────────────────────────────  Response: { paymentUrl }          │
│      │                                                                       │
│  [3] window.location.href = paymentUrl                                       │
│      ▼                                                                       │
│  ┌──────────────────────────────────────┐                                    │
│  │        VNPAY SANDBOX                 │                                    │
│  │  https://sandbox.vnpayment.vn/       │                                    │
│  │       paymentv2/vpcpay.html          │                                    │
│  │                                      │                                    │
│  │  User nhập thẻ test NCB:            │                                    │
│  │    9704198526191432198               │                                    │
│  │    NGUYEN VAN A                      │                                    │
│  │    07/15    OTP: 123456             │                                    │
│  │                                      │                                    │
│  │  Bấm "Xác nhận thanh toán"           │                                    │
│  └──────────────────┬───────────────────┘                                    │
│                     │                                                        │
│  [4] VNPay redirect về returnUrl (đã được backend build)                     │
│      ▼                                                                       │
│      GET /api/payments/vnpay/return      ──────────────────────────────►     │
│      ?vnp_Amount=96000000                                                     │
│      &vnp_BankCode=NCB                                                        │
│      &vnp_BankTranNo=20260613xxx                                              │
│      &vnp_CardType=ATM                                                        │
│      &vnp_OrderInfo=Thanh+toan+hoa+don+18+giao+dich+5+loai+DEPOSIT            │
│      &vnp_PayDate=20260613140000                                              │
│      &vnp_ResponseCode=00                   [5] PaymentServiceImpl            │
│      &vnp_TmnCode=12YK9LVK                 .processVNPayCallback()            │
│      &vnp_TransactionNo=14455602           │                                  │
│      &vnp_TransactionStatus=00             ├─ Verify HMAC-SHA512 hash         │
│      &vnp_TxnRef=5                         ├─ Fetch Payment by txnRef         │
│      &vnp_SecureHash=abc123...             ├─ Check idempotency               │
│                                             ├─ Verify amount                  │
│                                             ├─ ResponseCode=00 → PAID         │
│                                             │  ├─ Payment.status = PAID       │
│                                             │  ├─ Invoice.depositStatus=PAID  │
│                                             │  ├─ Invoice.status=DEPOSIT_PAID │
│                                             │  └─ Booking.status=CONFIRMED    │
│                                             └─ Build redirect URL to frontend │
│                                                                              │
│  [6] HTTP 302 Redirect                                                       │
│      ▼                                                                       │
│  FRONTEND                                                                    │
│  http://localhost:5173/payment-result                                        │
│  ?vnp_Amount=96000000                                                        │
│  &vnp_BankCode=NCB                                                           │
│  &vnp_ResponseCode=00                                                        │
│  &vnp_TxnRef=5                                                               │
│  &vnp_TransactionNo=14455602                                                 │
│  &paymentId=5                                                                │
│  &invoiceId=18                                                               │
│  &paymentType=DEPOSIT                                                        │
│  &vnp_SecureHash=abc123...                                                   │
│      │                                                                       │
│  [7] PaymentResult.jsx useEfect                                              │
│      │  GET /api/payments/vnpay/verify?...  ─────────────────────────────►   │
│      │                                      [8] PaymentController             │
│      │                                      .paymentVerify()                  │
│      │                                      └─ processVNPayCallback()         │
│      │                                      (same logic, idempotent)          │
│      │  ◄────────────────────────────────  Response: InvoiceDTO { ... }      │
│      │                                                                       │
│      ├─ Success → Hiển thị "Thanh toán thành công" + Invoice detail          │
│      └─ Failure → Hiển thị lỗi + nút thử lại                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Danh sách URL chi tiết (ví dụ thực tế)

| # | Phương thức | URL | Mô tả |
|---|------------|-----|-------|
| 1 | `POST` | `http://localhost:8080/api/payments/vnpay/create` | Frontend gọi tạo payment URL |
| | Body | `{ "invoiceId": 18, "paymentType": "DEPOSIT", "paymentMethod": "VNPAY" }` | |
| | Response | `{ "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...", "orderId": "5" }` | |
| 2 | `GET` | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Version=2.1.0&vnp_Command=pay&vnp_TmnCode=12YK9LVK&vnp_Amount=96000000&vnp_CurrCode=VND&vnp_TxnRef=5&vnp_OrderInfo=Thanh+toan+hoa+don+18+...&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A5173%2Fpayment-result%3FpaymentId%3D5%26invoiceId%3D18%26paymentType%3DDEPOSIT&vnp_IpAddr=127.0.0.1&vnp_CreateDate=20260613140000&vnp_ExpireDate=20260613141500&vnp_SecureHash=abc123...` | Browser redirect sang VNPay sandbox |
| 3 | User nhập thẻ | NCB: `9704198526191432198` / `NGUYEN VAN A` / `07/15` / OTP: `123456` | Thanh toán trên giao diện VNPay |
| 4 | `GET` | `http://localhost:8080/api/payments/vnpay/return?vnp_Amount=96000000&vnp_BankCode=NCB&vnp_ResponseCode=00&vnp_TxnRef=5&vnp_TransactionNo=14455602&vnp_TransactionStatus=00&vnp_SecureHash=def456...` | VNPay redirect browser về backend return endpoint |
| 5 | `302` | `Location: http://localhost:5173/payment-result?vnp_ResponseCode=00&vnp_TxnRef=5&paymentId=5&invoiceId=18&paymentType=DEPOSIT&...` | Backend redirect browser về frontend result page |
| 6 | `GET` | `http://localhost:5173/payment-result?vnp_ResponseCode=00&vnp_TxnRef=5&paymentId=5&invoiceId=18&paymentType=DEPOSIT&vnp_SecureHash=def456...` | Frontend PaymentResult page |
| 7 | `GET` | `http://localhost:8080/api/payments/vnpay/verify?vnp_ResponseCode=00&vnp_TxnRef=5&paymentId=5&invoiceId=18&paymentType=DEPOSIT&vnp_SecureHash=def456...` | Frontend gọi verify (xác nhận lại kết quả) |
| | Response | `{ "invoiceId": 18, "bookingId": 12, "status": "DEPOSIT_PAID", "totalAmount": 320000000, "paidAmount": 96000000, "remainingAmount": 224000000, "items": [...], ... }` | InvoiceDTO với trạng thái đã thanh toán cọc |

#### Cấu trúc VNPay Return URL (do backend build)

```
returnUrl = config "http://localhost:5173/payment-result"
          + "?paymentId=" + payment.id
          + "&invoiceId=" + invoice.invoiceId
          + "&paymentType=" + payment.paymentType

Sau đó backend append returnUrl vào params gửi VNPay:
  vnp_ReturnUrl = URLEncode(returnUrl)

Khi VNPay redirect về backend /payments/vnpay/return:
  Backend nhận tất cả params từ VNPay (vnp_Amount, vnp_TxnRef, vnp_ResponseCode, ...)
  Backend xử lý callback → cập nhật DB
  Backend redirect browser sang returnUrl gốc + tất cả VNPay params
```

### 2.5 Chi tiết VNPay Callback (Backend)

**Flow:** User thanh toán trên VNPay sandbox → VNPay redirect browser về:

```
GET /api/payments/vnpay/return?vnp_Amount=...&vnp_TxnRef=...&vnp_ResponseCode=00&...
```

**Backend:** `PaymentController.paymentReturn` → `PaymentServiceImpl.processVNPayCallback`

```
processVNPayCallback
  ├─ verifyVNPaySignature (HMAC-SHA512)
  ├─ Fetch Payment by vnp_TxnRef
  ├─ Check idempotency (Payment.status != PENDING → skip)
  ├─ Verify amount (vnp_Amount == payment.amount * 100)
  ├─ Check vnp_ResponseCode == "00"
  │   ├─ Success:
  │   │   ├─ Payment.status = "PAID"
  │   │   ├─ Payment.paidAt = now
  │   │   ├─ Payment.vnpayTransactionNo = vnp_TransactionNo
  │   │   ├─ If DEPOSIT:
  │   │   │   ├─ Invoice.depositStatus = "PAID"
  │   │   │   ├─ Invoice.status = "DEPOSIT_PAID"
  │   │   │   └─ Booking.status = "CONFIRMED"
  │   │   └─ If FINAL:
  │   │       ├─ Invoice.status = "PAID"
  │   │       ├─ Booking.status = "COMPLETED"
  │   │       └─ Mark rooms as dirty after checkout
  │   │   └─ recalculateInvoiceBalances()
  │   └─ Failure:
  │       ├─ Payment.status = "FAILED"
  │       └─ Payment.vnpayResponseCode = responseCode
  └─ Backend redirect browser → frontend /payment-result?...
```

**Redirect to Frontend:**
```
HTTP 302 → http://localhost:5173/payment-result?vnp_ResponseCode=00&vnp_TxnRef=...&...
```

### 2.6 Frontend Payment Result

**Page:** `frontend/src/pages/PaymentResult.jsx`

```
PaymentResult
  ├─ useEffect: đọc URLSearchParams
  ├─ paymentApi.verifyVNPayCallback(params) → GET /api/payments/vnpay/verify?...
  │   └─ Backend: PaymentController.paymentVerify
  │       └─ PaymentServiceImpl.processVNPayCallback → return InvoiceDTO
  ├─ isSuccess: invoice.status in ["PAID", "DEPOSIT_PAID"]
  ├─ Success view: hiển thị invoice detail + in hóa đơn
  └─ Failure view: hiển thị lỗi + nút thử lại
```

### 2.7 VNPay IPN (Server-to-Server)

**API:** `GET|POST /api/payments/vnpay/ipn`
- VNPay server gọi trực tiếp (không qua browser)
- Backend: `PaymentController.paymentIpn` → `PaymentServiceImpl.processVNPayIpn`
- Logic tương tự callback nhưng trả JSON `{ RspCode, Message }` thay vì redirect

## 3. Các entity liên quan

```
Booking (table: booking)
  ├─ booking_id (PK)
  ├─ customer_id → User (FK)
  ├─ package_id → RetreatPackage (FK, nullable)
  ├─ status: DRAFT / PENDING_PAYMENT / CONFIRMED / COMPLETED / CANCELLED
  ├─ check_in_date, check_out_date
  └─ total_amount

Invoice (table: invoice)
  ├─ invoice_id (PK)
  ├─ booking_id → Booking (FK)
  ├─ total_amount
  ├─ paid_amount
  ├─ remaining_amount (computed: total - paid)
  ├─ status: PENDING / DEPOSIT_PAID / PAID / CANCELLED
  ├─ deposit_status: UNPAID / PAID
  └─ items: List<InvoiceItem>

InvoiceItem (table: invoice_item)
  ├─ id (PK)
  ├─ invoice_id → Invoice (FK)
  ├─ item_type: ROOM / SPA / FOOD_BEVERAGE / VAT / SERVICE_FEE
  ├─ description, quantity, unit_price, total_price

Payment (table: payment)
  ├─ id (PK)
  ├─ invoice_id → Invoice (FK)
  ├─ payment_type: DEPOSIT / FINAL / EXTRA_SERVICE / REFUND
  ├─ payment_method: VNPAY / CASH / BANK_TRANSFER
  ├─ amount
  ├─ status: PENDING / PAID / FAILED / CANCELLED
  ├─ transaction_ref
  ├─ vnpay_transaction_no
  ├─ vnpay_response_code
  ├─ created_at, paid_at

Feedback (table: feedback)
  ├─ feedback_id (PK)
  ├─ booking_id → Booking (FK)
  ├─ user_id → User (FK)
  ├─ rating (1-5)
  ├─ comment
  └─ created_at
```

## 4. Auth & Token Flow

### 4.1 JWT Token Lifecycle

```
Login (POST /auth/login)
  └─ UserServiceImpl.login()
      ├─ Validates email + password
      ├─ jwtUtils.generateToken(email, role) → JWT string
      └─ Returns LoginResponse { token, email, role, fullName }

Frontend stores:
  localStorage/sessionStorage.setItem("token", ...)
  localStorage/sessionStorage.setItem("userEmail", ...)
  localStorage/sessionStorage.setItem("userRole", ...)
  localStorage/sessionStorage.setItem("userFullName", ...)
```

### 4.2 AxiosClient Interceptor

```
File: frontend/src/api/axiosClient.js

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4.3 API.js (fetch-based)

```
File: frontend/src/api.js

export function getAuthHeaders() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
```

Pages dùng `api.js` (fetch): Payment.jsx, PaymentResult.jsx
Pages dùng `axiosClient`: GuestDashboard.jsx, ChefDashboard.jsx, BookingPage.jsx

## 5. Feedback & Revenue APIs

### 5.1 Feedback (UC23)
- `POST /feedback/submit` → `{ bookingId, userId, rating, comment }`
- `GET /feedback/booking/{bookingId}` → FeedbackDTO

### 5.2 Revenue Dashboard (UC24, UC25)
- `GET /revenue/dashboard?year=YYYY&month=MM` → RevenueDashboardDTO
- `GET /revenue/occupancy-report?year=YYYY` → OccupancyReport

## 6. Các file chính trong Module 5

### Backend
```
Backend/src/main/java/fu/se/smms/
├── config/
│   ├── SecurityConfig.java        # Phân quyền endpoint
│   ├── VNPayProperties.java       # Cấu hình VNPay từ application.properties
│   ├── JwtFilter.java             # Filter giải mã JWT
│   └── JwtUtils.java              # Tạo/validate JWT
├── controller/
│   ├── BookingController.java     # POST /bookings
│   ├── PaymentController.java     # /payments/vnpay/*
│   ├── InvoiceController.java     # /invoices/*
│   ├── FeedbackController.java    # /feedback/*
│   └── RevenueController.java     # /revenue/*
├── service/impl/
│   ├── BookingServiceImpl.java    # Logic tạo booking + invoice
│   ├── PaymentServiceImpl.java    # Logic VNPay + callback xử lý
│   ├── InvoiceServiceImpl.java    # CRUD invoice
│   ├── FeedbackServiceImpl.java   # Submit & query feedback
│   └── RevenueServiceImpl.java    # Dashboard tính toán
├── entity/
│   ├── Booking.java
│   ├── Invoice.java
│   ├── InvoiceItem.java
│   ├── Payment.java
│   └── Feedback.java
└── repository/
    ├── BookingRepository.java
    ├── InvoiceRepository.java
    ├── InvoiceItemRepository.java
    ├── PaymentRepository.java
    └── FeedbackRepository.java
```

### Frontend
```
frontend/src/
├── pages/
│   ├── BookingPage.jsx            # 6-step booking wizard
│   ├── Payment.jsx                # Invoice + VNPay/Cash payment
│   └── PaymentResult.jsx          # Kết quả sau VNPay callback
├── api/
│   ├── axiosClient.js             # Axios + JWT interceptor
│   └── api.js                     # Fetch-based API helpers
```

## 7. Cấu hình VNPay Sandbox

```
File: Backend/src/main/resources/application.properties

payment.vnpay.pay-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
payment.vnpay.return-url=http://localhost:5173/payment-result
payment.vnpay.tmn-code=12YK9LVK
payment.vnpay.hash-secret=3ZAHQSNZONCKAGFBCH7B1UX1LAVIWXH9
payment.vnpay.version=2.1.0
payment.vnpay.command=pay
payment.vnpay.curr-code=VND
payment.vnpay.locale=vn
payment.vnpay.order-type=billpayment
payment.vnpay.expire-minutes=15

# Frontend payment result URL (dùng cho redirect từ backend)
app.frontend.payment-result-url=http://localhost:5173/payment-result
```

**Thẻ test NCB Sandbox:**
- Ngân hàng: NCB
- Số thẻ: 9704198526191432198
- Tên: NGUYEN VAN A
- Ngày PH: 07/15
- OTP: 123456