package fu.se.smms.repository;

import fu.se.smms.entity.TreatmentRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TreatmentRoomRepository extends JpaRepository<TreatmentRoom, Integer> {
    Optional<TreatmentRoom> findByRoomName(String roomName);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT tr FROM TreatmentRoom tr WHERE tr.treatmentRoomId = :roomId")
    Optional<TreatmentRoom> findByIdForUpdate(@org.springframework.data.repository.query.Param("roomId") Integer roomId);
}
