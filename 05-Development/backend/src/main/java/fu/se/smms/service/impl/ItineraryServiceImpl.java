package fu.se.smms.service.impl;

import fu.se.smms.dto.ItineraryDTO;
import fu.se.smms.entity.*;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.SpaBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Service for managing guest activity itinerary within their stay period.
 * Covers RESORT-M2-TC-006 (Itinerary stay range validation) and
 * UC10 (Aggregator Pattern per ADR-004 — combining Spa + Food data into timeline).
 *
 * Business Rules enforced:
 *   ITINERARY-001: Activities cannot be scheduled outside the booking check-in/check-out window.
 */
@Service
public class ItineraryServiceImpl {

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    @Autowired
    private SpaBookingRepository spaBookingRepository;

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

    /**
     * UC10: Get complete itinerary timeline for a booking.
     * Aggregates booking info, room, package, spa bookings, and food orders
     * into a single DTO with sorted timeline events (ADR-004 Aggregator Pattern).
     *
     * @param bookingId The booking ID to get itinerary for.
     * @return ItineraryDTO with all aggregated timeline data.
     */
    @Transactional(readOnly = true)
    public ItineraryDTO getTimeline(Integer bookingId) {
        RoomBooking booking = roomBookingRepository.findByIdWithFullDetails(bookingId)
                .orElseThrow(() -> new BusinessException(
                        "ITINERARY-000", HttpStatus.NOT_FOUND,
                        "Không tìm thấy đặt phòng với ID: " + bookingId));

        ItineraryDTO dto = new ItineraryDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setBookingStatus(booking.getStatus());
        dto.setTotalDeposit(booking.getTotalDeposit());

        // Guest info
        User guest = booking.getUser();
        if (guest != null) {
            dto.setGuestName(guest.getFullName());
            dto.setGuestEmail(guest.getEmail());
            dto.setGuestPhone(guest.getPhone());
        }

        // Room info (from first detail)
        List<RoomBookingDetail> details = booking.getDetails();
        if (details != null && !details.isEmpty()) {
            Room room = details.get(0).getRoom();
            if (room != null) {
                dto.setRoomNumber(room.getRoomNumber());
                if (room.getRoomType() != null) {
                    dto.setRoomTypeName(room.getRoomType().getTypeName());
                }
            }
        }

        // Package info
        RetreatPackage pkg = booking.getRetreatPackage();
        if (pkg != null) {
            dto.setPackageName(pkg.getName());
            dto.setPackageDescription(pkg.getDescription());
            dto.setPackageDurationDays(pkg.getDurationDays());
        }

        // Build timeline events
        List<ItineraryDTO.TimelineEvent> timeline = new ArrayList<>();

        // Add Check-In event
        ItineraryDTO.TimelineEvent checkInEvent = new ItineraryDTO.TimelineEvent();
        checkInEvent.setType("CHECKIN");
        checkInEvent.setTitle("Nhận phòng (Check-In)");
        checkInEvent.setDescription("Thủ tục nhận phòng tại quầy lễ tân");
        checkInEvent.setStartTime(booking.getCheckInDate());
        checkInEvent.setStatus("CHECKED_IN".equals(booking.getStatus()) ||
                              "CHECKED_OUT".equals(booking.getStatus()) ? "COMPLETED" : "PENDING");
        timeline.add(checkInEvent);

        // Add Spa booking events
        try {
            List<SpaBooking> spaBookings = spaBookingRepository.findByRoomBookingId(bookingId);
            for (SpaBooking spa : spaBookings) {
                ItineraryDTO.TimelineEvent spaEvent = new ItineraryDTO.TimelineEvent();
                spaEvent.setType("SPA");
                spaEvent.setTitle(spa.getSpaService() != null ? spa.getSpaService().getName() : "Dịch vụ Spa");
                spaEvent.setDescription(spa.getSpaService() != null ? spa.getSpaService().getDescription() : "");
                spaEvent.setStartTime(spa.getStartDatetime());
                spaEvent.setEndTime(spa.getEndDatetime());
                spaEvent.setStatus(spa.getStatus());
                spaEvent.setPrice(spa.getPriceAtBooking());
                timeline.add(spaEvent);
            }
        } catch (Exception e) {
            // Spa data not available — continue without it
        }

        // Add Food order events
        try {
            List<Object[]> foodOrders = roomBookingRepository.findFoodOrdersForTimeline(bookingId);
            for (Object[] row : foodOrders) {
                ItineraryDTO.TimelineEvent foodEvent = new ItineraryDTO.TimelineEvent();
                foodEvent.setType("FOOD");
                
                Integer orderId = (Integer) row[0];
                foodEvent.setTitle("Đơn gọi món F&B (Mã: #" + orderId + ")");
                
                Object rawTime = row[1];
                LocalDateTime orderTime = null;
                if (rawTime instanceof LocalDateTime) {
                    orderTime = (LocalDateTime) rawTime;
                } else if (rawTime instanceof java.sql.Timestamp) {
                    orderTime = ((java.sql.Timestamp) rawTime).toLocalDateTime();
                }
                foodEvent.setStartTime(orderTime);
                
                String status = (String) row[2];
                if ("DELIVERED".equals(status) || "READY".equals(status)) {
                    foodEvent.setStatus("COMPLETED");
                } else if ("CANCELLED".equals(status)) {
                    foodEvent.setStatus("CANCELLED");
                } else {
                    foodEvent.setStatus("PENDING");
                }
                
                java.math.BigDecimal totalAmount = (java.math.BigDecimal) row[3];
                foodEvent.setPrice(totalAmount);
                
                String description = (String) row[4];
                foodEvent.setDescription(description != null ? description : "Gọi món tại phòng");
                
                timeline.add(foodEvent);
            }
        } catch (Exception e) {
            // Food data not available — continue without it
        }

        // Add Check-Out event
        ItineraryDTO.TimelineEvent checkOutEvent = new ItineraryDTO.TimelineEvent();
        checkOutEvent.setType("CHECKOUT");
        checkOutEvent.setTitle("Trả phòng (Check-Out)");
        checkOutEvent.setDescription("Thủ tục trả phòng và thanh toán cuối kỳ");
        checkOutEvent.setStartTime(booking.getCheckOutDate());
        checkOutEvent.setStatus("CHECKED_OUT".equals(booking.getStatus()) ? "COMPLETED" : "PENDING");
        timeline.add(checkOutEvent);

        // Sort timeline by startTime
        timeline.sort(Comparator.comparing(ItineraryDTO.TimelineEvent::getStartTime,
                Comparator.nullsLast(Comparator.naturalOrder())));

        dto.setTimeline(timeline);

        return dto;
    }
}
