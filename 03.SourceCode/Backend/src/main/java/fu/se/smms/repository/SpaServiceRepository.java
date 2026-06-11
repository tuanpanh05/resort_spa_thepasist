package fu.se.smms.repository;

import fu.se.smms.entity.SpaService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpaServiceRepository extends JpaRepository<SpaService, Integer> {
    List<SpaService> findByStatus(String status);
    List<SpaService> findByCategory(String category);
}
