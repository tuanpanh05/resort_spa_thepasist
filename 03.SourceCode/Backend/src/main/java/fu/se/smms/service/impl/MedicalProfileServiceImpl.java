package fu.se.smms.service.impl;

import fu.se.smms.dto.MedicalProfileDTO;
import fu.se.smms.entity.MedicalProfile;
import fu.se.smms.entity.User;
import fu.se.smms.repository.MedicalProfileRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.MedicalProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class MedicalProfileServiceImpl implements MedicalProfileService {

    @Autowired
    private MedicalProfileRepository medicalProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public MedicalProfileDTO getMedicalProfileByUserId(Integer userId, String currentActorEmail, String currentActorRole) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Load the actor
        User actor = userRepository.findByEmail(currentActorEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Access Control Rule 1: GUEST can only query their own profile
        if ("GUEST".equals(currentActorRole) && !actor.getUserId().equals(userId)) {
            throw new RuntimeException("Access Denied: You can only access your own medical profile.");
        }

        // Fetch medical profile
        Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUserUserId(userId);
        if (profileOpt.isEmpty()) {
            return MedicalProfileDTO.builder()
                    .userId(userId)
                    .userFullName(targetUser.getFullName())
                    .explicitConsentSigned(false)
                    .build();
        }

        MedicalProfile profile = profileOpt.get();
        MedicalProfileDTO dto = mapToDTO(profile);

        // Access Control Rule 2: STAFF (Chef/Kitchen/Receptionist) can only view food allergies. Mask physical condition.
        if ("STAFF".equals(currentActorRole)) {
            dto.setPhysicalCondition(null);
        }

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalProfileDTO getMyMedicalProfile(String currentActorEmail) {
        User actor = userRepository.findByEmail(currentActorEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUserUserId(actor.getUserId());
        if (profileOpt.isEmpty()) {
            return MedicalProfileDTO.builder()
                    .userId(actor.getUserId())
                    .userFullName(actor.getFullName())
                    .explicitConsentSigned(false)
                    .build();
        }

        return mapToDTO(profileOpt.get());
    }

    @Override
    public MedicalProfileDTO createOrUpdateMedicalProfile(String currentActorEmail, MedicalProfileDTO dto) {
        User actor = userRepository.findByEmail(currentActorEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Consent Check: must be signed before saving health data
        if (dto.getExplicitConsentSigned() == null || !dto.getExplicitConsentSigned()) {
            throw new RuntimeException("Explicit consent is required to process sensitive health profiles.");
        }

        // Retrieve existing profile or initialize new one
        MedicalProfile profile = medicalProfileRepository.findByUserUserId(actor.getUserId())
                .orElse(MedicalProfile.builder().user(actor).build());

        profile.setPhysicalConditionEncrypted(dto.getPhysicalCondition());
        profile.setFoodAllergiesEncrypted(dto.getFoodAllergies());
        profile.setExplicitConsentSigned(dto.getExplicitConsentSigned());

        MedicalProfile savedProfile = medicalProfileRepository.save(profile);
        return mapToDTO(savedProfile);
    }

    private MedicalProfileDTO mapToDTO(MedicalProfile profile) {
        return MedicalProfileDTO.builder()
                .profileId(profile.getProfileId())
                .userId(profile.getUser().getUserId())
                .userFullName(profile.getUser().getFullName())
                .physicalCondition(profile.getPhysicalConditionEncrypted()) // Automatically decrypted by AesEncryptor
                .foodAllergies(profile.getFoodAllergiesEncrypted())         // Automatically decrypted by AesEncryptor
                .explicitConsentSigned(profile.getExplicitConsentSigned())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    @Override
    public void deleteMedicalProfile(String currentActorEmail) {
        User actor = userRepository.findByEmail(currentActorEmail)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

        medicalProfileRepository.findByUserUserId(actor.getUserId())
                .ifPresentOrElse(
                    profile -> {
                        medicalProfileRepository.delete(profile);
                    },
                    () -> {
                        throw new RuntimeException("Hồ sơ sức khỏe không tồn tại hoặc đã được xóa trước đó.");
                    }
                );
    }
}
