package fu.se.smms.controller;

import fu.se.smms.dto.*;
import fu.se.smms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * UC03 – Admin Account Management Controller.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    /**
     * Get all staff/non-guest accounts for Admin management table.
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDTO>> getAllStaffUsers() {
        return ResponseEntity.ok(userService.getAllStaffUsers());
    }

    /**
     * Create a new staff account with a specific role.
     * POST /api/admin/users
     * Body: { email, password, fullName, phone, idPassport, role }
     */
    @PostMapping("/users")
    public ResponseEntity<?> createStaffAccount(
            @Valid @RequestBody SignUpRequest request,
            @RequestParam(defaultValue = "STAFF") String role) {
        try {
            UserProfileDTO created = userService.createStaffAccount(request, role);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update a user's role and/or status.
     * PUT /api/admin/users/{userId}
     * Body: { role, status }
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUserRoleAndStatus(
            @PathVariable Integer userId,
            @RequestBody AdminUpdateUserRequest request) {
        try {
            UserProfileDTO updated = userService.updateUserRoleAndStatus(
                    userId, request.getRole(), request.getStatus(), request.getSpecialty());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Delete (deactivate) a staff account.
     * DELETE /api/admin/users/{userId}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "Tài khoản đã được xóa thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
