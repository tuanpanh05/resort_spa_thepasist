package fu.se.smms.service.impl;

import fu.se.smms.dto.MedicalProfileDTO;
import fu.se.smms.entity.MedicalProfile;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.MedicalProfileRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.MedicalProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * MedicalProfileServiceImpl — Production implementation of MedicalProfileService.
 * Covers: UC02 (consent validation + AES-encrypted save), BR-21 (RBAC filtering),
 *         UC05/BR-20 (Right to Deletion).
 *
 * Note: AES encryption is performed transparently by @Convert on the entity fields.
 *       This service operates only with plaintext values.
 */
@Service
public class MedicalProfileServiceImpl implements MedicalProfileService {

    private final MedicalProfileRepository profileRepository;
    private final UserRepository userRepository;

    public MedicalProfileServiceImpl(MedicalProfileRepository profileRepository,
                                     UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    // ---------------------------------------------------------------------------
    // UC02 — Save / update medical profile with consent validation
    // AUTH-TC-005, AUTH-TC-006
    // ---------------------------------------------------------------------------
    @Override
    @Transactional
    public MedicalProfileDTO saveOrUpdateProfile(MedicalProfileDTO dto, Integer loggedInUserId) {
        // Consent validation (Decree 13/2023/NĐ-CP Art. 6)
        if (dto.getExplicitConsentSigned() == null || !dto.getExplicitConsentSigned()) {
            throw new BusinessException("AUTH-003", HttpStatus.BAD_REQUEST,
                    "Yêu cầu tích chọn đồng ý xử lý thông tin sức khỏe");
        }

        User user = userRepository.findById(loggedInUserId)
                .orElseThrow(() -> new BusinessException("AUTH-404", HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng: " + loggedInUserId));

        MedicalProfile profile = profileRepository.findByUser_UserId(loggedInUserId)
                .orElseGet(() -> {
                    MedicalProfile p = new MedicalProfile();
                    p.setUser(user);
                    return p;
                });

        // Store as plaintext — @Convert(AESCryptoConverter) encrypts at JPA layer
        profile.setPhysicalConditionEncrypted(dto.getPhysicalConditionPlaintext());
        profile.setFoodAllergiesEncrypted(dto.getFoodAllergiesPlaintext());
        profile.setExplicitConsentSigned(true);
        profile.setUpdatedAt(LocalDateTime.now());

        MedicalProfile saved = profileRepository.save(profile);
        return toFullDto(saved);
    }

    // ---------------------------------------------------------------------------
    // BR-21 — Role-based data filtering
    // AUTH-TC-007
    // ---------------------------------------------------------------------------
    @Override
    @Transactional(readOnly = true)
    public MedicalProfileDTO getForRole(Integer customerId, String requestUserRole) {
        // RECEPTIONIST is explicitly forbidden (BR-21)
        if ("RECEPTIONIST".equalsIgnoreCase(requestUserRole)) {
            throw new BusinessException("AUTH-005", HttpStatus.FORBIDDEN,
                    "Không có quyền xem thông tin này");
        }

        MedicalProfile profile = profileRepository.findByUser_UserId(customerId)
                .orElseThrow(() -> new BusinessException("AUTH-404", HttpStatus.NOT_FOUND,
                        "Không tìm thấy hồ sơ sức khỏe của khách hàng: " + customerId));

        MedicalProfileDTO dto = new MedicalProfileDTO();
        dto.setProfileId(profile.getProfileId());
        dto.setUserId(customerId);
        dto.setExplicitConsentSigned(profile.getExplicitConsentSigned());

        if ("CHEF".equalsIgnoreCase(requestUserRole)) {
            // Chef only gets food allergy info
            dto.setFoodAllergiesPlaintext(profile.getFoodAllergiesEncrypted()); // decrypted by JPA converter
            dto.setPhysicalConditionPlaintext(null); // masked
        } else if ("THERAPIST".equalsIgnoreCase(requestUserRole)) {
            // Therapist only gets physical condition info
            dto.setPhysicalConditionPlaintext(profile.getPhysicalConditionEncrypted()); // decrypted by JPA converter
            dto.setFoodAllergiesPlaintext(null); // masked
        } else {
            // MANAGER, CUSTOMER (own), ADMIN — full access
            dto.setPhysicalConditionPlaintext(profile.getPhysicalConditionEncrypted());
            dto.setFoodAllergiesPlaintext(profile.getFoodAllergiesEncrypted());
        }

        return dto;
    }

    // ---------------------------------------------------------------------------
    // UC05 / BR-20 — Right to Deletion
    // AUTH-TC-008, AUTH-TC-INT-001
    // ---------------------------------------------------------------------------
    @Override
    @Transactional
    public void deleteSensitiveProfile(Integer customerId, Integer requestUserId) {
        // Verify profile exists before wiping
        profileRepository.findByUser_UserId(customerId)
                .orElseThrow(() -> new BusinessException("AUTH-404", HttpStatus.NOT_FOUND,
                        "Không tìm thấy hồ sơ sức khỏe của khách hàng: " + customerId));

        int updated = profileRepository.wipeSensitiveData(customerId);
        if (updated == 0) {
            throw new BusinessException("AUTH-404", HttpStatus.NOT_FOUND,
                    "Không thể xóa dữ liệu nhạy cảm cho khách hàng: " + customerId);
        }
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------
    private MedicalProfileDTO toFullDto(MedicalProfile profile) {
        MedicalProfileDTO dto = new MedicalProfileDTO();
        dto.setProfileId(profile.getProfileId());
        dto.setUserId(profile.getUser() == null ? null : profile.getUser().getUserId());
        dto.setPhysicalConditionPlaintext(profile.getPhysicalConditionEncrypted());
        dto.setFoodAllergiesPlaintext(profile.getFoodAllergiesEncrypted());
        dto.setExplicitConsentSigned(profile.getExplicitConsentSigned());
        return dto;
    }
}
