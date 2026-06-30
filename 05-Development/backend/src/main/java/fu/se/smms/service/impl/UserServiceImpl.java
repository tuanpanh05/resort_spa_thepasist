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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;// ok2

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
        String role = "CUSTOMER";
        String emailLower = request.getEmail() != null ? request.getEmail().toLowerCase() : "";
        if (emailLower.contains("admin")) {
            role = "ADMIN";
        } else if (emailLower.contains("staff")) {
            role = "STAFF";
        } else if (emailLower.contains("chef")) {
            role = "CHEF";
        } else if (emailLower.contains("receptionist")) {
            role = "RECEPTIONIST";
        } else if (emailLower.contains("manager")) {
            role = "MANAGER";
        }

        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        User user;

        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if ("GUEST".equalsIgnoreCase(existing.getRole()) || "INACTIVE".equals(existing.getStatus())) {
                // Upgrade GUEST user to CUSTOMER or detected role, or allow re-registering an unverified INACTIVE user
                existing.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                if (request.getFullName() != null && !request.getFullName().isBlank()) {
                    existing.setFullName(request.getFullName());
                }
                if (request.getPhone() != null && !request.getPhone().isBlank()) {
                    existing.setPhone(request.getPhone());
                }
                if (request.getIdPassport() != null && !request.getIdPassport().isBlank()) {
                    existing.setIdPassportEncrypted(request.getIdPassport());
                }
                existing.setRole(role);
                existing.setStatus("INACTIVE"); // Needs OTP validation to activate
                user = userRepository.save(existing);
            } else {
                throw new RuntimeException("Email is already registered!");
            }
        } else {
            user = User.builder()
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .idPassportEncrypted(request.getIdPassport()) // Automatically encrypted by AesEncryptor
                    .role(role)
                    .status("INACTIVE")
                    .build();
            user = userRepository.save(user);
        }

        otpService.generateAndSendOtp(user.getEmail());
        return mapToProfileDTO(user);
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
        return new LoginResponse(token, user.getEmail(), user.getRole(), user.getFullName(), user.getSpecialty());
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
                    .role("CUSTOMER") // Role mặc định
                    .status("ACTIVE")
                    .build();
            user = userRepository.save(user);
        } else {
            // Chỉ cập nhật fullName nếu tên hiện tại trong hệ thống bị trống hoặc null
            if (request.getFullName() != null && !request.getFullName().isBlank()
                    && (user.getFullName() == null || user.getFullName().isBlank())) {
                user.setFullName(request.getFullName());
                user = userRepository.save(user);
            }
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("Your account is " + user.getStatus());
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getEmail(), user.getRole(), user.getFullName(), user.getSpecialty());
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

        if (request.getGoogleCalendarSyncEnabled() != null) {
            user.setGoogleCalendarSyncEnabled(request.getGoogleCalendarSyncEnabled());
        }
        if (request.getGoogleCalendarId() != null) {
            user.setGoogleCalendarId(request.getGoogleCalendarId());
        }
        if (request.getCalendarRemindersEnabled() != null) {
            user.setCalendarRemindersEnabled(request.getCalendarRemindersEnabled());
        }
        if (request.getReminderLeadTimeMins() != null) {
            user.setReminderLeadTimeMins(request.getReminderLeadTimeMins());
        }

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
                .googleCalendarSyncEnabled(user.getGoogleCalendarSyncEnabled())
                .googleCalendarId(user.getGoogleCalendarId())
                .calendarRemindersEnabled(user.getCalendarRemindersEnabled())
                .reminderLeadTimeMins(user.getReminderLeadTimeMins())
                .specialty(user.getSpecialty())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileDTO> getAllStaffUsers() {
        // Return all non-CUSTOMER users for Admin management
        return userRepository.findByRoleNot("CUSTOMER")
                .stream()
                .map(user -> mapToProfileDTO(user))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public UserProfileDTO updateUserRoleAndStatus(Integer userId, String role, String status, String specialty) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại với ID: " + userId));
        if (role != null && !role.isBlank()) {
            user.setRole(role);
        }
        if (status != null && !status.isBlank()) {
            user.setStatus(status);
        }
        if (specialty != null) {
            user.setSpecialty(specialty.isBlank() ? null : specialty);
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
                .specialty(request.getSpecialty())
                .status("ACTIVE")
                .build();
        return mapToProfileDTO(userRepository.save(user));
    }

    // ---------------------------------------------------------------
    // Profile – Booking history
    // ---------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<BookingHistoryDTO> getMyRoomBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return roomBookingRepository.findAllByUserIdWithDetails(user.getUserId())
                .stream()
                .map(rb -> mapToBookingHistoryDTO(rb))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpaBookingHistoryDTO> getMySpaBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return spaBookingRepository.findAllByUserIdWithService(user.getUserId())
                .stream()
                .map(sb -> mapToSpaBookingHistoryDTO(sb))
                .collect(java.util.stream.Collectors.toList());
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
        List<BookingHistoryDTO.RoomDetailDTO> roomDetails = java.util.Collections.emptyList();
        if (rb.getDetails() != null) {
            roomDetails = rb.getDetails().stream().map(d -> {
                String roomNum = "N/A";
                String typeName = "N/A";
                if (d.getRoom() != null) {
                    roomNum = d.getRoom().getRoomNumber();
                    if (d.getRoom().getRoomType() != null) {
                        typeName = d.getRoom().getRoomType().getTypeName();
                    }
                }
                return new BookingHistoryDTO.RoomDetailDTO(d.getDetailId(), roomNum, typeName, d.getPriceAtBooking());
            }).collect(java.util.stream.Collectors.toList());
        }

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
                .therapistName(sb.getTherapist() != null ? sb.getTherapist().getFullName() : "N/A")
                .roomName(sb.getTreatmentRoom() != null ? sb.getTreatmentRoom().getRoomName() : "N/A")
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
