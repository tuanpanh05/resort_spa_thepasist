package fu.se.smms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_profile")
public class MedicalProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Integer profileId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @Column(name = "physical_condition_encrypted")
    private String physicalConditionEncrypted;
    @Column(name = "food_allergies_encrypted")
    private String foodAllergiesEncrypted;
    @Column(name = "explicit_consent_signed")
    private Boolean explicitConsentSigned;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public MedicalProfile() {}

    public MedicalProfile(Integer profileId, User user, String physicalConditionEncrypted,
                          String foodAllergiesEncrypted, Boolean explicitConsentSigned,
                          LocalDateTime updatedAt) {
        this.profileId = profileId;
        this.user = user;
        this.physicalConditionEncrypted = physicalConditionEncrypted;
        this.foodAllergiesEncrypted = foodAllergiesEncrypted;
        this.explicitConsentSigned = explicitConsentSigned;
        this.updatedAt = updatedAt;
    }

    public Integer getProfileId() { return profileId; }
    public void setProfileId(Integer profileId) { this.profileId = profileId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPhysicalConditionEncrypted() { return physicalConditionEncrypted; }
    public void setPhysicalConditionEncrypted(String physicalConditionEncrypted) {
        this.physicalConditionEncrypted = physicalConditionEncrypted;
    }

    public String getFoodAllergiesEncrypted() { return foodAllergiesEncrypted; }
    public void setFoodAllergiesEncrypted(String foodAllergiesEncrypted) {
        this.foodAllergiesEncrypted = foodAllergiesEncrypted;
    }

    public Boolean getExplicitConsentSigned() { return explicitConsentSigned; }
    public void setExplicitConsentSigned(Boolean explicitConsentSigned) {
        this.explicitConsentSigned = explicitConsentSigned;
    }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

