package fu.se.smms.repository;

import fu.se.smms.entity.FoodOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodOrderDetailRepository extends JpaRepository<FoodOrderDetail, Integer> {
    List<FoodOrderDetail> findByFoodOrder_OrderId(Integer orderId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM FoodOrderDetail d WHERE d.foodMenu.foodId = :foodId")
    void deleteByFoodMenuId(Integer foodId);
}
