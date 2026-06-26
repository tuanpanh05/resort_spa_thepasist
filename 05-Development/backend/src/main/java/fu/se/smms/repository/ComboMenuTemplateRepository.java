package fu.se.smms.repository;

import fu.se.smms.entity.ComboMenuTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboMenuTemplateRepository extends JpaRepository<ComboMenuTemplate, Integer> {
    List<ComboMenuTemplate> findByRetreatPackage_PackageIdAndDayNumberAndMealType(Integer packageId, Integer dayNumber, String mealType);
}
