package fu.se.smms.repository;

import fu.se.smms.entity.MedicalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalProfileRepository extends JpaRepository<MedicalProfile, Integer> {
    Optional<MedicalProfile> findByUserUserId(Integer userId);
    Optional<MedicalProfile> findByUser_UserId(Integer userId);
    Optional<MedicalProfile> findByUserEmail(String email);
}
