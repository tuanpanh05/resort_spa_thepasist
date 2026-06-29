package fu.se.smms.repository;

import fu.se.smms.entity.AccompanyingGuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for AccompanyingGuest entity.
 */
@Repository
public interface AccompanyingGuestRepository extends JpaRepository<AccompanyingGuest, Integer> {

    /**
     * Find all accompanying guests for a specific booking.
     */
    List<AccompanyingGuest> findByBookingId(Integer bookingId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ag) > 0 FROM AccompanyingGuest ag WHERE ag.identityDocument = :doc AND ag.bookingId <> :bookingId")
    boolean existsByIdentityDocumentAndBookingIdNot(@org.springframework.data.repository.query.Param("doc") String doc, @org.springframework.data.repository.query.Param("bookingId") Integer bookingId);
}
