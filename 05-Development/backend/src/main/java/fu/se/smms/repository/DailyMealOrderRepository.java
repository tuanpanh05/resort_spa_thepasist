package fu.se.smms.repository;

import fu.se.smms.entity.DailyMealOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyMealOrderRepository extends JpaRepository<DailyMealOrder, Integer> {
    List<DailyMealOrder> findByRoomBooking_BookingIdAndServeDateAndMealType(Integer bookingId, LocalDate serveDate, String mealType);
}
