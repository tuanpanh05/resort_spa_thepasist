package fu.se.smms.service.impl;

import fu.se.smms.entity.RoomBooking;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * TDD Unit Tests for ItineraryServiceImpl.
 * Covers RESORT-M2-TC-006 (Itinerary stay range validation).
 */
class ItineraryServiceImplTest {

    private RoomBookingRepository roomBookingRepository;
    private ItineraryServiceImpl itineraryService;

    @BeforeEach
    void setUp() {
        roomBookingRepository = mock(RoomBookingRepository.class);
        itineraryService = new ItineraryServiceImpl();
        ReflectionTestUtils.setField(itineraryService, "roomBookingRepository", roomBookingRepository);
    }

    @Test
    @DisplayName("RESORT-M2-TC-006: Allow scheduling activity within the stay range")
    void scheduleActivity_withinStayRange_succeeds() {
        // Arrange
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(303);
        booking.setCheckInDate(LocalDateTime.of(2026, 6, 15, 14, 0));
        booking.setCheckOutDate(LocalDateTime.of(2026, 6, 20, 12, 0));

        when(roomBookingRepository.findById(303)).thenReturn(Optional.of(booking));

        // Act & Assert
        // June 18th is inside stay range
        LocalDateTime activityTime = LocalDateTime.of(2026, 6, 18, 9, 0);
        assertDoesNotThrow(() -> {
            itineraryService.scheduleActivity(303, "YOGA_SESSION", activityTime);
        });
    }

    @Test
    @DisplayName("RESORT-M2-TC-006: Reject scheduling activity outside the stay range")
    void scheduleActivity_outsideStayRange_throwsBadRequest() {
        // Arrange
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(303);
        booking.setCheckInDate(LocalDateTime.of(2026, 6, 15, 14, 0));
        booking.setCheckOutDate(LocalDateTime.of(2026, 6, 20, 12, 0));

        when(roomBookingRepository.findById(303)).thenReturn(Optional.of(booking));

        // Act & Assert
        // June 21st is outside stay range (Check-out is June 20th)
        LocalDateTime activityTime = LocalDateTime.of(2026, 6, 21, 9, 0);
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            itineraryService.scheduleActivity(303, "YOGA_SESSION", activityTime);
        });

        assertEquals("ITINERARY-001", exception.getCode());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }
}
