package fu.se.smms.repository;

import fu.se.smms.entity.PackageFoodLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PackageFoodLimitRepository extends JpaRepository<PackageFoodLimit, Integer> {
    List<PackageFoodLimit> findByPackageId(Integer packageId);
}
