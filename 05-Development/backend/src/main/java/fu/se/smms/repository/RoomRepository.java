package fu.se.smms.repository;

import fu.se.smms.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Room entity.
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    /**
     * BR-14: Mark all rooms associated with a booking as DIRTY after checkout.
     */
    @Modifying
    @Query(value = """
            UPDATE r
            SET r.status = 'DIRTY'
            FROM dbo.room r
            INNER JOIN dbo.room_booking_detail rbd ON rbd.room_id = r.room_id
            WHERE rbd.booking_id = :bookingId
            """, nativeQuery = true)
    int markRoomsAsDirtyAfterCheckout(@Param("bookingId") Integer bookingId);

    /**
     * TC-005 / BR-13: Fetch all rooms linked to a booking (via room_booking_detail).
     * Used by CheckInServiceImpl to update room status to OCCUPIED on check-in.
     */
    @Query(value = """
            SELECT r.* FROM dbo.room r
            INNER JOIN dbo.room_booking_detail rbd ON rbd.room_id = r.room_id
            WHERE rbd.booking_id = :bookingId
            """, nativeQuery = true)
    List<Room> findRoomsByBookingId(@Param("bookingId") Integer bookingId);

    /**
     * UC09: Fetch all rooms with their room type eagerly loaded.
     * Used by VillaController for listing rooms in the Villa Status Dashboard.
     */
    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.roomType ORDER BY r.roomNumber ASC")
    List<Room> findAllWithRoomType();
}


