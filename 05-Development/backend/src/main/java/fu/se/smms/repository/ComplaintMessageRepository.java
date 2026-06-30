package fu.se.smms.repository;

import fu.se.smms.entity.ComplaintMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintMessageRepository extends JpaRepository<ComplaintMessage, Integer> {
    List<ComplaintMessage> findByComplaint_IdOrderByCreatedAtAsc(Integer complaintId);
}
