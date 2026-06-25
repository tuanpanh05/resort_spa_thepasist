package fu.se.smms.repository;

import fu.se.smms.entity.BookingDiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingDietRepository extends JpaRepository<BookingDiet, Integer> {
    List<BookingDiet> findByRoomBooking_BookingId(Integer bookingId);
}
