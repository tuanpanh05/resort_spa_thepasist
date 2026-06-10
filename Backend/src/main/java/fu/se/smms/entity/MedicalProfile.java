package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
