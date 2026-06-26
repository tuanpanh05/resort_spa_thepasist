package fu.se.smms.repository;

import fu.se.smms.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Integer> {
    List<RestaurantTable> findByStatus(String status);
    List<RestaurantTable> findByStatusAndCapacityGreaterThanEqualOrderByCapacityAsc(String status, Integer capacity);
}
