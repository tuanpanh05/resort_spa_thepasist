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

    @Query(value = "SELECT r.room_number FROM room_booking rb " +
            "JOIN room_booking_detail rbd ON rb.booking_id = rbd.booking_id " +
            "JOIN room r ON rbd.room_id = r.room_id " +
            "WHERE rb.user_id = :userId AND rb.status IN ('CONFIRMED', 'CHECKED_IN')",
            nativeQuery = true)
    List<String> findActiveRoomNumbersByUserId(@Param("userId") Integer userId);
}
