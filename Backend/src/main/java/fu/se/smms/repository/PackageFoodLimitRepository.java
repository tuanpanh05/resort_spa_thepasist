package fu.se.smms.repository;

import fu.se.smms.entity.PackageFoodLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PackageFoodLimitRepository extends JpaRepository<PackageFoodLimit, Integer> {
    List<PackageFoodLimit> findByPackageId(Integer packageId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM PackageFoodLimit p WHERE p.foodMenu.foodId = :foodId")
    void deleteByFoodMenuId(Integer foodId);
}
