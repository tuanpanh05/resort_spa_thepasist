package fu.se.smms.service.impl;

import fu.se.smms.dto.FeedbackDTO;
import fu.se.smms.entity.Feedback;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.FeedbackRepository;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of FeedbackService.
 * Enforces UC23 business rules:
 * - BR-18: Only CHECKED_OUT bookings can submit feedback
 * - BR-19: One review per booking (enforced at DB level via unique query)
 */
@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final UserRepository userRepository;

    public FeedbackServiceImpl(FeedbackRepository feedbackRepository,
                               RoomBookingRepository roomBookingRepository,
                               UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public FeedbackDTO submitFeedback(Integer bookingId, Integer userId, Integer rating, String comment) {
        // Validate rating range (1-5)
        if (rating == null || rating < 1 || rating > 5) {
            throw new BusinessException("PAY-400", HttpStatus.BAD_REQUEST,
                    "Đánh giá phải từ 1 đến 5 sao.");
        }

        // Find booking and validate ownership
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException("PAY-404", HttpStatus.NOT_FOUND,
                        "Không tìm thấy đặt phòng với ID: " + bookingId));

        // BR-18: Only CHECKED_OUT bookings can submit feedback
        if (!"CHECKED_OUT".equals(booking.getStatus())) {
            throw new BusinessException("PAY-409", HttpStatus.CONFLICT,
                    "Chỉ có thể gửi đánh giá sau khi đã hoàn tất thủ tục trả phòng (CHECKED_OUT). " +
                    "Trạng thái đặt phòng hiện tại: " + booking.getStatus());
        }

        // Validate user owns this booking
        if (!userId.equals(booking.getUser().getUserId())) {
            throw new BusinessException("PAY-403", HttpStatus.FORBIDDEN,
                    "Bạn không có quyền đánh giá đặt phòng này.");
        }

        // BR-19: Only one review per booking
        if (feedbackRepository.existsByRoomBooking_BookingId(bookingId)) {
            throw new BusinessException("PAY-409", HttpStatus.CONFLICT,
                    "Đặt phòng này đã có đánh giá. Mỗi lượt đặt phòng chỉ được gửi một đánh giá duy nhất.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("PAY-404", HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng: " + userId));

        // Basic toxicity check (simple keyword filter - in production use NLP service)
        boolean isToxic = detectToxicity(comment);

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setRoomBooking(booking);
        feedback.setRating(rating);
        feedback.setComment(comment);
        feedback.setIsToxic(isToxic);

        return toDto(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackDTO getFeedbackByBookingId(Integer bookingId) {
        return feedbackRepository.findByRoomBooking_BookingId(bookingId)
                .map(this::toDto)
                .orElseThrow(() -> new BusinessException("PAY-404", HttpStatus.NOT_FOUND,
                        "Chưa có đánh giá cho đặt phòng: " + bookingId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksByUserId(Integer userId) {
        return feedbackRepository.findByUser_UserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDTO> getAllFeedbacks(boolean includeToxic) {
        if (includeToxic) {
            return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }
        return feedbackRepository.findByIsToxicFalseOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeedbackDTO markFeedbackToxic(Integer feedbackId, boolean isToxic) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new BusinessException("PAY-404", HttpStatus.NOT_FOUND,
                        "Không tìm thấy đánh giá: " + feedbackId));
        feedback.setIsToxic(isToxic);
        return toDto(feedbackRepository.save(feedback));
    }

    private FeedbackDTO toDto(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setFeedbackId(feedback.getFeedbackId());
        dto.setUserId(feedback.getUser() == null ? null : feedback.getUser().getUserId());
        dto.setUserFullName(feedback.getUser() == null ? null : feedback.getUser().getFullName());
        dto.setBookingId(feedback.getRoomBooking() == null ? null : feedback.getRoomBooking().getBookingId());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setIsToxic(feedback.getIsToxic());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }

    /**
     * Simple toxicity heuristic - flags keywords.
     * In production, replace with an NLP/AI content moderation service.
     */
    private boolean detectToxicity(String comment) {
        if (comment == null || comment.isBlank()) {
            return false;
        }
        // Basic blacklist (expand as needed)
        String[] toxicKeywords = { "chửi", "tệ hại", "lừa đảo", "scam", "fake", "tào lao" };
        String lowerComment = comment.toLowerCase();
        for (String keyword : toxicKeywords) {
            if (lowerComment.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}
