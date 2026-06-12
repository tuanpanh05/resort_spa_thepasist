package fu.se.smms.entity;

import fu.se.smms.config.AesEncryptor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_profile")
public class MedicalProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Integer profileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "physical_condition_encrypted", columnDefinition = "VARCHAR(MAX)")
    @Convert(converter = AesEncryptor.class)
    private String physicalConditionEncrypted;

    @Column(name = "food_allergies_encrypted", columnDefinition = "VARCHAR(MAX)")
    @Convert(converter = AesEncryptor.class)
    private String foodAllergiesEncrypted;

    @Column(name = "explicit_consent_signed", nullable = false)
    private Boolean explicitConsentSigned;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public MedicalProfile() {}

    public MedicalProfile(Integer profileId, User user, String physicalConditionEncrypted, String foodAllergiesEncrypted, Boolean explicitConsentSigned, LocalDateTime updatedAt) {
        this.profileId = profileId;
        this.user = user;
        this.physicalConditionEncrypted = physicalConditionEncrypted;
        this.foodAllergiesEncrypted = foodAllergiesEncrypted;
        this.explicitConsentSigned = explicitConsentSigned;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Integer profileId;
        private User user;
        private String physicalConditionEncrypted;
        private String foodAllergiesEncrypted;
        private Boolean explicitConsentSigned;
        private LocalDateTime updatedAt;

        public Builder profileId(Integer profileId) {
            this.profileId = profileId;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder physicalConditionEncrypted(String physicalConditionEncrypted) {
            this.physicalConditionEncrypted = physicalConditionEncrypted;
            return this;
        }

        public Builder foodAllergiesEncrypted(String foodAllergiesEncrypted) {
            this.foodAllergiesEncrypted = foodAllergiesEncrypted;
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

        public MedicalProfile build() {
            return new MedicalProfile(profileId, user, physicalConditionEncrypted, foodAllergiesEncrypted, explicitConsentSigned, updatedAt);
        }
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (explicitConsentSigned == null) {
            explicitConsentSigned = false;
        }
    }

    // Getters and Setters
    public Integer getProfileId() {
        return profileId;
    }

    public void setProfileId(Integer profileId) {
        this.profileId = profileId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPhysicalConditionEncrypted() {
        return physicalConditionEncrypted;
    }

    public void setPhysicalConditionEncrypted(String physicalConditionEncrypted) {
        this.physicalConditionEncrypted = physicalConditionEncrypted;
    }

    public String getFoodAllergiesEncrypted() {
        return foodAllergiesEncrypted;
    }

    public void setFoodAllergiesEncrypted(String foodAllergiesEncrypted) {
        this.foodAllergiesEncrypted = foodAllergiesEncrypted;
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
