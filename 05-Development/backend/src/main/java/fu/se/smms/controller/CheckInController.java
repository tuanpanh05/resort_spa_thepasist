package fu.se.smms.controller;

import fu.se.smms.dto.ArrivalDTO;
import fu.se.smms.dto.CheckInRequestDTO;
import fu.se.smms.service.impl.CheckInServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for UC08: Check-In & Arrivals Dashboard.
 *
 * Endpoints:
 *   POST /v1/check-in          — Perform guest check-in (Receptionist)
 *   GET  /v1/check-in/arrivals — Get arrivals dashboard data (Receptionist)
 *
 * Authorization: Authenticated users (RECEPTIONIST, ADMIN).
 * Spring Security @EnableMethodSecurity is active — role checking via SecurityConfig.
 */
@RestController
@RequestMapping("/v1/check-in")
public class CheckInController {

    @Autowired
    private CheckInServiceImpl checkInService;

    /**
     * UC08: Perform guest check-in.
     * Validates booking status (CONFIRMED), collects CCCD/Passport per Residence Law 2020,
     * updates booking to CHECKED_IN, and marks rooms as OCCUPIED (BR-13).
     *
     * @param request CheckInRequestDTO containing bookingId, identityDocument, nationality.
     * @return Success message.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> performCheckIn(
            @Valid @RequestBody CheckInRequestDTO request) {
        checkInService.performCheckIn(
                request.getBookingId(),
                request.getIdentityDocument(),
                request.getNationality());
        return ResponseEntity.ok(Map.of(
                "message", "Check-in thành công! Phòng đã được cập nhật trạng thái OCCUPIED.",
                "bookingId", String.valueOf(request.getBookingId())));
    }

    /**
     * UC08: Arrivals Dashboard — Get all active bookings for receptionist view.
     * Returns CONFIRMED, PENDING_DEPOSIT, and CHECKED_IN bookings with guest and room info.
     *
     * @return List of ArrivalDTO objects.
     */
    @GetMapping("/arrivals")
    public ResponseEntity<List<ArrivalDTO>> getArrivals() {
        List<ArrivalDTO> arrivals = checkInService.getArrivals();
        return ResponseEntity.ok(arrivals);
    }
}
