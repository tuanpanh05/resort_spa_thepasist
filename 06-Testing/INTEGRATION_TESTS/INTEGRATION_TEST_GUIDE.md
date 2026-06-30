# 🔗 INTEGRATION TESTS – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `06-Testing/INTEGRATION_TESTS/`  
> **Mục đích:** Kiểm thử tích hợp giữa các lớp (Controller → Service → Repository → DB) và tích hợp với các dịch vụ bên ngoài (VNPay, Google Calendar, Email).  
> **Framework:** Spring Boot Test (`@SpringBootTest`) + Testcontainers (H2 in-memory DB) + RestAssured

---

## Chiến lược Integration Test

```
┌─────────────────────────────────────────────┐
│              Integration Test Scope          │
│                                             │
│  Controller → Service → Repository → H2 DB │
│                    ↓                        │
│         External: VNPay Sandbox             │
│         External: Google Calendar Test Acc  │
│         External: SMTP MailHog (local)      │
└─────────────────────────────────────────────┘
```

**Môi trường test:**
- Database: H2 in-memory (Spring fallback) hoặc SQL Server test instance
- VNPay: Sandbox mode (`VNPAY_ENV=sandbox` trong `.env.test`)
- Email: MailHog local SMTP (port 1025)
- Google Calendar: Test account credential

---

## Test Suites theo Module

### Module 1 – Auth & Health Profile Integration

#### `AuthIntegrationTest.java`

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @DisplayName("Full flow: Register → Verify OTP → Login → Get Profile")
    void testFullAuthFlow() {
        // Step 1: Register
        RegisterDTO registerDTO = new RegisterDTO(
            "integration.test@gmail.com",
            "SecurePass123!",
            "Integration Test User"
        );
        ResponseEntity<UserDTO> registerResponse = restTemplate.postForEntity(
            "/api/auth/register", registerDTO, UserDTO.class
        );
        assertEquals(HttpStatus.CREATED, registerResponse.getStatusCode());
        
        // Step 2: Login
        LoginDTO loginDTO = new LoginDTO("integration.test@gmail.com", "SecurePass123!");
        ResponseEntity<TokenDTO> loginResponse = restTemplate.postForEntity(
            "/api/auth/login", loginDTO, TokenDTO.class
        );
        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        assertNotNull(loginResponse.getBody().getAccessToken());
        
        String token = loginResponse.getBody().getAccessToken();
        
        // Step 3: Get profile with token
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<UserDTO> profileResponse = restTemplate.exchange(
            "/api/users/me", HttpMethod.GET,
            new HttpEntity<>(headers), UserDTO.class
        );
        assertEquals(HttpStatus.OK, profileResponse.getStatusCode());
        assertEquals("integration.test@gmail.com", profileResponse.getBody().getEmail());
    }

    @Test
    @DisplayName("RBAC: Chef không được xem medical profile của Guest")
    void testRBAC_ChefCannotViewMedicalProfile() {
        String chefToken = loginAndGetToken("chef@resort.com", "ChefPass123!");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(chefToken);
        
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/medical-profiles/1", HttpMethod.GET,
            new HttpEntity<>(headers), String.class
        );
        
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }
}
```

---

### Module 2 – Booking Integration

#### `BookingIntegrationTest.java`

```java
@Test
@DisplayName("Full flow: Browse Rooms → Select Package → Pay Deposit → Confirm Booking")
void testFullBookingFlow() {
    // Step 1: Get available rooms
    ResponseEntity<List<RoomDTO>> roomsResponse = restTemplate.exchange(
        "/api/villas?checkIn=2026-07-01&checkOut=2026-07-04",
        HttpMethod.GET, null,
        new ParameterizedTypeReference<List<RoomDTO>>(){}
    );
    assertEquals(HttpStatus.OK, roomsResponse.getStatusCode());
    assertFalse(roomsResponse.getBody().isEmpty());
    
    // Step 2: Create booking
    BookingRequestDTO bookingDTO = new BookingRequestDTO();
    bookingDTO.setRoomId(roomsResponse.getBody().get(0).getRoomId());
    bookingDTO.setCheckInDate(LocalDate.of(2026, 7, 1));
    bookingDTO.setCheckOutDate(LocalDate.of(2026, 7, 4));
    
    ResponseEntity<BookingDTO> bookingResponse = restTemplate.postForEntity(
        "/api/bookings", bookingDTO, BookingDTO.class
    );
    assertEquals(HttpStatus.CREATED, bookingResponse.getStatusCode());
    
    String bookingId = bookingResponse.getBody().getBookingId().toString();
    
    // Step 3: Get VNPay payment URL
    ResponseEntity<PaymentUrlDTO> paymentResponse = restTemplate.postForEntity(
        "/api/invoices/" + bookingId + "/payment-url",
        null, PaymentUrlDTO.class
    );
    assertEquals(HttpStatus.OK, paymentResponse.getStatusCode());
    assertTrue(paymentResponse.getBody().getPaymentUrl().contains("vnpayment.vn"));
}

@Test
@DisplayName("Check-In: Lưu khai báo tạm trú với passport mã hóa")
void testCheckIn_EncryptedGuestDeclaration() {
    // Arrange
    String receptionistToken = loginAndGetToken("receptionist@resort.com", "ReceptPass123!");
    
    CheckInRequestDTO checkInDTO = new CheckInRequestDTO();
    checkInDTO.setBookingId(1);
    checkInDTO.setGuestPassportNumber("A12345678"); // Sẽ được mã hóa AES-256
    
    // Act
    ResponseEntity<CheckInResultDTO> response = restTemplate.exchange(
        "/api/check-in", HttpMethod.POST,
        new HttpEntity<>(checkInDTO, bearerHeader(receptionistToken)),
        CheckInResultDTO.class
    );
    
    // Assert
    assertEquals(HttpStatus.OK, response.getStatusCode());
    
    // Verify passport is encrypted in DB (không thể đọc raw text)
    RoomGuestDeclaration declaration = declarationRepository.findByBookingDetailId(1);
    assertNotEquals("A12345678", declaration.getGuestIdPassportEncrypted());
    assertTrue(declaration.getGuestIdPassportEncrypted().length() > 20); // Phải là ciphertext
}
```

---

### Module 3 – Spa Scheduling Integration

#### `SpaBookingIntegrationTest.java`

```java
@Test
@DisplayName("Concurrent booking: 2 requests đồng thời cho cùng therapist → chỉ 1 thành công")
void testConcurrentBooking_OnlyOneSucceeds() throws InterruptedException {
    ExecutorService executor = Executors.newFixedThreadPool(2);
    CountDownLatch latch = new CountDownLatch(2);
    AtomicInteger successCount = new AtomicInteger(0);
    AtomicInteger conflictCount = new AtomicInteger(0);
    
    SpaBookingDTO dto = createSpaBookingDTO(/* therapistId=5, 09:00-10:00 */);
    
    for (int i = 0; i < 2; i++) {
        executor.submit(() -> {
            try {
                restTemplate.postForEntity("/api/spa-bookings", dto, SpaBookingDTO.class);
                successCount.incrementAndGet();
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                }
            } finally {
                latch.countDown();
            }
        });
    }
    
    latch.await(10, TimeUnit.SECONDS);
    assertEquals(1, successCount.get());
    assertEquals(1, conflictCount.get());
}

@Test
@DisplayName("Google Calendar sync: Tạo spa booking → Event xuất hiện trên Calendar")
void testGoogleCalendarSync() {
    // Uses Google Calendar Test Account
    SpaBookingDTO dto = createSpaBookingDTO();
    ResponseEntity<SpaBookingDTO> response = restTemplate.postForEntity(
        "/api/spa-bookings", dto, SpaBookingDTO.class
    );
    
    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertNotNull(response.getBody().getGoogleEventId()); // Event được tạo
}
```

---

### Module 4 – F&B Integration

#### `MealOrderIntegrationTest.java`

```java
@Test
@DisplayName("Full F&B flow: Browse Menu (filter allergy) → Order → Chef confirms → Deliver")
void testFullMealFlow() {
    // Guest có dị ứng hải sản
    String guestToken = loginAndGetToken("guest_seafood_allergy@test.com", "Pass123!");
    
    // Step 1: Lấy menu đã lọc dị ứng
    ResponseEntity<List<FoodMenuDTO>> menuResponse = restTemplate.exchange(
        "/api/food-menu?filteredForUser=true", HttpMethod.GET,
        new HttpEntity<>(bearerHeader(guestToken)),
        new ParameterizedTypeReference<List<FoodMenuDTO>>(){}
    );
    
    // Kiểm tra không có món hải sản trong kết quả
    assertTrue(menuResponse.getBody().stream()
        .noneMatch(food -> food.getDietaryTags().contains("SEAFOOD")));
    
    // Step 2: Đặt món
    FoodOrderDTO orderDTO = new FoodOrderDTO();
    orderDTO.setFoodId(1); // Món rau củ an toàn
    orderDTO.setQuantity(1);
    
    ResponseEntity<FoodOrderDTO> orderResponse = restTemplate.postForEntity(
        "/api/food-orders", orderDTO, FoodOrderDTO.class
    );
    assertEquals(HttpStatus.CREATED, orderResponse.getStatusCode());
}
```

---

### Module 5 – Checkout Integration

#### `CheckoutIntegrationTest.java`

```java
@Test
@DisplayName("Full checkout flow: Generate Invoice → Pay VNPay → Confirm → Block if unpaid")
void testFullCheckoutFlow() {
    Integer bookingId = 1;
    
    // Step 1: Tạo hóa đơn tổng hợp
    ResponseEntity<InvoiceDTO> invoiceResponse = restTemplate.postForEntity(
        "/api/invoices/generate/" + bookingId, null, InvoiceDTO.class
    );
    assertEquals(HttpStatus.CREATED, invoiceResponse.getStatusCode());
    
    BigDecimal finalAmount = invoiceResponse.getBody().getFinalAmount();
    assertTrue(finalAmount.compareTo(BigDecimal.ZERO) > 0);
    
    // Step 2: Verify checkout bị block khi chưa thanh toán
    ResponseEntity<String> checkoutAttempt = restTemplate.exchange(
        "/api/bookings/" + bookingId + "/checkout", HttpMethod.POST,
        new HttpEntity<>(bearerHeader(receptionistToken)), String.class
    );
    assertEquals(HttpStatus.CONFLICT, checkoutAttempt.getStatusCode());
    
    // Step 3: Simulate VNPay callback (payment success)
    simulateVNPayCallback(invoiceResponse.getBody().getInvoiceId());
    
    // Step 4: Checkout thành công sau khi đã thanh toán
    ResponseEntity<CheckoutResultDTO> checkoutResponse = restTemplate.exchange(
        "/api/bookings/" + bookingId + "/checkout", HttpMethod.POST,
        new HttpEntity<>(bearerHeader(receptionistToken)), CheckoutResultDTO.class
    );
    assertEquals(HttpStatus.OK, checkoutResponse.getStatusCode());
}
```

---

## Cấu hình môi trường Test

### `src/test/resources/application-test.yml`

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:smms_test;DB_CLOSE_DELAY=-1;MODE=MSSQLServer
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    
  mail:
    host: localhost
    port: 1025  # MailHog

app:
  vnpay:
    env: sandbox
  google-calendar:
    test-mode: true
  encryption:
    key: test-aes-key-256bits-for-testing
```

---

## Chạy Integration Tests

```bash
# Chạy tất cả integration tests
cd 05-Development/backend
./mvnw test -Dtest="*IntegrationTest" -Dspring.profiles.active=test

# Chạy test cụ thể
./mvnw test -Dtest="AuthIntegrationTest#testFullAuthFlow"

# Xem coverage report
./mvnw jacoco:report
# Kết quả: target/site/jacoco/index.html
```

---

## Checklist Integration Test

- [ ] Test database dùng H2 hoặc dedicated test SQL Server instance (không dùng production DB).
- [ ] Mỗi test phải `@Transactional` + `@Rollback` hoặc dùng `@DirtiesContext` để isolate.
- [ ] VNPay test phải dùng sandbox keys (không phải production key).
- [ ] Email test phải route qua MailHog, không gửi email thật.
- [ ] Concurrent test phải kiểm tra DB-level locking hoạt động đúng.

---

*Xem thêm: `06-Testing/TEST_CASES/README.md` và `00-Policy/TESTING_GUIDELINES.md`*
