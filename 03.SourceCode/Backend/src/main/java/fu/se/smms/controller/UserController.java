package fu.se.smms.controller;

import fu.se.smms.dto.UserProfileDTO;
import fu.se.smms.dto.UserProfileRequest;
import fu.se.smms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(Principal principal) {
        UserProfileDTO profile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateCurrentUser(
            Principal principal,
            @Valid @RequestBody UserProfileRequest request) {
        UserProfileDTO updated = userService.updateUserProfile(principal.getName(), request);
        return ResponseEntity.ok(updated);
    }
}
