package fu.se.smms.dto;

import java.time.LocalDateTime;

public class MedicalProfileDTO {
    private Integer profileId;
    private Integer userId;
    private String userFullName;
    private String physicalCondition;
    private String foodAllergies;
    private Boolean explicitConsentSigned;
    private LocalDateTime updatedAt;

    public MedicalProfileDTO() {}

    public MedicalProfileDTO(Integer profileId, Integer userId, String userFullName, String physicalCondition, String foodAllergies, Boolean explicitConsentSigned, LocalDateTime updatedAt) {
        this.profileId = profileId;
        this.userId = userId;
        this.userFullName = userFullName;
        this.physicalCondition = physicalCondition;
        this.foodAllergies = foodAllergies;
        this.explicitConsentSigned = explicitConsentSigned;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Integer profileId;
        private Integer userId;
        private String userFullName;
        private String physicalCondition;
        private String foodAllergies;
        private Boolean explicitConsentSigned;
        private LocalDateTime updatedAt;

        public Builder profileId(Integer profileId) {
            this.profileId = profileId;
            return this;
        }

        public Builder userId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public Builder userFullName(String userFullName) {
            this.userFullName = userFullName;
            return this;
        }

        public Builder physicalCondition(String physicalCondition) {
            this.physicalCondition = physicalCondition;
            return this;
        }

        public Builder foodAllergies(String foodAllergies) {
            this.foodAllergies = foodAllergies;
            return this;
        }

        public Builder explicitConsentSigned(Boolean explicitConsentSigned) {
            this.explicitConsentSigned = explicitConsentSigned;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public MedicalProfileDTO build() {
            return new MedicalProfileDTO(profileId, userId, userFullName, physicalCondition, foodAllergies, explicitConsentSigned, updatedAt);
        }
    }

    // Getters and Setters
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

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getPhysicalCondition() {
        return physicalCondition;
    }

    public void setPhysicalCondition(String physicalCondition) {
        this.physicalCondition = physicalCondition;
    }

    public String getFoodAllergies() {
        return foodAllergies;
    }

    public void setFoodAllergies(String foodAllergies) {
        this.foodAllergies = foodAllergies;
    }

    public Boolean getExplicitConsentSigned() {
        return explicitConsentSigned;
    }

    public void setExplicitConsentSigned(Boolean explicitConsentSigned) {
        this.explicitConsentSigned = explicitConsentSigned;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
