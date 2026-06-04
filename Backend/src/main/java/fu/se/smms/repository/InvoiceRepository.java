package fu.se.smms.repository;

import fu.se.smms.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    List<Invoice> findByUser_UserId(Integer userId);
    List<Invoice> findByRoomBooking_BookingId(Integer bookingId);
}
