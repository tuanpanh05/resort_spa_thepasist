package fu.se.smms.repository;

import fu.se.smms.entity.FoodMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FoodMenuRepository extends JpaRepository<FoodMenu, Integer> {
    Optional<FoodMenu> findByDishName(String dishName);
}
