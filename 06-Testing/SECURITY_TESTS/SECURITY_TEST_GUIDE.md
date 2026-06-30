# 🔒 SECURITY TESTS – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `06-Testing/SECURITY_TESTS/`  
> **Mục đích:** Kiểm thử bảo mật toàn diện bao gồm Authentication, Authorization (RBAC), mã hóa dữ liệu nhạy cảm, và bảo vệ API endpoint.  
> **Công cụ:** OWASP ZAP, Postman Security Tests, Spring Security Test, Custom JWT Test Suite

---

## Ma trận rủi ro bảo mật

| Rủi ro | Mức độ | Kiểm thử | Trạng thái |
|--------|--------|----------|------------|
| SQL Injection | 🔴 Critical | Automated + Manual | ✅ Tested |
| JWT Token Tampering | 🔴 Critical | Automated | ✅ Tested |
| RBAC Bypass | 🔴 Critical | Automated | ✅ Tested |
| Sensitive Data Exposure | 🔴 Critical | Manual | 🟡 In Progress |
| AES Encryption Verification | 🔴 Critical | Automated | ✅ Tested |
| CORS Misconfiguration | 🟠 High | Automated | ✅ Tested |
| XSS (Frontend) | 🟠 High | OWASP ZAP | 🟡 In Progress |
| Brute Force Password | 🟠 High | Manual | ✅ Tested |
| Insecure Direct Object Reference | 🟠 High | Automated | ✅ Tested |
| VNPay Callback Tampering | 🟠 High | Automated | ✅ Tested |

---

## 1. Authentication Security Tests

### 1.1 JWT Token Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class JwtSecurityTest {

    @Test
    @DisplayName("SEC-01: Request không có token bị từ chối")
    void testUnauthenticatedRequest_Returns401() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/users/me", String.class
        );
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @DisplayName("SEC-02: Token giả mạo (tampered) bị từ chối")
    void testTamperedToken_Returns401() {
        String validToken = loginAndGetToken("guest@test.com", "Pass123!");
        // Tamper với token: thay đổi 1 ký tự ở payload
        String tamperedToken = validToken.substring(0, validToken.lastIndexOf('.') + 5) + "XXXXX";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tamperedToken);
        
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/users/me", HttpMethod.GET,
            new HttpEntity<>(headers), String.class
        );
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @DisplayName("SEC-03: Token hết hạn bị từ chối")
    void testExpiredToken_Returns401() throws InterruptedException {
        // Tạo token với TTL 1 giây
        String shortLivedToken = jwtService.generateToken("guest@test.com", Duration.ofSeconds(1));
        Thread.sleep(2000); // Chờ hết hạn
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(shortLivedToken);
        
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/users/me", HttpMethod.GET,
            new HttpEntity<>(headers), String.class
        );
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @DisplayName("SEC-04: Refresh token đã dùng không thể dùng lại (Replay Attack)")
    void testRefreshTokenReuse_Returns401() {
        TokenDTO tokens = loginAndGetTokens("guest@test.com", "Pass123!");
        String refreshToken = tokens.getRefreshToken();
        
        // Dùng refresh token lần 1 - thành công
        ResponseEntity<TokenDTO> firstRefresh = restTemplate.postForEntity(
            "/api/auth/refresh", new RefreshDTO(refreshToken), TokenDTO.class
        );
        assertEquals(HttpStatus.OK, firstRefresh.getStatusCode());
        
        // Dùng refresh token lần 2 - phải thất bại (đã bị revoke)
        ResponseEntity<String> secondRefresh = restTemplate.postForEntity(
            "/api/auth/refresh", new RefreshDTO(refreshToken), String.class
        );
        assertEquals(HttpStatus.UNAUTHORIZED, secondRefresh.getStatusCode());
    }
}
```

### 1.2 Brute Force Protection Tests

```java
@Test
@DisplayName("SEC-05: Account bị khóa sau 5 lần đăng nhập sai")
void testBruteForce_AccountLockedAfterFailures() {
    for (int i = 0; i < 5; i++) {
        restTemplate.postForEntity(
            "/api/auth/login",
            new LoginDTO("target@test.com", "WrongPassword" + i),
            String.class
        );
    }
    
    // Lần thứ 6 với đúng password cũng bị từ chối
    ResponseEntity<String> response = restTemplate.postForEntity(
        "/api/auth/login",
        new LoginDTO("target@test.com", "CorrectPassword"),
        String.class
    );
    assertEquals(HttpStatus.LOCKED, response.getStatusCode()); // 423 Locked
}
```

---

## 2. RBAC (Role-Based Access Control) Tests

### Ma trận Phân quyền

| API Endpoint | MANAGER | RECEPTIONIST | THERAPIST | CHEF | CUSTOMER |
|-------------|---------|--------------|-----------|------|----------|
| `GET /api/medical-profiles/{id}` | ✅ | ❌ | ✅ (limited) | ❌ | ✅ (own) |
| `GET /api/food-orders` (with allergy) | ✅ | ❌ | ❌ | ✅ | ❌ |
| `GET /api/revenue/report` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/check-in` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /api/spa-bookings/my-schedule` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `POST /api/invoices/{id}/payment-url` | ✅ | ✅ | ❌ | ❌ | ✅ (own) |

### RBAC Test Cases

```java
@Test
@DisplayName("SEC-06: Receptionist không thể xem Medical Profile")
void testRBAC_ReceptionistCannotViewMedicalProfile() {
    String token = loginAndGetToken("receptionist@resort.com", "ReceptPass!");
    
    ResponseEntity<String> response = callWithToken(
        "GET", "/api/medical-profiles/1", token
    );
    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
}

@Test
@DisplayName("SEC-07: Chef chỉ thấy thông tin dị ứng, không thấy medical condition")
void testRBAC_ChefOnlySeesAllergyInfo() {
    String chefToken = loginAndGetToken("chef@resort.com", "ChefPass!");
    
    ResponseEntity<FoodOrderDetailDTO> response = restTemplate.exchange(
        "/api/food-orders/1/with-allergy", HttpMethod.GET,
        new HttpEntity<>(bearerHeader(chefToken)), FoodOrderDetailDTO.class
    );
    
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody().getAllergyInfo()); // Có thông tin dị ứng
    assertNull(response.getBody().getPhysicalCondition()); // Không có medical condition
}

@Test
@DisplayName("SEC-08: Guest chỉ xem được booking của chính mình (IDOR prevention)")
void testRBAC_GuestCannotViewOtherGuestBooking() {
    // Guest A login
    String guestAToken = loginAndGetToken("guestA@test.com", "PassA123!");
    
    // Guest A cố xem booking của Guest B (bookingId=999 thuộc Guest B)
    ResponseEntity<String> response = restTemplate.exchange(
        "/api/bookings/999", HttpMethod.GET,
        new HttpEntity<>(bearerHeader(guestAToken)), String.class
    );
    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
}

@Test
@DisplayName("SEC-09: Therapist chỉ thấy lịch của mình, không thấy của therapist khác")
void testRBAC_TherapistIsolation() {
    String therapist1Token = loginAndGetToken("therapist1@resort.com", "Therapist1!");
    
    // Cố lấy schedule của therapist ID=2 (khác mình)
    ResponseEntity<String> response = restTemplate.exchange(
        "/api/spa-bookings/therapist/2/schedule", HttpMethod.GET,
        new HttpEntity<>(bearerHeader(therapist1Token)), String.class
    );
    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
}
```

---

## 3. Data Encryption Tests

```java
@Test
@DisplayName("SEC-10: Dữ liệu sức khỏe được mã hóa AES-256 trong DB (không lưu plaintext)")
void testHealthDataEncryption() {
    // Arrange: Guest khai báo thông tin sức khỏe
    String plainTextCondition = "Đau lưng mãn tính L4-L5";
    HealthProfileDTO dto = new HealthProfileDTO();
    dto.setPhysicalCondition(plainTextCondition);
    dto.setExplicitConsentSigned(true);
    
    String guestToken = loginAndGetToken("guest@test.com", "Pass123!");
    restTemplate.exchange(
        "/api/medical-profiles", HttpMethod.POST,
        new HttpEntity<>(dto, bearerHeader(guestToken)),
        Void.class
    );
    
    // Kiểm tra trực tiếp trong DB – phải là ciphertext, không phải plaintext
    MedicalProfile savedProfile = medicalProfileRepository.findByUserId(1);
    
    assertNotNull(savedProfile.getPhysicalConditionEncrypted());
    assertNotEquals(plainTextCondition, savedProfile.getPhysicalConditionEncrypted());
    assertTrue(savedProfile.getPhysicalConditionEncrypted().length() > plainTextCondition.length() * 2);
    
    // Verify có thể decrypt đúng
    String decrypted = aesEncryptionUtil.decrypt(savedProfile.getPhysicalConditionEncrypted());
    assertEquals(plainTextCondition, decrypted);
}

@Test
@DisplayName("SEC-11: Passport number được mã hóa khi check-in")
void testPassportEncryption() {
    String rawPassport = "A12345678";
    CheckInRequestDTO dto = new CheckInRequestDTO();
    dto.setBookingId(1);
    dto.setGuestPassportNumber(rawPassport);
    
    String receptionistToken = loginAndGetToken("receptionist@resort.com", "Recept!");
    restTemplate.exchange(
        "/api/check-in", HttpMethod.POST,
        new HttpEntity<>(dto, bearerHeader(receptionistToken)), Void.class
    );
    
    RoomGuestDeclaration declaration = declarationRepository.findByBookingDetailId(1);
    assertNotEquals(rawPassport, declaration.getGuestIdPassportEncrypted());
}
```

---

## 4. Payment Security Tests (VNPay)

```java
@Test
@DisplayName("SEC-12: VNPay callback với checksum sai bị từ chối")
void testVNPayCallback_InvalidChecksum_Rejected() {
    Map<String, String> params = new HashMap<>();
    params.put("vnp_ResponseCode", "00");
    params.put("vnp_TxnRef", "INV-001");
    params.put("vnp_Amount", "1000000");
    params.put("vnp_SecureHash", "INVALID_CHECKSUM_XYZ"); // Giả mạo
    
    ResponseEntity<String> response = restTemplate.postForEntity(
        "/api/payments/vnpay-return?" + buildQueryString(params),
        null, String.class
    );
    
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    // Invoice phải vẫn ở trạng thái UNPAID
    Invoice invoice = invoiceRepository.findByVnpayTxnRef("INV-001");
    assertEquals(InvoiceStatus.UNPAID, invoice.getStatus());
}

@Test
@DisplayName("SEC-13: Không thể tạo payment URL cho booking của người khác")
void testPaymentURL_CannotPayForOtherUserBooking() {
    // Guest B cố tạo payment URL cho booking của Guest A
    String guestBToken = loginAndGetToken("guestB@test.com", "PassB!");
    
    ResponseEntity<String> response = restTemplate.exchange(
        "/api/invoices/1/payment-url", HttpMethod.POST,
        new HttpEntity<>(bearerHeader(guestBToken)), String.class
    );
    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
}
```

---

## 5. SQL Injection & Input Validation Tests

```java
@Test
@DisplayName("SEC-14: SQL Injection trong search không có tác dụng")
void testSQLInjection_InSearch_NoEffect() {
    // Tấn công SQL injection qua query param
    String maliciousInput = "'; DROP TABLE [User]; --";
    
    ResponseEntity<String> response = restTemplate.getForEntity(
        "/api/villas?search=" + URLEncoder.encode(maliciousInput, StandardCharsets.UTF_8),
        String.class
    );
    
    // Server phải trả về kết quả bình thường (không crash)
    assertNotEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    
    // Bảng User phải vẫn còn tồn tại
    assertTrue(userRepository.count() > 0);
}

@Test
@DisplayName("SEC-15: XSS trong comment/feedback bị sanitize")
void testXSS_InFeedback_Sanitized() {
    String xssPayload = "<script>alert('XSS')</script>Great resort!";
    
    FeedbackDTO dto = new FeedbackDTO();
    dto.setComment(xssPayload);
    dto.setRating(5);
    dto.setBookingId(1);
    
    restTemplate.exchange(
        "/api/feedbacks", HttpMethod.POST,
        new HttpEntity<>(dto, bearerHeader(guestToken)), FeedbackDTO.class
    );
    
    Feedback saved = feedbackRepository.findById(1).get();
    assertFalse(saved.getComment().contains("<script>"));
    assertTrue(saved.getComment().contains("Great resort!"));
}
```

---

## 6. CORS Configuration Tests

```java
@Test
@DisplayName("SEC-16: CORS chỉ chấp nhận origin từ frontend whitelist")
void testCORS_UnauthorizedOrigin_Blocked() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Origin", "https://malicious-site.com");
    
    ResponseEntity<String> response = restTemplate.exchange(
        "/api/villas", HttpMethod.OPTIONS,
        new HttpEntity<>(headers), String.class
    );
    
    // Phải không có Access-Control-Allow-Origin header
    assertNull(response.getHeaders().get("Access-Control-Allow-Origin"));
}
```

---

## Công cụ & Lệnh chạy Security Tests

### OWASP ZAP (Active Scan)
```bash
# Chạy ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
    -t http://localhost:8080 \
    -r security_report.html
```

### Spring Security Test
```bash
cd 05-Development/backend
./mvnw test -Dtest="*SecurityTest" -Dspring.profiles.active=test
```

### Postman Security Collection
```bash
# Chạy collection kiểm tra RBAC
newman run security_tests.postman_collection.json \
    --environment test.postman_environment.json \
    --reporters cli,html --reporter-html-export security_results.html
```

---

## Checklist Security Review trước Release

- [ ] Tất cả endpoint nhạy cảm có `@PreAuthorize` annotation.
- [ ] Không có giá trị secret trong source code (dùng `.env`).
- [ ] Dữ liệu nhạy cảm (health, passport) được AES-256 encrypted.
- [ ] JWT có TTL hợp lý (access: 15 phút, refresh: 7 ngày).
- [ ] CORS chỉ whitelist các origin cần thiết.
- [ ] VNPay callback validate HMAC-SHA512 checksum.
- [ ] Input validation và sanitization cho tất cả user input.
- [ ] Rate limiting cho `/api/auth/login` và `/api/auth/register`.
- [ ] SQL injection không possible (dùng JPA với parameterized queries).
- [ ] HTTPS enforced trên production.

---

*Tham chiếu: OWASP Top 10 2021, Nghị định 13/2023/NĐ-CP, Spring Security Documentation*
