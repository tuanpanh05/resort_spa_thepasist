package fu.se.smms.dto;

/**
 * DTO for MedicalProfile entity.
 * Fields are purposely kept as plaintext from the API perspective;
 * encryption/decryption happens transparently in the JPA layer.
 * Role-based filtering is applied by the service before returning this DTO.
 */
public class MedicalProfileDTO {
    private Integer profileId;
    private Integer userId;
    /** Plaintext physical condition — null if caller's role is not THERAPIST/MANAGER */
    private String physicalConditionPlaintext;
    /** Plaintext food allergies — null if caller's role is not CHEF/MANAGER */
    private String foodAllergiesPlaintext;
    private Boolean explicitConsentSigned;

    public Integer getProfileId() {
        return profileId;
    }

    public void setProfileId(Integer profileId) {
        this.profileId = profileId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getPhysicalConditionPlaintext() {
        return physicalConditionPlaintext;
    }

    public void setPhysicalConditionPlaintext(String physicalConditionPlaintext) {
        this.physicalConditionPlaintext = physicalConditionPlaintext;
    }

    public String getFoodAllergiesPlaintext() {
        return foodAllergiesPlaintext;
    }

    public void setFoodAllergiesPlaintext(String foodAllergiesPlaintext) {
        this.foodAllergiesPlaintext = foodAllergiesPlaintext;
    }

    public Boolean getExplicitConsentSigned() {
        return explicitConsentSigned;
    }

    public void setExplicitConsentSigned(Boolean explicitConsentSigned) {
        this.explicitConsentSigned = explicitConsentSigned;
    }
}
