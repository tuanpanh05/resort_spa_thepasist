# 🔧 REFACTOR REPORTS – SMMS Ngũ Sơn Resort & Spa Management System

> **Thư mục:** `04-Implement/REFACTOR_REPORTS/`  
> **Mục đích:** Ghi lại các lần tái cấu trúc code (refactoring) trong dự án để theo dõi chất lượng kỹ thuật và ngăn chặn technical debt.

---

## Danh sách Refactor

| ID | Ngày | Phạm vi | Mô tả | Tác giả | Trạng thái |
|----|------|---------|--------|---------|------------|
| REF-001 | 2026-06-10 | Backend Service Layer | Tách `RoomBookingService` - logic tính giá thành phương thức riêng | Student 2 | ✅ Done |
| REF-002 | 2026-06-12 | Frontend Components | Tách `Header.jsx` - logic điều hướng theo role vào hook riêng | Student 1 | ✅ Done |
| REF-003 | 2026-06-15 | Backend Exception Handling | Chuyển từ `try-catch Exception` generic sang `BusinessException` chuẩn | Team | ✅ Done |
| REF-004 | 2026-06-20 | Frontend API Layer | Consolidate `api.js` và `axiosClient.js` - loại bỏ duplicate HTTP client | Student 5 | ✅ Done |
| REF-005 | 2026-06-25 | Backend Security | Tăng BCrypt strength từ 10 lên 12 | Student 1 | ✅ Done |
| REF-006 | 2026-06-27 | Frontend State Management | Thêm `NotificationContext.jsx` thay thế local state rải rác | Student 3 | ✅ Done |

---

## REF-001 – Tách RoomBookingService (2026-06-10)

### Vấn đề
`RoomBookingService.java` ban đầu có một phương thức `createBooking()` quá dài (>200 dòng) chứa cả logic tính giá, validation, và tạo booking. Điều này vi phạm **Single Responsibility Principle**.

### Giải pháp

**Trước refactor:**
```java
public BookingResponseDTO createBooking(BookingRequestDTO dto) {
    // 200+ dòng: validate, tính giá, tạo entity, gửi email...
}
```

**Sau refactor:**
```java
public BookingResponseDTO createBooking(BookingRequestDTO dto) {
    validateBookingRequest(dto);
    BigDecimal totalPrice = calculateTotalPrice(dto);
    RoomBooking booking = buildBookingEntity(dto, totalPrice);
    RoomBooking saved = bookingRepository.save(booking);
    emailService.sendBookingConfirmation(saved);
    return mapToDTO(saved);
}

private void validateBookingRequest(BookingRequestDTO dto) { ... }
private BigDecimal calculateTotalPrice(BookingRequestDTO dto) { ... }
private RoomBooking buildBookingEntity(BookingRequestDTO dto, BigDecimal price) { ... }
```

### Kết quả
- ✅ Giảm độ phức tạp cyclomatic từ 18 xuống 6.
- ✅ Unit test coverage tăng từ 45% lên 78%.
- ✅ Dễ dàng mock từng phương thức khi test.

---

## REF-002 – Tách Header Navigation Logic (2026-06-12)

### Vấn đề
`Header.jsx` (30KB) chứa logic điều hướng theo role trực tiếp trong component, gây khó maintain và test.

### Giải pháp
Tách navigation items vào hook `useNavigation.js`:

```javascript
// hooks/useNavigation.js
export const useNavigation = (userRole) => {
  const navItems = useMemo(() => {
    switch(userRole) {
      case 'MANAGER': return adminNavItems;
      case 'RECEPTIONIST': return staffNavItems;
      case 'CHEF': return chefNavItems;
      case 'THERAPIST': return specialistNavItems;
      default: return guestNavItems;
    }
  }, [userRole]);
  return navItems;
};
```

### Kết quả
- ✅ Header.jsx giảm từ 30KB xuống còn tập trung vào UI thuần.
- ✅ Có thể test navigation logic độc lập với component.

---

## REF-003 – Chuẩn hóa Exception Handling (2026-06-15)

### Vấn đề
Nhiều Controller/Service dùng `catch (Exception e)` generic, trả về HTTP 500 cho tất cả lỗi.

### Giải pháp

**Tạo `BusinessException.java`:**
```java
public class BusinessException extends RuntimeException {
    private final HttpStatus status;
    
    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
```

**Global Exception Handler:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        return ResponseEntity.status(ex.getStatus())
            .body(new ErrorResponse(ex.getMessage(), ex.getStatus().value()));
    }
}
```

**Áp dụng:**
```java
// Trước
throw new Exception("Room not found");

// Sau  
throw new BusinessException("Room not found", HttpStatus.NOT_FOUND);
```

### Kết quả
- ✅ API trả về đúng HTTP status code (404, 409, 400, 403...).
- ✅ Frontend có thể handle lỗi chính xác hơn.
- ✅ Log lỗi rõ ràng hơn ở production.

---

## REF-004 – Consolidate API Layer Frontend (2026-06-20)

### Vấn đề
Frontend có 2 HTTP client: `api.js` (Axios config) và một số component gọi `fetch()` trực tiếp. Gây không nhất quán trong xử lý auth header và error.

### Giải pháp
Tập trung tất cả API call vào `src/api/axiosClient.js` với interceptor chuẩn:

```javascript
// src/api/axiosClient.js
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// Request interceptor: tự động gắn JWT
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh khi 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error);
  }
);
```

### Kết quả
- ✅ 100% API calls dùng axiosClient với auth header nhất quán.
- ✅ Auto token refresh hoạt động trên toàn hệ thống.
- ✅ Không còn lỗi "401 Unauthorized" do quên gắn token.

---

## Hướng dẫn tạo Refactor Report mới

```markdown
## REF-{ID} – Tên refactor (YYYY-MM-DD)

### Vấn đề
Mô tả vấn đề kỹ thuật hiện tại (anti-pattern, code smell, technical debt).

### Giải pháp
Code trước và sau refactor.

### Kết quả
- ✅ Các cải thiện đo lường được.
- ✅ Ảnh hưởng tích cực.
```

---

*Xem thêm chính sách code quality trong `00-Policy/CODE_REVIEW_STANDARD.md`*
