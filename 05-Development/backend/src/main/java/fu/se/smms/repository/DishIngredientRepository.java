package fu.se.smms.repository;

import fu.se.smms.entity.DishIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishIngredientRepository extends JpaRepository<DishIngredient, Integer> {
    List<DishIngredient> findByFoodMenu_FoodId(Integer foodId);
    void deleteByFoodMenu_FoodId(Integer foodId);
}
