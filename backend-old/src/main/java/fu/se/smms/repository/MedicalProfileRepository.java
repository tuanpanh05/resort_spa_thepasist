package fu.se.smms.repository;

import fu.se.smms.entity.MedicalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface MedicalProfileRepository extends JpaRepository<MedicalProfile, Integer> {
    Optional<MedicalProfile> findByUser_UserId(Integer userId);

    /**
     * AUTH-TC-INT-001 / BR-20:
     * Wipes sensitive data for a given customer to implement Right to Deletion.
     * Sets both encrypted columns to NULL and resets consent flag to false.
     */
    @Modifying
    @Transactional
    @Query("UPDATE MedicalProfile mp SET mp.physicalConditionEncrypted = NULL, " +
           "mp.foodAllergiesEncrypted = NULL, mp.explicitConsentSigned = false " +
           "WHERE mp.user.userId = :userId")
    int wipeSensitiveData(@Param("userId") Integer userId);
}
