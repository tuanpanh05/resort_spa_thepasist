package fu.se.smms.controller;

import fu.se.smms.dto.MedicalProfileDTO;
import fu.se.smms.service.MedicalProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/medical-profiles")
public class MedicalProfileController {

    @Autowired
    private MedicalProfileService medicalProfileService;

    @GetMapping("/me")
    public ResponseEntity<MedicalProfileDTO> getMyMedicalProfile(Principal principal) {
        MedicalProfileDTO profile = medicalProfileService.getMyMedicalProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/me")
    public ResponseEntity<?> createOrUpdateMyMedicalProfile(
            Principal principal,
            @Valid @RequestBody MedicalProfileDTO dto) {
        try {
            MedicalProfileDTO updated = medicalProfileService.createOrUpdateMedicalProfile(principal.getName(), dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMedicalProfileByUserId(
            @PathVariable Integer userId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(auth -> auth.startsWith("ROLE_"))
                    .map(auth -> auth.substring(5))
                    .findFirst()
                    .orElse("GUEST");

            MedicalProfileDTO profile = medicalProfileService.getMedicalProfileByUserId(userId, email, role);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    /**
     * UC05 – Right to Deletion.
     * Hard-deletes the authenticated user's health & allergy data permanently.
     * DELETE /api/medical-profiles/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyMedicalProfile(Principal principal) {
        try {
            medicalProfileService.deleteMedicalProfile(principal.getName());
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Hồ sơ sức khỏe của bạn đã được xóa vĩnh viễn khỏi hệ thống theo yêu cầu."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }
}
