package fu.se.smms.service;

import fu.se.smms.dto.MedicalProfileDTO;

public interface MedicalProfileService {
    MedicalProfileDTO getMedicalProfileByUserId(Integer userId, String currentActorEmail, String currentActorRole);
    MedicalProfileDTO getMyMedicalProfile(String currentActorEmail);
    MedicalProfileDTO createOrUpdateMedicalProfile(String currentActorEmail, MedicalProfileDTO dto);

    /**
     * UC05 – Right to Deletion.
     * Permanently hard-deletes the medical profile of the requesting user.
     * Compliant with Decree 356/2025/ND-CP on personal data protection.
     */
    void deleteMedicalProfile(String currentActorEmail);
}
