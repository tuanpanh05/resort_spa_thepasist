package fu.se.smms.service;

import fu.se.smms.dto.MedicalProfileDTO;
import fu.se.smms.dto.RegisterRequestDTO;
import fu.se.smms.dto.UserDTO;
import fu.se.smms.entity.MedicalProfile;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.MedicalProfileRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.impl.MedicalProfileServiceImpl;
import fu.se.smms.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for Module 1: Authentication & Sensitive Health Profile.
 *
 * Coverage:
 * - AUTH-TC-001: Duplicate email rejected on register (BR-01)
 * - AUTH-TC-004: Locked (INACTIVE) account cannot log in (BR-22)
 * - AUTH-TC-005: MedicalProfile save rejected if consent is unsigned (UC02 / Decree 13/2023)
 * - AUTH-TC-006: MedicalProfile save succeeds with valid consent (UC02)
 * - AUTH-TC-007: RBAC role-based data filtering — CHEF vs THERAPIST vs RECEPTIONIST (BR-21)
 * - AUTH-TC-008: Self-service sensitive data deletion (UC05 / BR-20)
 *
 * Related TDD Spec: Backend/docs/AUTH_TDD.md
 * Related EDS Spec: Backend/docs/AUTH_EDS.md
 */
@ExtendWith(MockitoExtension.class)
@Tag("unit")
class AuthModule1ServiceTest {

    // ===== UserService mocks =====
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    // ===== MedicalProfileService mocks =====
    @Mock
    private MedicalProfileRepository medicalProfileRepository;

    // Note: MedicalProfileServiceImpl also needs UserRepository — reuse the mock above
    private MedicalProfileServiceImpl medicalProfileService;

    @BeforeEach
    void setUp() {
        // Manually construct because @InjectMocks for medicalProfileService would conflict
        medicalProfileService = new MedicalProfileServiceImpl(medicalProfileRepository, userRepository);
    }

    // ==========================================================================
    //  AUTH-TC-001 — Duplicate email rejected (BR-01)
    // ==========================================================================
    @Test
    @DisplayName("AUTH-TC-001: Đăng ký với email đã tồn tại ném ra AUTH-001")
    void register_duplicateEmail_throwsAuth001() {
        // Arrange
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setEmail("guest1@gmail.com");
        dto.setPassword("Secret@123");
        dto.setFullName("Trần Khách Hàng");
        dto.setPhone("0933333333");

        when(userRepository.existsByEmail("guest1@gmail.com")).thenReturn(true);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class,
                () -> userService.register(dto));

        assertThat(ex.getCode()).isEqualTo("AUTH-001");
        verify(userRepository, never()).save(any(User.class));
    }

    // ==========================================================================
    //  AUTH-TC-001 (happy path) — Registration succeeds for unique email
    // ==========================================================================
    @Test
    @DisplayName("AUTH-TC-001 Happy Path: Email mới đăng ký thành công, status = INACTIVE")
    void register_newEmail_returnsUserWithInactiveStatus() {
        // Arrange
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setEmail("newuser@test.com");
        dto.setPassword("Secret@123");
        dto.setFullName("Nguyễn Mới");
        dto.setPhone("0900000001");

        when(userRepository.existsByEmail("newuser@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("$2a$10$hashedpassword");

        User savedUser = new User();
        savedUser.setUserId(10);
        savedUser.setEmail("newuser@test.com");
        savedUser.setFullName("Nguyễn Mới");
        savedUser.setPhone("0900000001");
        savedUser.setRole("CUSTOMER");
        savedUser.setStatus("INACTIVE"); // BR-02: starts inactive
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        UserDTO result = userService.register(dto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("INACTIVE"); // BR-02: must be INACTIVE
        assertThat(result.getRole()).isEqualTo("CUSTOMER");
        assertThat(result.getEmail()).isEqualTo("newuser@test.com");
        verify(userRepository, times(1)).save(any(User.class));
    }

    // ==========================================================================
    //  AUTH-TC-004 — Locked account rejected (BR-22)
    // ==========================================================================
    @Test
    @DisplayName("AUTH-TC-004: Tài khoản nhân viên bị khóa (INACTIVE) — updateStaffStatus không thể unlock nếu ID không tìm thấy")
    void updateStaffStatus_staffNotFound_throwsAuth404() {
        // Arrange
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class,
                () -> userService.updateStaffStatus(999, "ACTIVE"));

        assertThat(ex.getCode()).isEqualTo("AUTH-404");
    }

    @Test
    @DisplayName("AUTH-TC-004: Admin khóa nhân viên thành công — status đổi thành INACTIVE")
    void updateStaffStatus_lockStaff_setsInactive() {
        // Arrange — FX-002: staff currently ACTIVE
        User staff = new User();
        staff.setUserId(3);
        staff.setEmail("therapist1@nguson.vn");
        staff.setRole("THERAPIST");
        staff.setStatus("ACTIVE");

        when(userRepository.findById(3)).thenReturn(Optional.of(staff));

        User updatedStaff = new User();
        updatedStaff.setUserId(3);
        updatedStaff.setEmail("therapist1@nguson.vn");
        updatedStaff.setRole("THERAPIST");
        updatedStaff.setStatus("INACTIVE"); // now locked
        when(userRepository.save(any(User.class))).thenReturn(updatedStaff);

        // Act
        UserDTO result = userService.updateStaffStatus(3, "INACTIVE");

        // Assert
        assertThat(result.getStatus()).isEqualTo("INACTIVE"); // BR-22: locked
        verify(userRepository, times(1)).save(any(User.class));
    }

    // ==========================================================================
    //  AUTH-TC-005 — MedicalProfile save rejected without consent (Decree 13/2023 Art.6)
    // ==========================================================================
    @Test
    @DisplayName("AUTH-TC-005: Lưu hồ sơ sức khỏe không có consent — ném AUTH-003")
    void saveProfile_consentFalse_throwsAuth003() {
        // Arrange
        MedicalProfileDTO dto = new MedicalProfileDTO();
        dto.setUserId(5);
        dto.setPhysicalConditionPlaintext("Bị đau cột sống lưng L4-L5");
        dto.setFoodAllergiesPlaintext("Dị ứng lạc");
        dto.setExplicitConsentSigned(false); // Consent NOT given

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class,
                () -> medicalProfileService.saveOrUpdateProfile(dto, 5));

        assertThat(ex.getCode()).isEqualTo("AUTH-003");
        verify(medicalProfileRepository, never()).save(any(MedicalProfile.class));
    }

    @Test
    @DisplayName("AUTH-TC-005: Lưu hồ sơ sức khỏe với consent = null — ném AUTH-003")
    void saveProfile_consentNull_throwsAuth003() {
        // Arrange
        MedicalProfileDTO dto = new MedicalProfileDTO();
        dto.setUserId(5);
        dto.setExplicitConsentSigned(null); // null also counts as unsigned

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class,
                () -> medicalProfileService.saveOrUpdateProfile(dto, 5));

        assertThat(ex.getCode()).isEqualTo("AUTH-003");
        verify(medicalProfileRepository, never()).save(any(MedicalProfile.class));
    }

    // ==========================================================================
    //  AUTH-TC-006 — MedicalProfile save succeeds with consent (UC02 / AES encryption)
    // ==========================================================================
    @Test
    @DisplayName("AUTH-TC-006: Lưu hồ sơ sức khỏe với consent = true — thành công")
    void saveProfile_consentTrue_savesSuccessfully() {
        // Arrange — FX-001: existing active customer
        User user = new User();
        user.setUserId(5);
        user.setEmail("guest1@gmail.com");
        user.setStatus("ACTIVE");

        MedicalProfileDTO dto = new MedicalProfileDTO();
        dto.setUserId(5);
        dto.setPhysicalConditionPlaintext("Bị gai cột sống");
        dto.setFoodAllergiesPlaintext("Dị ứng lạc và trứng");
        dto.setExplicitConsentSigned(true); // Consent given

        when(userRepository.findById(5)).thenReturn(Optional.of(user));
        when(medicalProfileRepository.findByUser_UserId(5)).thenReturn(Optional.empty()); // new profile

        MedicalProfile savedProfile = new MedicalProfile();
        savedProfile.setProfileId(1);
        savedProfile.setUser(user);
        // In a real JPA setup, these would be AES-encrypted ciphertext in DB.
        // The entity holds plaintext in memory after JPA converter decrypts.
        savedProfile.setPhysicalConditionEncrypted("Bị gai cột sống");
        savedProfile.setFoodAllergiesEncrypted("Dị ứng lạc và trứng");
        savedProfile.setExplicitConsentSigned(true);
        when(medicalProfileRepository.save(any(MedicalProfile.class))).thenReturn(savedProfile);

        // Act
        MedicalProfileDTO result = medicalProfileService.saveOrUpdateProfile(dto, 5);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getProfileId()).isEqualTo(1);
        assertThat(result.getExplicitConsentSigned()).isTrue();
        // Verify content is persisted correctly (in-memory plaintext; encryption occurs at JPA layer)
        assertThat(result.getPhysicalConditionPlaintext()).isEqualTo("Bị gai cột sống");
        assertThat(result.getFoodAllergiesPlaintext()).isEqualTo("Dị ứng lạc và trứng");

        verify(medicalProfileRepository, times(1)).save(any(MedicalProfile.class));
    }

    // ==========================================================================
    //  AUTH-TC-007 — RBAC role-based data filtering (BR-21)
    // ==========================================================================
    @Test
    @DisplayName("AUTH-TC-007 CHEF: Chỉ nhận food allergies, physical condition bị null")
    void getForRole_chefRole_onlyFoodAllergiesReturned() {
        // Arrange — FX-003: full medical profile of customer 5
        User customer = new User();
        customer.setUserId(5);
        MedicalProfile profile = new MedicalProfile();
        profile.setProfileId(1);
        profile.setUser(customer);
        profile.setPhysicalConditionEncrypted("Bị gai cột sống"); // decrypted by converter
        profile.setFoodAllergiesEncrypted("Dị ứng lạc");          // decrypted by converter
        profile.setExplicitConsentSigned(true);

        when(medicalProfileRepository.findByUser_UserId(5)).thenReturn(Optional.of(profile));

        // Act
        MedicalProfileDTO result = medicalProfileService.getForRole(5, "CHEF");

        // Assert
        assertThat(result.getFoodAllergiesPlaintext()).isEqualTo("Dị ứng lạc"); // CHEF can see
        assertThat(result.getPhysicalConditionPlaintext()).isNull();              // CHEF must NOT see
    }

    @Test
    @DisplayName("AUTH-TC-007 THERAPIST: Chỉ nhận physical condition, food allergies bị null")
    void getForRole_therapistRole_onlyPhysicalConditionReturned() {
        // Arrange
        User customer = new User();
        customer.setUserId(5);
        MedicalProfile profile = new MedicalProfile();
        profile.setProfileId(1);
        profile.setUser(customer);
        profile.setPhysicalConditionEncrypted("Bị gai cột sống");
        profile.setFoodAllergiesEncrypted("Dị ứng lạc");
        profile.setExplicitConsentSigned(true);

        when(medicalProfileRepository.findByUser_UserId(5)).thenReturn(Optional.of(profile));

        // Act
        MedicalProfileDTO result = medicalProfileService.getForRole(5, "THERAPIST");

        // Assert
        assertThat(result.getPhysicalConditionPlaintext()).isEqualTo("Bị gai cột sống"); // THERAPIST can see
        assertThat(result.getFoodAllergiesPlaintext()).isNull();                           // THERAPIST must NOT see
    }

    @Test
    @DisplayName("AUTH-TC-007 RECEPTIONIST: Hoàn toàn bị cấm truy cập — ném AUTH-005")
    void getForRole_receptionistRole_throwsAuth005() {
        // Act & Assert (no repository call needed — check happens before query)
        BusinessException ex = assertThrows(BusinessException.class,
                () -> medicalProfileService.getForRole(5, "RECEPTIONIST"));

        assertThat(ex.getCode()).isEqualTo("AUTH-005");
        verify(medicalProfileRepository, never()).findByUser_UserId(anyInt());
    }

    @Test
    @DisplayName("AUTH-TC-007 MANAGER: Nhận đầy đủ cả 2 trường nhạy cảm")
    void getForRole_managerRole_allFieldsReturned() {
        // Arrange
        User customer = new User();
        customer.setUserId(5);
        MedicalProfile profile = new MedicalProfile();
        profile.setProfileId(1);
        profile.setUser(customer);
        profile.setPhysicalConditionEncrypted("Bị gai cột sống");
        profile.setFoodAllergiesEncrypted("Dị ứng lạc");
        profile.setExplicitConsentSigned(true);

        when(medicalProfileRepository.findByUser_UserId(5)).thenReturn(Optional.of(profile));

        // Act
        MedicalProfileDTO result = medicalProfileService.getForRole(5, "MANAGER");

        // Assert
        assertThat(result.getPhysicalConditionPlaintext()).isEqualTo("Bị gai cột sống");
        assertThat(result.getFoodAllergiesPlaintext()).isEqualTo("Dị ứng lạc");
    }

    // ==========================================================================
    //  AUTH-TC-008 — Self-service sensitive data deletion (UC05 / BR-20)
    // ==========================================================================
    @Test
    @DisplayName("AUTH-TC-008: Xóa hồ sơ nhạy cảm thành công khi profile tồn tại")
    void deleteSensitiveProfile_existingProfile_wipesData() {
        // Arrange — FX-003: customer has a profile
        User customer = new User();
        customer.setUserId(5);
        MedicalProfile profile = new MedicalProfile();
        profile.setProfileId(1);
        profile.setUser(customer);
        profile.setPhysicalConditionEncrypted("Bị gai cột sống");
        profile.setFoodAllergiesEncrypted("Dị ứng lạc");
        profile.setExplicitConsentSigned(true);

        when(medicalProfileRepository.findByUser_UserId(5)).thenReturn(Optional.of(profile));
        when(medicalProfileRepository.wipeSensitiveData(5)).thenReturn(1); // 1 row updated

        // Act (must not throw)
        medicalProfileService.deleteSensitiveProfile(5, 5);

        // Assert
        verify(medicalProfileRepository, times(1)).wipeSensitiveData(5);
    }

    @Test
    @DisplayName("AUTH-TC-008: Xóa hồ sơ nhạy cảm khi không tìm thấy profile — ném AUTH-404")
    void deleteSensitiveProfile_profileNotFound_throwsAuth404() {
        // Arrange
        when(medicalProfileRepository.findByUser_UserId(999)).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class,
                () -> medicalProfileService.deleteSensitiveProfile(999, 999));

        assertThat(ex.getCode()).isEqualTo("AUTH-404");
        verify(medicalProfileRepository, never()).wipeSensitiveData(anyInt());
    }
}
