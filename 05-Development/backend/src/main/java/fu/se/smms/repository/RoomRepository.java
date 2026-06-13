package fu.se.smms.repository;

import fu.se.smms.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for Room entity.
 * Supports BR-14: After checkout, update room status to DIRTY.
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    /**
     * BR-14: Mark all rooms associated with a booking as DIRTY after checkout.
     * This is called atomically during the checkout transaction.
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
}
