package fu.se.smms.service.impl;

import fu.se.smms.config.JwtUtils;
import fu.se.smms.dto.*;
import fu.se.smms.entity.User;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

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
                .status("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);
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
}
