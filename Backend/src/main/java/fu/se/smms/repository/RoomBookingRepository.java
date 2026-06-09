package fu.se.smms.repository;

import fu.se.smms.entity.RoomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomBookingRepository extends JpaRepository<RoomBooking, Integer> {
    List<RoomBooking> findByUser_UserId(Integer userId);
    
    @Query("SELECT rb FROM RoomBooking rb WHERE rb.user.userId = :userId AND rb.status IN ('CONFIRMED', 'CHECKED_IN') ORDER BY rb.checkInDate ASC")
    List<RoomBooking> findActiveBookingsByUserId(@Param("userId") Integer userId);
}
