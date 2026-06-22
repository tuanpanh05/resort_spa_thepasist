package fu.se.smms.repository;

import fu.se.smms.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    List<Complaint> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
