package fu.se.smms.controller;

import fu.se.smms.dto.SpaServiceDTO;
import fu.se.smms.entity.SpaService;
import fu.se.smms.entity.TreatmentRoom;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.SpaServiceRepository;
import fu.se.smms.repository.TreatmentRoomRepository;
import fu.se.smms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

/**
 * Specialist-facing utility endpoints (Module 3).
 * All require an authenticated THERAPIST / SPA / YOGA / PHYSIO account.
 */
@RestController
@RequestMapping("/v1/specialist")
public class SpecialistController {

    @Autowired private TreatmentRoomRepository treatmentRoomRepository;
    @Autowired private SpaServiceRepository spaServiceRepository;
    @Autowired private UserRepository userRepository;

    /** GET /v1/specialist/rooms – list all treatment rooms with current status. */
    @GetMapping("/rooms")
    public ResponseEntity<List<TreatmentRoom>> getTreatmentRooms() {
        return ResponseEntity.ok(treatmentRoomRepository.findAll());
    }

    /**
     * GET /v1/specialist/services?category=SPA|YOGA|PHYSIO
     * Returns active spa services, optionally filtered by category.
     */
    @GetMapping("/services")
    public ResponseEntity<List<SpaServiceDTO>> getServicesByCategory(
            @RequestParam(value = "category", required = false) String category) {
        List<SpaService> services;
        if (category != null && !category.isBlank()) {
            services = spaServiceRepository.findByCategory(category.toUpperCase());
        } else {
            services = spaServiceRepository.findByStatus("ACTIVE");
        }
        List<SpaServiceDTO> dtos = services.stream().map(s -> {
            SpaServiceDTO d = new SpaServiceDTO();
            d.setServiceId(s.getServiceId());
            d.setName(s.getName());
            d.setDescription(s.getDescription());
            d.setCategory(s.getCategory());
            d.setDurationMinutes(s.getDurationMinutes());
            d.setPrice(s.getPrice());
            d.setStatus(s.getStatus());
            return d;
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /v1/specialist/me – returns current specialist profile including specialty.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyProfile(Principal principal) {
        if (principal == null) {
            throw new BusinessException("AUTH-001", HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập.");
        }
        User me = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException("AUTH-002", HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản."));
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("userId", me.getUserId());
        r.put("fullName", me.getFullName());
        r.put("email", me.getEmail());
        r.put("role", me.getRole());
        r.put("specialty", me.getSpecialty());
        r.put("status", me.getStatus());
        return ResponseEntity.ok(r);
    }
}
