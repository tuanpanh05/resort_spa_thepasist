package fu.se.smms.repository;

import fu.se.smms.entity.RetreatPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RetreatPackageRepository extends JpaRepository<RetreatPackage, Integer> {

    List<RetreatPackage> findByStatus(String status);
}
