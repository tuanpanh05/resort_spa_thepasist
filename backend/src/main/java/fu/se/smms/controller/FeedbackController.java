package fu.se.smms.controller;

import fu.se.smms.dto.FeedbackDTO;
import fu.se.smms.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for UC23: Submit Review & Rating.
 * Endpoint: /api/feedback
 */
@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * UC23: Submit a review for a checked-out booking.
     * POST /api/feedback/submit
     *
     * Request body: { "bookingId": 1, "userId": 5, "rating": 5, "comment": "Great
     * service!" }
     */
    @PostMapping("/submit")
    public ResponseEntity<FeedbackDTO> submitFeedback(@RequestBody Map<String, Object> request) {
        Integer bookingId = (Integer) request.get("bookingId");
        Integer userId = (Integer) request.get("userId");
        Integer rating = (Integer) request.get("rating");
        String comment = (String) request.get("comment");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.submitFeedback(bookingId, userId, rating, comment));
    }

    /**
     * Get feedback for a specific booking.
     * GET /api/feedback/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<FeedbackDTO> getFeedbackByBooking(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByBookingId(bookingId));
    }

    /**
     * Get all feedbacks for a specific user.
     * GET /api/feedback/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByUserId(userId));
    }

    /**
     * Manager: Get all feedbacks (with optional toxic filter).
     * GET /api/feedback/all?includeToxic=true
     */
    @GetMapping("/all")
    public ResponseEntity<List<FeedbackDTO>> getAllFeedbacks(
            @RequestParam(defaultValue = "false") boolean includeToxic) {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks(includeToxic));
    }

    /**
     * Manager: Mark a feedback as toxic or restore it.
     * PATCH /api/feedback/{feedbackId}/toxicity?isToxic=true
     */
    @PatchMapping("/{feedbackId}/toxicity")
    public ResponseEntity<FeedbackDTO> markFeedbackToxic(
            @PathVariable Integer feedbackId,
            @RequestParam boolean isToxic) {
        return ResponseEntity.ok(feedbackService.markFeedbackToxic(feedbackId, isToxic));
    }
}
