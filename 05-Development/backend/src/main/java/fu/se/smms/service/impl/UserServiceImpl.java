package fu.se.smms.service.impl;

import fu.se.smms.config.JwtUtils;
import fu.se.smms.dto.*;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.SpaBooking;
import fu.se.smms.entity.User;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.SpaBookingRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.UserService;
import fu.se.smms.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    @Autowired
    private SpaBookingRepository spaBookingRepository;

    @Autowired
    private OtpService otpService;

    @Override
    public UserProfileDTO signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .idPassportEncrypted(request.getIdPassport()) // Automatically encrypted by AesEncryptor
                .role("GUEST")
                .status("INACTIVE")
                .build();

        User savedUser = userRepository.save(user);
        otpService.generateAndSendOtp(savedUser.getEmail());
        return mapToProfileDTO(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("Your account is " + user.getStatus());
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getEmail(), user.getRole(), user.getFullName());
    }

    @Override
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            // Tự động đăng ký tài khoản mới cho user đăng nhập qua Google
            user = User.builder()
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .fullName(request.getFullName())
                    .role("GUEST") // Role mặc định
                    .status("ACTIVE")
                    .build();
            user = userRepository.save(user);
        } else {
            // Chỉ cập nhật fullName nếu tên hiện tại trong hệ thống bị trống hoặc null
            if (request.getFullName() != null && !request.getFullName().isBlank() && (user.getFullName() == null || user.getFullName().isBlank())) {
                user.setFullName(request.getFullName());
                user = userRepository.save(user);
            }
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("Your account is " + user.getStatus());
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getEmail(), user.getRole(), user.getFullName());
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToProfileDTO(user);
    }

    @Override
    public UserProfileDTO updateUserProfile(String email, UserProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setIdPassportEncrypted(request.getIdPassport()); // Automatically encrypted by AesEncryptor

        User updatedUser = userRepository.save(user);
        return mapToProfileDTO(updatedUser);
    }

    private UserProfileDTO mapToProfileDTO(User user) {
        return UserProfileDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .idPassport(user.getIdPassportEncrypted()) // Automatically decrypted by AesEncryptor
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<UserProfileDTO> getAllStaffUsers() {
        // Return all non-GUEST users for Admin management
        return userRepository.findByRoleNot("GUEST")
                .stream()
                .map(this::mapToProfileDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public UserProfileDTO updateUserRoleAndStatus(Integer userId, String role, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại với ID: " + userId));
        if (role != null && !role.isBlank()) {
            user.setRole(role);
        }
        if (status != null && !status.isBlank()) {
            user.setStatus(status);
        }
        return mapToProfileDTO(userRepository.save(user));
    }

    @Override
    public void deleteUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Người dùng không tồn tại với ID: " + userId);
        }
        userRepository.deleteById(userId);
    }

    @Override
    public UserProfileDTO createStaffAccount(SignUpRequest request, String role) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác.");
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .idPassportEncrypted(request.getIdPassport())
                .role(role != null ? role.toUpperCase() : "STAFF")
                .status("ACTIVE")
                .build();
        return mapToProfileDTO(userRepository.save(user));
    }

    // ---------------------------------------------------------------
    // Profile – Booking history
    // ---------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public java.util.List<BookingHistoryDTO> getMyRoomBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return roomBookingRepository.findAllByUserIdWithDetails(user.getUserId())
                .stream()
                .map(this::mapToBookingHistoryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<SpaBookingHistoryDTO> getMySpaBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return spaBookingRepository.findAllByUserIdWithService(user.getUserId())
                .stream()
                .map(this::mapToSpaBookingHistoryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ---------------------------------------------------------------
    // Private mappers for new DTOs
    // ---------------------------------------------------------------

    private BookingHistoryDTO mapToBookingHistoryDTO(RoomBooking rb) {
        java.util.List<BookingHistoryDTO.RoomDetailDTO> roomDetails = rb.getDetails() == null
                ? java.util.Collections.emptyList()
                : rb.getDetails().stream().map(d -> new BookingHistoryDTO.RoomDetailDTO(
                        d.getRoom() != null ? d.getRoom().getRoomNumber() : "N/A",
                        d.getRoom() != null && d.getRoom().getRoomType() != null
                                ? d.getRoom().getRoomType().getTypeName() : "N/A",
                        d.getPriceAtBooking())).collect(Collectors.toList());

        return BookingHistoryDTO.builder()
                .bookingId(rb.getBookingId())
                .checkInDate(rb.getCheckInDate())
                .checkOutDate(rb.getCheckOutDate())
                .status(rb.getStatus())
                .totalDeposit(rb.getTotalDeposit())
                .createdAt(rb.getCreatedAt())
                .packageName(rb.getRetreatPackage() != null ? rb.getRetreatPackage().getName() : null)
                .rooms(roomDetails)
                .build();
    }

    private SpaBookingHistoryDTO mapToSpaBookingHistoryDTO(SpaBooking sb) {
        return SpaBookingHistoryDTO.builder()
                .spaBookingId(sb.getSpaBookingId())
                .serviceName(sb.getSpaService() != null ? sb.getSpaService().getName() : "N/A")
                .serviceCategory(sb.getSpaService() != null ? sb.getSpaService().getCategory() : null)
                .startDatetime(sb.getStartDatetime())
                .endDatetime(sb.getEndDatetime())
                .status(sb.getStatus())
                .priceAtBooking(sb.getPriceAtBooking())
                .isPackageIncluded(sb.getIsPackageIncluded())
                .build();
    }

    @Override
    public void verifyRegistration(String email, String otpCode) {
        otpService.verifyAndUseOtp(email, otpCode);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        user.setStatus("ACTIVE");
        userRepository.save(user);
    }

    @Override
    public void resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        if (!"INACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("Tài khoản đã được kích hoạt hoặc bị khóa.");
        }
        otpService.generateAndSendOtp(email);
    }
}
