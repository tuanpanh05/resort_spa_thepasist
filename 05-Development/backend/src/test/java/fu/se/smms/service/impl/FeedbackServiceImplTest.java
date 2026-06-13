package fu.se.smms.service.impl;

import fu.se.smms.dto.FeedbackDTO;
import fu.se.smms.entity.Feedback;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.FeedbackRepository;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FeedbackServiceImpl.
 * Covers UC23: Submit Review & Rating.
 * Tests BR-18 (CHECKED_OUT eligibility) and BR-19 (single review per booking).
 */
class FeedbackServiceImplTest {

    private FeedbackRepository feedbackRepository;
    private RoomBookingRepository roomBookingRepository;
    private UserRepository userRepository;
    private FeedbackServiceImpl service;

    @BeforeEach
    void setUp() {
        feedbackRepository = mock(FeedbackRepository.class);
        roomBookingRepository = mock(RoomBookingRepository.class);
        userRepository = mock(UserRepository.class);
        service = new FeedbackServiceImpl(feedbackRepository, roomBookingRepository, userRepository);
    }

    // ─── Happy Path Tests ─────────────────────────────────────────────────────

    @Test
    @DisplayName("UC23-TC01: Successfully submit feedback after checkout")
    void submitFeedback_checkedOutBooking_returnsCreatedFeedback() {
        // Arrange
        User user = buildUser(5, "Trần Khách Hàng");
        RoomBooking booking = buildBooking(1, user, "CHECKED_OUT");

        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));
        when(feedbackRepository.existsByRoomBooking_BookingId(1)).thenReturn(false);
        when(userRepository.findById(5)).thenReturn(Optional.of(user));
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(inv -> {
            Feedback f = inv.getArgument(0);
            f.setFeedbackId(1);
            f.setCreatedAt(LocalDateTime.now());
            return f;
        });

        // Act
        FeedbackDTO result = service.submitFeedback(1, 5, 5, "Dịch vụ tuyệt vời!");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getFeedbackId());
        assertEquals(5, result.getRating());
        assertEquals("Dịch vụ tuyệt vời!", result.getComment());
        assertEquals(5, result.getUserId());
        assertEquals(1, result.getBookingId());
        assertFalse(result.getIsToxic(), "Clean comment should not be flagged as toxic");
        verify(feedbackRepository).save(any(Feedback.class));
    }

    @Test
    @DisplayName("UC23-TC02: Toxic comment is auto-flagged")
    void submitFeedback_toxicComment_isFlaggedAsToxic() {
        User user = buildUser(5, "Test User");
        RoomBooking booking = buildBooking(1, user, "CHECKED_OUT");

        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));
        when(feedbackRepository.existsByRoomBooking_BookingId(1)).thenReturn(false);
        when(userRepository.findById(5)).thenReturn(Optional.of(user));
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(inv -> {
            Feedback f = inv.getArgument(0);
            f.setFeedbackId(1);
            f.setCreatedAt(LocalDateTime.now());
            return f;
        });

        FeedbackDTO result = service.submitFeedback(1, 5, 1, "Dịch vụ tệ hại và lừa đảo!");

        assertTrue(result.getIsToxic(), "Toxic comment should be flagged");
    }

    // ─── BR-18 Tests (CHECKED_OUT eligibility) ───────────────────────────────

    @Test
    @DisplayName("UC23-TC03 BR-18: Cannot submit feedback if booking is not CHECKED_OUT")
    void submitFeedback_bookingNotCheckedOut_throwsConflict() {
        User user = buildUser(5, "Test User");
        RoomBooking booking = buildBooking(1, user, "CONFIRMED"); // Still checked in

        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.submitFeedback(1, 5, 4, "Some comment"));

        assertEquals("PAY-409", ex.getCode());
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertTrue(ex.getMessage().contains("CHECKED_OUT"));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    @DisplayName("UC23-TC04 BR-18: Cannot submit feedback if booking is CANCELLED")
    void submitFeedback_cancelledBooking_throwsConflict() {
        User user = buildUser(5, "Test User");
        RoomBooking booking = buildBooking(1, user, "CANCELLED");

        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));

        assertThrows(BusinessException.class,
                () -> service.submitFeedback(1, 5, 3, "Comment"));
        verify(feedbackRepository, never()).save(any());
    }

    // ─── BR-19 Tests (Single review per booking) ─────────────────────────────

    @Test
    @DisplayName("UC23-TC05 BR-19: Cannot submit duplicate feedback for same booking")
    void submitFeedback_alreadyExists_throwsConflict() {
        User user = buildUser(5, "Test User");
        RoomBooking booking = buildBooking(1, user, "CHECKED_OUT");

        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));
        when(feedbackRepository.existsByRoomBooking_BookingId(1)).thenReturn(true); // Already submitted

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.submitFeedback(1, 5, 5, "Another review"));

        assertEquals("PAY-409", ex.getCode());
        assertTrue(ex.getMessage().contains("đã có đánh giá"));
        verify(feedbackRepository, never()).save(any());
    }

    // ─── Validation Tests ─────────────────────────────────────────────────────

    @Test
    @DisplayName("UC23-TC06: Rating out of range (< 1) throws BadRequest")
    void submitFeedback_ratingTooLow_throwsBadRequest() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.submitFeedback(1, 5, 0, "Comment"));
        assertEquals("PAY-400", ex.getCode());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    @DisplayName("UC23-TC07: Rating out of range (> 5) throws BadRequest")
    void submitFeedback_ratingTooHigh_throwsBadRequest() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.submitFeedback(1, 5, 6, "Comment"));
        assertEquals("PAY-400", ex.getCode());
    }

    @Test
    @DisplayName("UC23-TC08: Booking not found throws NotFound")
    void submitFeedback_bookingNotFound_throwsNotFound() {
        when(roomBookingRepository.findById(999)).thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.submitFeedback(999, 5, 4, "Comment"));
        assertEquals("PAY-404", ex.getCode());
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    @DisplayName("UC23-TC09: User trying to review someone else's booking throws Forbidden")
    void submitFeedback_wrongUser_throwsForbidden() {
        User owner = buildUser(5, "Owner");
        RoomBooking booking = buildBooking(1, owner, "CHECKED_OUT");

        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));
        when(feedbackRepository.existsByRoomBooking_BookingId(1)).thenReturn(false);

        // User 99 trying to review booking owned by user 5
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.submitFeedback(1, 99, 5, "Fake review"));
        assertEquals("PAY-403", ex.getCode());
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    // ─── Helper Methods ────────────────────────────────────────────────────────

    private User buildUser(Integer userId, String fullName) {
        User user = new User();
        user.setUserId(userId);
        user.setFullName(fullName);
        user.setEmail(fullName.toLowerCase().replace(" ", ".") + "@test.com");
        user.setRole("CUSTOMER");
        return user;
    }

    private RoomBooking buildBooking(Integer bookingId, User user, String status) {
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(bookingId);
        booking.setUser(user);
        booking.setStatus(status);
        return booking;
    }
}
