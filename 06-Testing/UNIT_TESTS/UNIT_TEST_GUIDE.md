# 🧪 UNIT TESTS – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `06-Testing/UNIT_TESTS/`  
> **Mục đích:** Tập hợp tài liệu và báo cáo kiểm thử đơn vị (Unit Test) cho từng module của hệ thống SMMS.  
> **Framework:** JUnit 5 + Mockito (Backend) | Vitest + React Testing Library (Frontend)

---

## Tổng quan Unit Test Coverage

| Module | Backend Coverage | Frontend Coverage | Trạng thái |
|--------|-----------------|-------------------|------------|
| Module 1 – Auth & Health Profile | 72% | 65% | 🟡 In Progress |
| Module 2 – Booking & Check-In | 68% | 58% | 🟡 In Progress |
| Module 3 – Spa Scheduling | 55% | 45% | 🔴 Needs Work |
| Module 4 – F&B Management | 70% | 60% | 🟡 In Progress |
| Module 5 – Checkout & Analytics | 65% | 55% | 🟡 In Progress |

> **Target:** Tất cả service methods quan trọng phải đạt ≥ 70% coverage trước deadline.

---

## Module 1 – Auth & Sensitive Health Profile

### Backend Unit Tests

#### `UserServiceTest.java`

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("UC01: Đăng ký thành công với email hợp lệ")
    void testRegister_Success() {
        // Given
        RegisterDTO dto = new RegisterDTO("test@gmail.com", "Password123!", "Nguyen Van A");
        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(dto.getPassword())).thenReturn("hashedPassword");
        
        User savedUser = User.builder()
            .email(dto.getEmail())
            .passwordHash("hashedPassword")
            .role(UserRole.CUSTOMER)
            .build();
        when(userRepository.save(any())).thenReturn(savedUser);

        // When
        UserDTO result = userService.register(dto);

        // Then
        assertNotNull(result);
        assertEquals("test@gmail.com", result.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("UC01: BR-01 – Đăng ký thất bại khi email đã tồn tại")
    void testRegister_DuplicateEmail_ThrowsException() {
        // Given
        RegisterDTO dto = new RegisterDTO("existing@gmail.com", "Password123!", "User");
        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        // When & Then
        BusinessException exception = assertThrows(
            BusinessException.class,
            () -> userService.register(dto)
        );
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Email already registered", exception.getMessage());
    }

    @Test
    @DisplayName("UC05: BR-20 – Xóa dữ liệu sức khỏe thành công sau checkout")
    void testDeleteSensitiveData_Success() {
        // Given
        Integer userId = 1;
        MedicalProfile profile = new MedicalProfile();
        profile.setPhysicalConditionEncrypted("encrypted_data");
        when(medicalProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        // When
        userService.deleteSensitiveHealthData(userId);

        // Then
        verify(medicalProfileRepository).save(argThat(p -> 
            p.getPhysicalConditionEncrypted() == null &&
            p.getFoodAllergiesEncrypted() == null
        ));
    }
}
```

#### `MedicalProfileServiceTest.java`

```java
@Test
@DisplayName("UC02: Lưu health profile với AES-256 encryption")
void testSaveHealthProfile_Encrypted() {
    // Given
    HealthProfileDTO dto = new HealthProfileDTO();
    dto.setPhysicalCondition("Đau lưng, cột sống L4-L5");
    dto.setFoodAllergies("Hải sản, đậu phộng");
    dto.setExplicitConsentSigned(true); // BẮTT BUỘC theo NĐ 13/2023

    // When
    medicalProfileService.saveHealthProfile(1, dto);

    // Then
    verify(medicalProfileRepository).save(argThat(profile -> 
        profile.getPhysicalConditionEncrypted() != null &&
        !profile.getPhysicalConditionEncrypted().equals("Đau lưng, cột sống L4-L5") && // phải là encrypted
        profile.isExplicitConsentSigned() == true
    ));
}

@Test
@DisplayName("UC03: BR-21 – Chef không thể xem medical profile")
void testGetMedicalProfile_ChefRole_ThrowsForbidden() {
    // Given
    UserDetails chefUser = createUserWithRole(UserRole.CHEF);
    
    // When & Then
    assertThrows(AccessDeniedException.class, () ->
        medicalProfileService.getMedicalProfile(1, chefUser)
    );
}
```

---

## Module 2 – Booking & Check-In

### Backend Unit Tests

#### `RoomBookingServiceTest.java`

```java
@Test
@DisplayName("UC06: Đặt phòng thành công – tính giá đúng với BigDecimal")
void testCreateBooking_CorrectPriceCalculation() {
    // Given: Phòng giá 2,500,000 VND/đêm, đặt 3 đêm
    RoomType roomType = new RoomType();
    roomType.setBasePrice(new BigDecimal("2500000.00"));
    
    BookingRequestDTO dto = new BookingRequestDTO();
    dto.setCheckInDate(LocalDate.of(2026, 7, 1));
    dto.setCheckOutDate(LocalDate.of(2026, 7, 4));
    dto.setRoomId(1);

    // When
    BigDecimal totalPrice = bookingService.calculateTotalPrice(dto, roomType);

    // Then
    assertEquals(new BigDecimal("7500000.00"), totalPrice);
    // Không dùng float/double – BẮTT BUỘC theo AI_RULES.md
}

@Test
@DisplayName("UC07: Check-In – lưu khai báo tạm trú mã hóa")
void testCheckIn_EncryptedPassport() {
    // ...
}
```

---

## Module 3 – Spa Scheduling

### Backend Unit Tests

#### `SpaBookingServiceTest.java`

```java
@Test
@DisplayName("UC11: Chống double-booking – không thể đặt therapist đang bận")
void testCreateSpaBooking_PreventDoubleBooking() {
    // Given: Therapist ID=5 đã có lịch 09:00-10:00 ngày 2026-07-01
    LocalDateTime start = LocalDateTime.of(2026, 7, 1, 9, 30);
    LocalDateTime end = LocalDateTime.of(2026, 7, 1, 10, 30);
    
    when(spaBookingRepository.hasConflict(5, start, end)).thenReturn(true);

    // When & Then
    BusinessException ex = assertThrows(BusinessException.class, () ->
        spaBookingService.createBooking(buildSpaBookingDTO(5, start, end))
    );
    assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    assertTrue(ex.getMessage().contains("therapist"));
}

@Test
@DisplayName("UC11: Chống double-booking phòng trị liệu")
void testCreateSpaBooking_PreventTreatmentRoomConflict() {
    // Given: Treatment Room ID=3 đang được dùng
    when(spaBookingRepository.hasTreatmentRoomConflict(3, any(), any())).thenReturn(true);

    // When & Then
    assertThrows(BusinessException.class, () ->
        spaBookingService.createBooking(buildSpaBookingDTO(3))
    );
}
```

---

## Module 4 – F&B Management

### Backend Unit Tests

#### `ChefMealServiceTest.java`

```java
@Test
@DisplayName("UC16: Chef xem danh sách order kèm cảnh báo dị ứng")
void testGetOrdersWithAllergyAlert() {
    // Given: Khách có dị ứng hải sản, đặt món cá hồi
    FoodOrder order = createOrderWithSeafoodAllergy();
    when(foodOrderRepository.findAllWithAllergyInfo()).thenReturn(List.of(order));

    // When
    List<OrderWithAllergyDTO> result = chefMealService.getOrdersWithAllergyAlert();

    // Then
    assertFalse(result.isEmpty());
    assertTrue(result.get(0).isHasAllergyWarning());
    assertEquals("SEAFOOD", result.get(0).getAllergyType());
}
```

---

## Module 5 – Checkout & Analytics

### Backend Unit Tests

#### `InvoiceServiceTest.java`

```java
@Test
@DisplayName("UC21: Tạo hóa đơn tổng hợp – tổng đúng từ subtotals")
void testCreateConsolidatedInvoice() {
    // Given
    BigDecimal roomSubtotal = new BigDecimal("7500000.00");
    BigDecimal spaSubtotal = new BigDecimal("1200000.00");
    BigDecimal foodSubtotal = new BigDecimal("500000.00");
    BigDecimal taxRate = new BigDecimal("0.10"); // 10% VAT

    // When
    BigDecimal finalAmount = invoiceService.calculateFinalAmount(
        roomSubtotal, spaSubtotal, foodSubtotal, taxRate
    );

    // Then
    BigDecimal expectedSubtotal = new BigDecimal("9200000.00");
    BigDecimal expectedFinal = new BigDecimal("10120000.00"); // +10% VAT
    assertEquals(expectedFinal, finalAmount.setScale(2, RoundingMode.HALF_UP));
}

@Test
@DisplayName("UC22: Không thể checkout khi còn nợ hóa đơn")
void testCheckout_BlockedWhenUnpaidInvoice() {
    // Given
    Invoice unpaidInvoice = new Invoice();
    unpaidInvoice.setStatus(InvoiceStatus.UNPAID);
    when(invoiceRepository.findByBookingId(1)).thenReturn(List.of(unpaidInvoice));

    // When & Then
    BusinessException ex = assertThrows(BusinessException.class, () ->
        checkoutService.processCheckout(1)
    );
    assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    assertTrue(ex.getMessage().contains("unpaid"));
}
```

---

## Hướng dẫn chạy Unit Tests

### Backend (Maven)
```bash
cd 05-Development/backend
./mvnw test
# Xem report tại: target/surefire-reports/
```

### Frontend (Vitest)
```bash
cd 05-Development/frontend
npm test
# Xem coverage: npm run test:coverage
```

---

## Checklist trước khi submit

- [ ] Tất cả test methods có `@DisplayName` mô tả rõ ràng.
- [ ] Không có `Thread.sleep()` trong test – dùng `@Timeout` thay thế.
- [ ] Mock chính xác – không mock chính class đang test.
- [ ] Test cả happy path và error path.
- [ ] Coverage service layer ≥ 70%.

---

*Xem thêm hướng dẫn tại `00-Policy/TESTING_GUIDELINES.md` và `00-Policy/TESTCASE_WRITING_GUIDE.md`*
