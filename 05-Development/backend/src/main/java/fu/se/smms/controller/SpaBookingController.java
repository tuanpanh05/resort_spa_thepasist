package fu.se.smms.controller;

import fu.se.smms.dto.*;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.SpaBookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/spa-bookings")
public class SpaBookingController {

    @Autowired
    private SpaBookingService spaBookingService;

    @Autowired
    private UserRepository userRepository;

    /**
     * UC12: Auto-match Therapist & Treatment Room for a proposed slot.
     */
    @PostMapping("/auto-match")
    public ResponseEntity<AutoMatchResponseDTO> autoMatch(
            @Valid @RequestBody AutoMatchRequestDTO request) {
        AutoMatchResponseDTO response = spaBookingService.autoMatch(
                request.getSpaServiceId(),
                request.getStartDatetime()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * UC11 & UC15: Schedule a spa session (package or extra).
     * Accessible by CUSTOMER, RECEPTIONIST, and STAFF roles.
     * If receptionist/staff is booking for a guest, they specify guestUserId.
     */
    @PostMapping("/schedule")
    public ResponseEntity<SpaBookingResponseDTO> scheduleSpaBooking(
            Principal principal,
            @Valid @RequestBody SpaBookingRequestDTO request,
            @RequestParam(value = "guestUserId", required = false) Integer guestUserId) {

        if (principal == null) {
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "BÃ¡ÂºÂ¡n cÃ¡ÂºÂ§n Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p Ã„â€˜Ã¡Â»Æ’ thÃ¡Â»Â±c hiÃ¡Â»â€¡n tÃƒÂ¡c vÃ¡Â»Â¥ nÃƒÂ y.");
        }

        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i."));

        Integer targetUserId = guestUserId;
        if (targetUserId == null) {
            targetUserId = currentUser.getUserId();
        } else {
            // Receptionist or Staff is booking on behalf of guest
            String role = currentUser.getRole();
            if (!"RECEPTIONIST".equalsIgnoreCase(role) && !"STAFF".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role)) {
                throw new BusinessException("AUTH-403", HttpStatus.FORBIDDEN, "BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â»Ân Ã„â€˜Ã„Æ’ng kÃƒÂ½ lÃ¡Â»â€¹ch hÃ¡ÂºÂ¹n cho ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng khÃƒÂ¡c.");
            }
        }

        SpaBookingResponseDTO response = spaBookingService.scheduleSpaBooking(
                targetUserId,
                request,
                currentUser.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * UC13: Get daily therapist schedule with masked health profile data.
     * Accessible by THERAPIST role.
     */
    @GetMapping("/therapist-schedule")
    public ResponseEntity<List<SpecialistSpaAppointmentDTO>> getTherapistSchedule(
            Principal principal,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (principal == null) {
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "BÃ¡ÂºÂ¡n cÃ¡ÂºÂ§n Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p Ã„â€˜Ã¡Â»Æ’ thÃ¡Â»Â±c hiÃ¡Â»â€¡n tÃƒÂ¡c vÃ¡Â»Â¥ nÃƒÂ y.");
        }

        User therapist = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y thÃƒÂ´ng tin tÃƒÂ i khoÃ¡ÂºÂ£n kÃ¡Â»Â¹ thuÃ¡ÂºÂ­t viÃƒÂªn."));

        if (!isSpecialist(therapist.getRole())) {
            throw new BusinessException("AUTH-403", HttpStatus.FORBIDDEN, "ChÃ¡Â»â€° kÃ¡Â»Â¹ thuÃ¡ÂºÂ­t viÃƒÂªn trÃ¡Â»â€¹ liÃ¡Â»â€¡u mÃ¡Â»â€ºi cÃƒÂ³ quyÃ¡Â»Ân xem lÃ¡Â»â€¹ch lÃƒÂ m viÃ¡Â»â€¡c nÃƒÂ y.");
        }

        List<SpecialistSpaAppointmentDTO> schedule = spaBookingService.getTherapistSchedule(therapist.getUserId(), date);
        return ResponseEntity.ok(schedule);
    }

    /**
     * Get therapist schedule over a date range.
     * Accessible by THERAPIST role.
     */
    @GetMapping("/therapist-schedule/range")
    public ResponseEntity<List<SpecialistSpaAppointmentDTO>> getTherapistScheduleRange(
            Principal principal,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        if (principal == null) {
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "BÃ¡ÂºÂ¡n cÃ¡ÂºÂ§n Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p Ã„â€˜Ã¡Â»Æ’ thÃ¡Â»Â±c hiÃ¡Â»â€¡n tÃƒÂ¡c vÃ¡Â»Â¥ nÃƒÂ y.");
        }

        User therapist = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y thÃƒÂ´ng tin tÃƒÂ i khoÃ¡ÂºÂ£n kÃ¡Â»Â¹ thuÃ¡ÂºÂ­t viÃƒÂªn."));

        if (!isSpecialist(therapist.getRole())) {
            throw new BusinessException("AUTH-403", HttpStatus.FORBIDDEN, "ChÃ¡Â»â€° kÃ¡Â»Â¹ thuÃ¡ÂºÂ­t viÃƒÂªn trÃ¡Â»â€¹ liÃ¡Â»â€¡u mÃ¡Â»â€ºi cÃƒÂ³ quyÃ¡Â»Ân xem lÃ¡Â»â€¹ch lÃƒÂ m viÃ¡Â»â€¡c nÃƒÂ y.");
        }

        List<SpecialistSpaAppointmentDTO> schedule = spaBookingService.getTherapistScheduleRange(therapist.getUserId(), start, end);
        return ResponseEntity.ok(schedule);
    }

    /**
     * UC14: Update session status (Scheduled -> In Progress -> Completed/No Show).
     * Accessible by THERAPIST role.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<SpaBookingResponseDTO> updateSessionStatus(
            Principal principal,
            @PathVariable("id") Integer spaBookingId,
            @RequestParam("status") String status) {

        if (principal == null) {
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "BÃ¡ÂºÂ¡n cÃ¡ÂºÂ§n Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p Ã„â€˜Ã¡Â»Æ’ thÃ¡Â»Â±c hiÃ¡Â»â€¡n tÃƒÂ¡c vÃ¡Â»Â¥ nÃƒÂ y.");
        }

        User therapist = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y thÃƒÂ´ng tin tÃƒÂ i khoÃ¡ÂºÂ£n kÃ¡Â»Â¹ thuÃ¡ÂºÂ­t viÃƒÂªn."));

        if (!isSpecialist(therapist.getRole())) {
            throw new BusinessException("AUTH-403", HttpStatus.FORBIDDEN, "ChÃ¡Â»â€° kÃ¡Â»Â¹ thuÃ¡ÂºÂ­t viÃƒÂªn trÃ¡Â»â€¹ liÃ¡Â»â€¡u mÃ¡Â»â€ºi cÃƒÂ³ quyÃ¡Â»Ân cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i lÃ¡Â»â€¹ch hÃ¡ÂºÂ¹n.");
        }

        SpaBookingResponseDTO response = spaBookingService.updateSessionStatus(
                spaBookingId,
                status,
                therapist.getUserId()
        );
        return ResponseEntity.ok(response);
    }
    

    /**
     * Available time slots for a service on a given day (3-step wizard).
     * Each slot already has a free therapist + room reserved by the matcher.
     */
    @GetMapping("/available-slots")
    public ResponseEntity<List<TimeSlotDTO>> getAvailableSlots(
            @RequestParam("spaServiceId") Integer spaServiceId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "guestsCount", required = false) Integer guestsCount) {
        List<TimeSlotDTO> slots = spaBookingService.getAvailableSlots(spaServiceId, date, guestsCount);
        return ResponseEntity.ok(slots);
    }

    private boolean isSpecialist(String role) {
        if (role == null) return false;
        String r = role.toUpperCase();
        return r.equals("THERAPIST") || r.equals("SPA") || r.equals("YOGA")
                || r.equals("PHYSIO") || r.equals("ADMIN") || r.equals("MANAGER");
    }

    /**
     * Cancel a spa session.
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<SpaBookingResponseDTO> cancelSpaBooking(
            Principal principal,
            @PathVariable("id") Integer spaBookingId,
            @RequestBody Map<String, String> request) {

        if (principal == null) {
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện tác vụ này.");
        }

        String reason = request.get("reason");
        SpaBookingResponseDTO response = spaBookingService.cancelSpaBooking(spaBookingId, reason);
        return ResponseEntity.ok(response);
    }
}
