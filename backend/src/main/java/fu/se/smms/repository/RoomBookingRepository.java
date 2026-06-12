package fu.se.smms.repository;

import fu.se.smms.entity.RoomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomBookingRepository extends JpaRepository<RoomBooking, Integer> {

    /**
     * Fetch all bookings for a given user ordered by most recent first.
     * Uses JOIN FETCH to load details and room/roomType in a single query (avoid N+1).
     */
    @Query("SELECT DISTINCT rb FROM RoomBooking rb " +
           "LEFT JOIN FETCH rb.details d " +
           "LEFT JOIN FETCH d.room r " +
           "LEFT JOIN FETCH r.roomType rt " +
           "LEFT JOIN FETCH rb.retreatPackage " +
           "WHERE rb.user.userId = :userId " +
           "ORDER BY rb.createdAt DESC")
    List<RoomBooking> findAllByUserIdWithDetails(@Param("userId") Integer userId);
}
