package fu.se.smms.controller;

import fu.se.smms.dto.*;
import fu.se.smms.entity.*;
import fu.se.smms.repository.*;
import fu.se.smms.service.UserService;
import fu.se.smms.service.GoogleCalendarService;
import fu.se.smms.exception.BusinessException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpaBookingRepository spaBookingRepository;

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    /** GET /users/me — Lấy thông tin tài khoản hiện tại */
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(Principal principal) {
        UserProfileDTO profile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    /** PUT /users/me — Cập nhật thông tin cá nhân */
    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateCurrentUser(
            Principal principal,
            @Valid @RequestBody UserProfileRequest request) {
        UserProfileDTO updated = userService.updateUserProfile(principal.getName(), request);
        return ResponseEntity.ok(updated);
    }

    /** GET /users/me/bookings — Lịch sử đặt phòng của tôi */
    @GetMapping("/me/bookings")
    public ResponseEntity<List<BookingHistoryDTO>> getMyBookings(Principal principal) {
        List<BookingHistoryDTO> bookings = userService.getMyRoomBookings(principal.getName());
        return ResponseEntity.ok(bookings);
    }

    /** GET /users/me/spa-bookings — Lịch hẹn Spa của tôi */
    @GetMapping("/me/spa-bookings")
    public ResponseEntity<List<SpaBookingHistoryDTO>> getMySpaBookings(Principal principal) {
        List<SpaBookingHistoryDTO> spaBookings = userService.getMySpaBookings(principal.getName());
        return ResponseEntity.ok(spaBookings);
    }

    /** POST /users/me/change-password — Đổi mật khẩu */
    @PostMapping("/me/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được cập nhật thành công."));
    }

    /** POST /users/me/sync-calendar — Kích hoạt đồng bộ hóa lịch thủ công */
    @PostMapping("/me/sync-calendar")
    public ResponseEntity<Map<String, String>> syncCalendar(Principal principal) {
        if (principal == null) {
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện tác vụ này.");
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản."));

        if (user.getGoogleCalendarSyncEnabled() == null || !user.getGoogleCalendarSyncEnabled()) {
            throw new BusinessException("CAL-400", HttpStatus.BAD_REQUEST, "Chưa bật tính năng đồng bộ Google Calendar trong Cấu hình Lịch.");
        }

        String calendarId = user.getGoogleCalendarId();
        if (calendarId == null || calendarId.isBlank()) {
            calendarId = user.getEmail(); // Fallback to email
        }

        int syncedCount = 0;
        if ("THERAPIST".equalsIgnoreCase(user.getRole())) {
            // Sync therapist sessions
            List<SpaBooking> sessions = spaBookingRepository.findTherapistSchedule(
                    user.getUserId(), 
                    java.time.LocalDateTime.now().minusMonths(3), 
                    java.time.LocalDateTime.now().plusMonths(3)
            );
            syncedCount = sessions.size();
            for (SpaBooking session : sessions) {
                googleCalendarService.syncBookingToCalendar(user, session);
            }
        } else {
            // Sync guest rooms & spa
            List<RoomBooking> roomBookings = roomBookingRepository.findAllByUserIdWithDetails(user.getUserId());
            List<SpaBooking> spaBookings = spaBookingRepository.findAllByUserIdWithService(user.getUserId());
            syncedCount = roomBookings.size() + spaBookings.size();
            for (RoomBooking rb : roomBookings) {
                googleCalendarService.syncRoomBookingToCalendar(user, rb);
            }
            for (SpaBooking sb : spaBookings) {
                googleCalendarService.syncBookingToCalendar(user, sb);
            }
        }

        String message = String.format("Đồng bộ lịch thành công! Đã cập nhật %d lịch trình lên tài khoản Google Calendar (%s).", syncedCount, calendarId);
        return ResponseEntity.ok(Map.of("message", message, "syncedCount", String.valueOf(syncedCount)));
    }

    /** GET /users/staff — Lấy danh sách nhân sự (để phân công hỗ trợ) */
    @GetMapping("/staff")
    public ResponseEntity<List<UserProfileDTO>> getStaffList() {
        return ResponseEntity.ok(userService.getAllStaffUsers());
    }
}

