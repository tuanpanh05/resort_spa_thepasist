package fu.se.smms.repository;

import fu.se.smms.entity.Room;
import fu.se.smms.entity.RoomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RoomBookingRepository extends JpaRepository<RoomBooking, Integer> {

    /**
     * Fetch all bookings for a given user ordered by most recent first.
     */
    @Query("SELECT DISTINCT rb FROM RoomBooking rb " +
           "LEFT JOIN FETCH rb.details d " +
           "LEFT JOIN FETCH d.room r " +
           "LEFT JOIN FETCH r.roomType rt " +
           "LEFT JOIN FETCH rb.retreatPackage " +
           "WHERE rb.user.userId = :userId " +
           "ORDER BY rb.createdAt DESC")
    List<RoomBooking> findAllByUserIdWithDetails(@Param("userId") Integer userId);

    /**
     * TC-003: Check if a room already has an overlapping confirmed/checked-in booking.
     * Used by BookingServiceImpl to enforce BR-09 (no double-booking).
     */
    @Query(value = """
            SELECT CASE WHEN COUNT(rb.booking_id) > 0 THEN 1 ELSE 0 END
            FROM dbo.room_booking rb
            INNER JOIN dbo.room_booking_detail rbd ON rbd.booking_id = rb.booking_id
            WHERE rbd.room_id = :roomId
              AND rb.status IN ('CONFIRMED','CHECKED_IN','PENDING_DEPOSIT')
              AND rb.check_in_date  < :checkOut
              AND rb.check_out_date > :checkIn
            """, nativeQuery = true)
    boolean existsOverlappingBooking(@Param("roomId") Integer roomId,
                                     @Param("checkIn") LocalDateTime checkIn,
                                     @Param("checkOut") LocalDateTime checkOut);
}

