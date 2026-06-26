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
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện tác vụ này.");
        }

        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "Không tìm thấy người dùng hiện tại."));

        Integer targetUserId = guestUserId;
        if (targetUserId == null) {
            targetUserId = currentUser.getUserId();
        } else {
            // Receptionist or Staff is booking on behalf of guest
            String role = currentUser.getRole();
            if (!"RECEPTIONIST".equalsIgnoreCase(role) && !"STAFF".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role)) {
                throw new BusinessException("AUTH-403", HttpStatus.FORBIDDEN, "Bạn không có quyền đăng ký lịch hẹn cho người dùng khác.");
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
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện tác vụ này.");
        }

        User therapist = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản kỹ thuật viên."));

        if (!"THERAPIST".equalsIgnoreCase(therapist.getRole())) {
            throw new BusinessException("AUTH-403", HttpStatus.FORBIDDEN, "Chỉ kỹ thuật viên trị liệu mới có quyền xem lịch làm việc này.");
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
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện tác vụ này.");
        }

        User therapist = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản kỹ thuật viên."));

        if (!"THERAPIST".equalsIgnoreCase(therapist.getRole())) {
            throw new BusinessException("AUTH-403", HttpStatus.FORBIDDEN, "Chỉ kỹ thuật viên trị liệu mới có quyền xem lịch làm việc này.");
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
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện tác vụ này.");
        }

        User therapist = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản kỹ thuật viên."));

        if (!"THERAPIST".equalsIgnoreCase(therapist.getRole())) {
            throw new BusinessException("AUTH-403", HttpStatus.FORBIDDEN, "Chỉ kỹ thuật viên trị liệu mới có quyền cập nhật trạng thái lịch hẹn.");
        }

        SpaBookingResponseDTO response = spaBookingService.updateSessionStatus(
                spaBookingId,
                status,
                therapist.getUserId()
        );
        return ResponseEntity.ok(response);
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
