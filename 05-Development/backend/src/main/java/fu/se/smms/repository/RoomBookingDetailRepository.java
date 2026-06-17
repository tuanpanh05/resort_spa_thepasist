package fu.se.smms.repository;

import fu.se.smms.entity.RoomBookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomBookingDetailRepository extends JpaRepository<RoomBookingDetail, Integer> {
}
