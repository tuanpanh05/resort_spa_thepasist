package fu.se.smms.service;

import fu.se.smms.dto.MedicalProfileDTO;

/**
 * IMedicalProfileService — Interface for managing sensitive health profile data.
 * Covers UC02, UC05, BR-20, BR-21 from Module 1 spec.
 * @version 1.0
 */
public interface MedicalProfileService {

    /**
     * UC02 — Save or update a customer's medical profile.
     * Requires explicit consent (explicit_consent_signed = true). Throws AUTH-003 if missing.
     * Encryption is handled transparently by JPA converter (ADR-AUTH-001).
     *
     * @throws fu.se.smms.exception.BusinessException AUTH-003 if consent is not signed.
     * @throws fu.se.smms.exception.BusinessException AUTH-404 if user not found.
     */
    MedicalProfileDTO saveOrUpdateProfile(MedicalProfileDTO dto, Integer loggedInUserId);

    /**
     * BR-21 — Get medical profile data filtered by the caller's role.
     * THERAPIST: gets physicalConditionPlaintext, foodAllergiesPlaintext is null.
     * CHEF: gets foodAllergiesPlaintext, physicalConditionPlaintext is null.
     * MANAGER/CUSTOMER(own): gets all fields.
     * RECEPTIONIST: AUTH-005 Forbidden.
     *
     * @throws fu.se.smms.exception.BusinessException AUTH-005 if role has no permission.
     * @throws fu.se.smms.exception.BusinessException AUTH-404 if profile not found.
     */
    MedicalProfileDTO getForRole(Integer customerId, String requestUserRole);

    /**
     * UC05 / BR-20 — Immediately wipe sensitive health data for a customer.
     * Sets physical_condition_encrypted and food_allergies_encrypted to NULL.
     *
     * @throws fu.se.smms.exception.BusinessException AUTH-404 if profile not found.
     */
    void deleteSensitiveProfile(Integer customerId, Integer requestUserId);
}
