package fu.se.smms.controller;

import fu.se.smms.dto.*;
import fu.se.smms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
}

