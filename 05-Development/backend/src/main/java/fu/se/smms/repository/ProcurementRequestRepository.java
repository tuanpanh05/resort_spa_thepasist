package fu.se.smms.repository;

import fu.se.smms.entity.ProcurementRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcurementRequestRepository extends JpaRepository<ProcurementRequest, Integer> {
    List<ProcurementRequest> findAllByOrderByRequestDateDesc();
}
