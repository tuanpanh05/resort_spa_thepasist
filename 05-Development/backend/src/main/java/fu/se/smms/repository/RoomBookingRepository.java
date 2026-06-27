package fu.se.smms.repository;

import fu.se.smms.entity.Room;
import fu.se.smms.entity.RoomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    @Query("SELECT rb FROM RoomBooking rb WHERE rb.user.userId = :userId AND rb.status IN ('CONFIRMED', 'CHECKED_IN') ORDER BY rb.checkInDate ASC")
    List<RoomBooking> findActiveBookingsByUserId(@Param("userId") Integer userId);

    @Query(value = "SELECT r.room_number FROM room_booking rb " +
            "JOIN room_booking_detail rbd ON rb.booking_id = rbd.booking_id " +
            "JOIN room r ON rbd.room_id = r.room_id " +
            "WHERE rb.user_id = :userId AND rb.status IN ('CONFIRMED', 'CHECKED_IN')", nativeQuery = true)
    List<String> findActiveRoomNumbersByUserId(@Param("userId") Integer userId);

    @Query(value = "SELECT r.room_number FROM room_booking_detail rbd " +
            "JOIN room r ON rbd.room_id = r.room_id " +
            "WHERE rbd.booking_id = :bookingId", nativeQuery = true)
    List<String> findRoomNumbersByBookingId(@Param("bookingId") Integer bookingId);

    /**
     * TC-003: Check if a room already has an overlapping confirmed/checked-in booking.
     * Used by BookingServiceImpl to enforce BR-09 (no double-booking).
     */
    @Query(value = """
            SELECT COUNT(rb.booking_id)
            FROM dbo.room_booking rb
            INNER JOIN dbo.room_booking_detail rbd ON rbd.booking_id = rb.booking_id
            WHERE rbd.room_id = :roomId
              AND rb.status IN ('CONFIRMED','CHECKED_IN','PENDING_DEPOSIT')
              AND rb.check_in_date  < :checkOut
              AND rb.check_out_date > :checkIn
            """, nativeQuery = true)
    int countOverlappingBookings(@Param("roomId") Integer roomId,
                                 @Param("checkIn") LocalDateTime checkIn,
                                 @Param("checkOut") LocalDateTime checkOut);

    @Query(value = """
            SELECT COUNT(rb.booking_id)
            FROM dbo.room_booking rb
            INNER JOIN dbo.room_booking_detail rbd ON rbd.booking_id = rb.booking_id
            WHERE rbd.room_id = :roomId
              AND rb.status = 'CONFIRMED'
              AND CAST(rb.check_in_date AS DATE) = CAST(:today AS DATE)
            """, nativeQuery = true)
    int hasConfirmedBookingOnDate(@Param("roomId") Integer roomId, @Param("today") java.time.LocalDate today);

    @Query(value = """
            SELECT TOP 1 u.full_name
            FROM dbo.room_booking rb
            INNER JOIN dbo.room_booking_detail rbd ON rbd.booking_id = rb.booking_id
            INNER JOIN dbo.users u ON u.user_id = rb.user_id
            WHERE rbd.room_id = :roomId
              AND (
                  (rb.status = 'CHECKED_IN') OR
                  (rb.status = 'CONFIRMED' AND CAST(rb.check_in_date AS DATE) = CAST(:today AS DATE))
              )
            ORDER BY rb.check_in_date DESC
            """, nativeQuery = true)
    String findActiveGuestNameByRoomId(@Param("roomId") Integer roomId, @Param("today") java.time.LocalDate today);


    /**
     * UC08: Arrivals Dashboard — Fetch CONFIRMED bookings with check-in date today.
     * Also fetches PENDING_DEPOSIT and CHECKED_IN bookings for a broader arrivals view.
     */
    @Query("SELECT DISTINCT rb FROM RoomBooking rb " +
           "LEFT JOIN FETCH rb.details d " +
           "LEFT JOIN FETCH d.room r " +
           "LEFT JOIN FETCH r.roomType rt " +
           "LEFT JOIN FETCH rb.retreatPackage " +
           "LEFT JOIN FETCH rb.user " +
           "WHERE rb.status IN ('CONFIRMED', 'PENDING_DEPOSIT', 'CHECKED_IN') " +
           "ORDER BY rb.checkInDate ASC")
    List<RoomBooking> findAllActiveBookings();

    /**
     * UC10: Fetch a single booking with all eagerly loaded details for itinerary view.
     */
    @Query("SELECT rb FROM RoomBooking rb " +
           "LEFT JOIN FETCH rb.details d " +
           "LEFT JOIN FETCH d.room r " +
           "LEFT JOIN FETCH r.roomType rt " +
           "LEFT JOIN FETCH rb.retreatPackage " +
           "LEFT JOIN FETCH rb.user " +
           "WHERE rb.bookingId = :bookingId")
    Optional<RoomBooking> findByIdWithFullDetails(@Param("bookingId") Integer bookingId);

    /**
     * Fetch F&B orders and their aggregated dishes associated with a booking for the timeline.
     */
    @Query(value = """
            SELECT 
                o.order_id,
                o.order_time,
                o.status,
                o.total_amount,
                (
                    SELECT STRING_AGG(CAST(m.dish_name + ' (x' + CAST(d.quantity AS VARCHAR) + ')' AS NVARCHAR(MAX)), ', ')
                    FROM dbo.food_order_detail d
                    INNER JOIN dbo.food_menu m ON m.food_id = d.food_id
                    WHERE d.order_id = o.order_id
                ) AS description
            FROM dbo.food_order o
            WHERE o.room_booking_id = :bookingId
            ORDER BY o.order_time ASC
            """, nativeQuery = true)
    List<Object[]> findFoodOrdersForTimeline(@Param("bookingId") Integer bookingId);

    /**
     * Guest Lookup: Find all bookings by matching Email AND Phone number.
     * Used by public /bookings/lookup endpoint for guests without accounts.
     */
    @Query("SELECT DISTINCT rb FROM RoomBooking rb " +
           "LEFT JOIN FETCH rb.details d " +
           "LEFT JOIN FETCH d.room r " +
           "LEFT JOIN FETCH r.roomType rt " +
           "LEFT JOIN FETCH rb.user u " +
           "WHERE u.email = :email AND u.phone = :phone " +
           "ORDER BY rb.checkInDate DESC")
    List<RoomBooking> findByEmailAndPhoneWithFullDetails(@Param("email") String email,
                                                         @Param("phone") String phone);

    @Query("SELECT DISTINCT rb FROM RoomBooking rb " +
           "LEFT JOIN FETCH rb.details d " +
           "LEFT JOIN FETCH d.room r " +
           "LEFT JOIN FETCH r.roomType rt " +
           "LEFT JOIN FETCH rb.user u " +
           "WHERE u.email = :email " +
           "ORDER BY rb.checkInDate DESC")
    List<RoomBooking> findByEmailWithFullDetails(@Param("email") String email);

    /**
     * Overlap check that excludes the booking being updated (avoids self-conflict).
     * Used when guests update their check-in/check-out dates.
     */
    @Query(value = """
            SELECT COUNT(rb.booking_id)
            FROM dbo.room_booking rb
            INNER JOIN dbo.room_booking_detail rbd ON rbd.booking_id = rb.booking_id
            WHERE rbd.room_id = :roomId
              AND rb.booking_id <> :excludeBookingId
              AND rb.status IN ('CONFIRMED','CHECKED_IN','PENDING_DEPOSIT')
              AND rb.check_in_date  < :checkOut
              AND rb.check_out_date > :checkIn
            """, nativeQuery = true)
    int countOverlappingBookingsForUpdate(@Param("roomId") Integer roomId,
                                          @Param("excludeBookingId") Integer excludeBookingId,
                                          @Param("checkIn") LocalDateTime checkIn,
                                          @Param("checkOut") LocalDateTime checkOut);

    List<RoomBooking> findByStatusAndCreatedAtBefore(String status, LocalDateTime threshold);
}

