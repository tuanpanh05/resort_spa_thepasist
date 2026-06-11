package fu.se.smms.repository;

import fu.se.smms.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for UC23: Submit Review & Rating.
 * Enforces BR-19 (single review per booking) at query level.
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    /** Find feedback by booking - used to enforce BR-19 (one review per booking) */
    Optional<Feedback> findByRoomBooking_BookingId(Integer bookingId);

    /** Check if feedback already exists for a booking */
    boolean existsByRoomBooking_BookingId(Integer bookingId);

    /** Get all feedbacks by user */
    List<Feedback> findByUser_UserId(Integer userId);

    /** Get all feedbacks (for admin/manager review with toxicity info) */
    List<Feedback> findByIsToxicFalseOrderByCreatedAtDesc();

    /** Get all feedbacks ordered by newest first */
    List<Feedback> findAllByOrderByCreatedAtDesc();

    /** Average rating for a room booking */
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.isToxic = false")
    Double findAverageRating();

    /** Count feedbacks per rating score for analytics */
    @Query(value = """
            SELECT rating, COUNT(*) as count
            FROM dbo.feedback
            WHERE is_toxic = 0
            GROUP BY rating
            ORDER BY rating
            """, nativeQuery = true)
    List<Object[]> countByRatingDistribution();
}
