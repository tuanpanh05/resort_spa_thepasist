package fu.se.smms.repository;

import fu.se.smms.entity.SpaBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
