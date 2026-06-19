package fu.se.smms.controller;

import fu.se.smms.dto.*;
import fu.se.smms.service.OtpService;
import fu.se.smms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private fu.se.smms.repository.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping({"/debug-reset-staff", "/debug-reset"})
    public ResponseEntity<?> debugResetStaff() {
        try {
            // Reset staff
            fu.se.smms.entity.User staff = userRepository.findByEmail("staff@nguson.com")
                    .orElse(null);
            if (staff == null) {
                staff = fu.se.smms.entity.User.builder()
                        .email("staff@nguson.com")
                        .fullName("Staff Member")
                        .phone("0900000001")
                        .build();
            }
            staff.setPasswordHash(passwordEncoder.encode("Password123"));
            staff.setRole("STAFF");
            staff.setStatus("ACTIVE");
            userRepository.save(staff);

            // Reset admin
            fu.se.smms.entity.User admin = userRepository.findByEmail("admin@nguson.com")
                    .orElse(null);
            if (admin == null) {
                admin = fu.se.smms.entity.User.builder()
                        .email("admin@nguson.com")
                        .fullName("Administrator")
                        .phone("0900000000")
                        .build();
            }
            admin.setPasswordHash(passwordEncoder.encode("Password123"));
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");
            userRepository.save(admin);

            java.util.List<fu.se.smms.entity.User> allUsers = userRepository.findAll();
            java.util.List<String> userSummary = allUsers.stream()
                .map(u -> u.getEmail() + " (" + u.getRole() + ", status=" + u.getStatus() + ")")
                .toList();

            Map<String, Object> response = new java.util.LinkedHashMap<>();
            response.put("message", "Reset staff and admin accounts successfully with password Password123");
            response.put("all_users_in_db", userSummary);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // UC01 – Register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            UserProfileDTO profile = userService.signUp(signUpRequest);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // UC01 – Registration Verification
    @PostMapping("/verify-registration")
    public ResponseEntity<?> verifyRegistration(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            userService.verifyRegistration(request.getEmail(), request.getOtpCode());
            return ResponseEntity.ok(Map.of(
                "message", "Xác thực tài khoản thành công! Bạn có thể đăng nhập.",
                "verified", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // UC01 – Resend Registration OTP
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam String email) {
        try {
            userService.resendVerificationOtp(email);
            return ResponseEntity.ok(Map.of(
                "message", "Mã OTP mới đã được gửi lại vào email."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // UC01 – Login
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = userService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Google Login
    @PostMapping("/google")
    public ResponseEntity<?> authenticateGoogleUser(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            LoginResponse response = userService.loginWithGoogle(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // UC01 – Forgot Password Step 1: Send OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            otpService.generateAndSendOtp(request.getEmail());
            return ResponseEntity.ok(Map.of(
                "message", "Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // UC01 – Forgot Password Step 2: Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            otpService.verifyOtp(request.getEmail(), request.getOtpCode());
            return ResponseEntity.ok(Map.of(
                "message", "Mã OTP hợp lệ. Bạn có thể đặt mật khẩu mới.",
                "verified", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // UC01 – Forgot Password Step 3: Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            otpService.resetPassword(request.getEmail(), request.getOtpCode(), request.getNewPassword());
            return ResponseEntity.ok(Map.of(
                "message", "Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập với mật khẩu mới."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Helper error response DTO
    public static class ErrorResponse {
        private String message;

        public ErrorResponse() {}

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
