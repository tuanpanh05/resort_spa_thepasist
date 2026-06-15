package fu.se.smms.service.impl;

import fu.se.smms.entity.RoomBooking;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.RoomBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for managing guest activity itinerary within their stay period.
 * Covers RESORT-M2-TC-006 (Itinerary stay range validation).
 *
 * Business Rules enforced:
 *   ITINERARY-001: Activities cannot be scheduled outside the booking check-in/check-out window.
 */
@Service
public class ItineraryServiceImpl {

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    /**
     * Schedule a guest activity within their booking stay window.
     *
     * @param bookingId    The booking ID.
     * @param activityType The type of activity (e.g. "YOGA_SESSION", "SPA_BOOKING").
     * @param activityTime The date/time of the activity.
     * @throws BusinessException ITINERARY-001 if activityTime is outside the stay range.
     */
    @Transactional
    public void scheduleActivity(Integer bookingId, String activityType, LocalDateTime activityTime) {
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(
                        "ITINERARY-000", HttpStatus.NOT_FOUND,
                        "Không tìm thấy đặt phòng với ID: " + bookingId));

        LocalDateTime checkIn  = booking.getCheckInDate();
        LocalDateTime checkOut = booking.getCheckOutDate();

        // Validate activity falls within the stay window [checkIn, checkOut)
        if (activityTime.isBefore(checkIn) || !activityTime.isBefore(checkOut)) {
            throw new BusinessException(
                    "ITINERARY-001", HttpStatus.BAD_REQUEST,
                    String.format("Hoạt động '%s' phải được lên lịch trong khoảng thời gian lưu trú (%s → %s).",
                            activityType, checkIn, checkOut));
        }

        // In a real implementation, save the activity to an itinerary table here.
        // For now this is a validation-only stub as the itinerary table is not yet in the schema.
    }
}
