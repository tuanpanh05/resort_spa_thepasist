package fu.se.smms.repository;

import fu.se.smms.entity.SpaBooking;
import fu.se.smms.entity.User;
import fu.se.smms.entity.TreatmentRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SpaBookingRepository extends JpaRepository<SpaBooking, Integer> {

    /**
     * Fetch all spa bookings for a given user ordered by most recent first.
     * JOIN FETCH the spa service to retrieve service name and category.
     */
    @Query("SELECT sb FROM SpaBooking sb " +
           "JOIN FETCH sb.spaService ss " +
           "WHERE sb.user.userId = :userId " +
           "ORDER BY sb.startDatetime DESC")
    List<SpaBooking> findAllByUserIdWithService(@Param("userId") Integer userId);

    /**
     * UC10: Fetch all spa bookings for a given room booking (for itinerary timeline).
     */
    @Query(value = """
            SELECT sb.* FROM dbo.spa_booking sb
            WHERE sb.room_booking_id = :roomBookingId
            ORDER BY sb.start_datetime ASC
            """, nativeQuery = true)
    List<SpaBooking> findByRoomBookingId(@Param("roomBookingId") Integer roomBookingId);

    @Query("SELECT COUNT(sb) FROM SpaBooking sb " +
           "WHERE sb.therapist.userId = :therapistId " +
           "AND sb.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') " +
           "AND sb.startDatetime < :endDatetime " +
           "AND sb.endDatetime > :startDatetime")
    long countOverlappingTherapistBookings(@Param("therapistId") Integer therapistId,
                                           @Param("startDatetime") LocalDateTime startDatetime,
                                           @Param("endDatetime") LocalDateTime endDatetime);

    @Query("SELECT COUNT(sb) FROM SpaBooking sb " +
           "WHERE sb.therapist.userId = :therapistId " +
           "AND sb.spaBookingId <> :excludeBookingId " +
           "AND sb.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') " +
           "AND sb.startDatetime < :endDatetime " +
           "AND sb.endDatetime > :startDatetime")
    long countOverlappingTherapistBookingsForUpdate(@Param("therapistId") Integer therapistId,
                                                    @Param("excludeBookingId") Integer excludeBookingId,
                                                    @Param("startDatetime") LocalDateTime startDatetime,
                                                    @Param("endDatetime") LocalDateTime endDatetime);

    @Query("SELECT COUNT(sb) FROM SpaBooking sb " +
           "WHERE sb.treatmentRoom.treatmentRoomId = :roomId " +
           "AND sb.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') " +
           "AND sb.startDatetime < :endDatetime " +
           "AND sb.endDatetime > :startDatetime")
    long countOverlappingRoomBookings(@Param("roomId") Integer roomId,
                                      @Param("startDatetime") LocalDateTime startDatetime,
                                      @Param("endDatetime") LocalDateTime endDatetime);

    @Query("SELECT COUNT(sb) FROM SpaBooking sb " +
           "WHERE sb.treatmentRoom.treatmentRoomId = :roomId " +
           "AND sb.spaBookingId <> :excludeBookingId " +
           "AND sb.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') " +
           "AND sb.startDatetime < :endDatetime " +
           "AND sb.endDatetime > :startDatetime")
    long countOverlappingRoomBookingsForUpdate(@Param("roomId") Integer roomId,
                                               @Param("excludeBookingId") Integer excludeBookingId,
                                               @Param("startDatetime") LocalDateTime startDatetime,
                                               @Param("endDatetime") LocalDateTime endDatetime);

    @Query("SELECT u FROM User u WHERE u.role = 'THERAPIST' AND u.status = 'ACTIVE' " +
           "AND NOT EXISTS (" +
           "  SELECT sb FROM SpaBooking sb " +
           "  WHERE sb.therapist.userId = u.userId " +
           "  AND sb.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') " +
           "  AND sb.startDatetime < :endDatetime " +
           "  AND sb.endDatetime > :startDatetime" +
           ")")
    List<User> findAvailableTherapists(@Param("startDatetime") LocalDateTime startDatetime,
                                       @Param("endDatetime") LocalDateTime endDatetime);

    @Query("SELECT tr FROM TreatmentRoom tr WHERE tr.status = 'AVAILABLE' " +
           "AND NOT EXISTS (" +
           "  SELECT sb FROM SpaBooking sb " +
           "  WHERE sb.treatmentRoom.treatmentRoomId = tr.treatmentRoomId " +
           "  AND sb.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') " +
           "  AND sb.startDatetime < :endDatetime " +
           "  AND sb.endDatetime > :startDatetime" +
           ")")
    List<TreatmentRoom> findAvailableRooms(@Param("startDatetime") LocalDateTime startDatetime,
                                           @Param("endDatetime") LocalDateTime endDatetime);

    @Query("SELECT sb FROM SpaBooking sb " +
           "JOIN FETCH sb.user u " +
           "JOIN FETCH sb.spaService ss " +
           "JOIN FETCH sb.treatmentRoom tr " +
           "WHERE sb.therapist.userId = :therapistId " +
           "AND sb.startDatetime >= :start " +
           "AND sb.startDatetime < :end " +
           "ORDER BY sb.startDatetime ASC")
    List<SpaBooking> findTherapistSchedule(@Param("therapistId") Integer therapistId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(sb) FROM SpaBooking sb " +
           "WHERE sb.roomBooking.bookingId = :bookingId " +
           "AND sb.isPackageIncluded = true " +
           "AND sb.status <> 'CANCELLED'")
    long countPackageSessionsBooked(@Param("bookingId") Integer bookingId);

    @Query("SELECT sb FROM SpaBooking sb " +
           "JOIN FETCH sb.user u " +
           "JOIN FETCH sb.spaService ss " +
           "WHERE sb.status = 'CONFIRMED' " +
           "AND sb.startDatetime >= :start " +
           "AND sb.startDatetime <= :end")
    List<SpaBooking> findUpcomingConfirmedBookings(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
