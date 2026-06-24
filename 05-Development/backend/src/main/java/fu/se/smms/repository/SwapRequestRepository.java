package fu.se.smms.repository;

import fu.se.smms.entity.SwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SwapRequestRepository extends JpaRepository<SwapRequest, Integer> {
}
