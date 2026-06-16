package fu.se.smms.controller;

import fu.se.smms.dto.ItineraryDTO;
import fu.se.smms.service.impl.ItineraryServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for UC10: View Booking Details & Itinerary Timeline.
 *
 * Endpoint:
 *   GET /v1/itineraries/{bookingId} — Get aggregated booking details with timeline
 *
 * Authorization: Authenticated users (CUSTOMER for own bookings, RECEPTIONIST for all).
 * ADR-004: Uses Aggregator Pattern to combine Spa + Food data into unified timeline.
 */
@RestController
@RequestMapping("/v1/itineraries")
public class ItineraryController {

    @Autowired
    private ItineraryServiceImpl itineraryService;

    /**
     * UC10: Get complete itinerary for a booking.
     * Returns booking details, room info, package info, and a chronologically-sorted
     * timeline of events (check-in, spa appointments, food orders, check-out).
     *
     * @param bookingId The booking ID.
     * @return ItineraryDTO with all aggregated data.
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<ItineraryDTO> getItinerary(@PathVariable("bookingId") Integer bookingId) {
        ItineraryDTO itinerary = itineraryService.getTimeline(bookingId);
        return ResponseEntity.ok(itinerary);
    }
}
