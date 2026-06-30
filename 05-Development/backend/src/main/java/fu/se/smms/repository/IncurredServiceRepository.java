package fu.se.smms.repository;

import fu.se.smms.entity.IncurredService;
import fu.se.smms.entity.RoomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncurredServiceRepository extends JpaRepository<IncurredService, Integer> {

    List<IncurredService> findAllByOrderByCreatedAtDesc();

    @Query("SELECT rb FROM RoomBooking rb " +
           "JOIN rb.details d " +
           "JOIN d.room r " +
           "WHERE r.roomNumber = :roomNumber " +
           "AND rb.status IN ('CONFIRMED', 'CHECKED_IN') " +
           "ORDER BY rb.checkInDate DESC")
    List<RoomBooking> findActiveBookingByRoomNumber(@Param("roomNumber") String roomNumber);
}
