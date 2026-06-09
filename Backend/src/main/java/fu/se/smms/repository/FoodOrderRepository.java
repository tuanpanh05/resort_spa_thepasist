package fu.se.smms.repository;

import fu.se.smms.entity.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodOrderRepository extends JpaRepository<FoodOrder, Integer> {
    List<FoodOrder> findByUser_UserId(Integer userId);
    List<FoodOrder> findByRoomBooking_BookingId(Integer bookingId);
}
