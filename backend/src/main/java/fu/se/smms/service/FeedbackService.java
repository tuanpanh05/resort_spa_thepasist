package fu.se.smms.service;

import fu.se.smms.dto.FeedbackDTO;

import java.util.List;

/**
 * Service interface for UC23: Submit Review & Rating.
 * Enforces BR-18 (CHECKED_OUT eligibility) and BR-19 (single review per booking).
 */
public interface FeedbackService {

    /**
     * UC23: Guest submits review after checkout.
     * Business rules enforced:
     * - BR-18: Booking must be in CHECKED_OUT status
     * - BR-19: Only one review per booking allowed
     *
     * @param bookingId   The booking to review
     * @param userId      The authenticated user submitting the review
     * @param rating      1–5 star rating
     * @param comment     Optional text comment
     * @return            The created FeedbackDTO
     */
    FeedbackDTO submitFeedback(Integer bookingId, Integer userId, Integer rating, String comment);

    /**
     * Get feedback for a specific booking.
     * Returns empty Optional if no feedback exists yet.
     */
    FeedbackDTO getFeedbackByBookingId(Integer bookingId);

    /**
     * Get all feedbacks for a specific user.
     */
    List<FeedbackDTO> getFeedbacksByUserId(Integer userId);

    /**
     * Get all feedbacks (Manager view) - filtered to non-toxic only by default.
     */
    List<FeedbackDTO> getAllFeedbacks(boolean includeToxic);

    /**
     * Manager marks a feedback as toxic/inappropriate.
     */
    FeedbackDTO markFeedbackToxic(Integer feedbackId, boolean isToxic);
}
