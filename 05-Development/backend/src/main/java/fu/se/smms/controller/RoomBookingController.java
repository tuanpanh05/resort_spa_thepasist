package fu.se.smms.controller;

import fu.se.smms.dto.BookingRequestDTO;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.service.RoomBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
public class RoomBookingController {

    private final RoomBookingService roomBookingService;

    public RoomBookingController(RoomBookingService roomBookingService) {
        this.roomBookingService = roomBookingService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO request) {
        try {
            RoomBooking booking = roomBookingService.createBooking(request);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create booking: " + e.getMessage());
        }
    }
}
