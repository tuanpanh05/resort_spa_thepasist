package fu.se.smms.controller;

import fu.se.smms.dto.MealPreselectionDTO;
import fu.se.smms.service.GuestMealService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/guest")
public class GuestMealController {

    private final GuestMealService guestMealService;

    public GuestMealController(GuestMealService guestMealService) {
        this.guestMealService = guestMealService;
    }

    /**
     * Retrieve guest details, active booking, and health profile status.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getGuestProfile(@RequestParam String email) {
        try {
            return ResponseEntity.ok(guestMealService.getGuestProfile(email));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    /**
     * Guest signs explicit consent for personal sensitive data processing.
     */
    @PostMapping("/consent")
    public ResponseEntity<?> updateConsent(@RequestParam Integer userId, @RequestParam Boolean consent) {
        try {
            return ResponseEntity.ok(guestMealService.updateConsent(userId, consent));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    /**
     * Retrieve food menu with automatic warning indicator flags based on the user's allergy profile.
     */
    @GetMapping("/menu")
    public ResponseEntity<?> getFilteredMenu(@RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(guestMealService.getFilteredMenu(userId));
    }

    /**
     * Submit daily meal selections. Checks package food limits to apply pricing.
     */
    @PostMapping("/preselect-meals")
    public ResponseEntity<?> preselectMeals(@RequestBody MealPreselectionDTO dto) {
        try {
            return ResponseEntity.ok(guestMealService.preselectMeals(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Chef role specific endpoint (Data Minimization compliance - UC20 / RBAC)
     */
    @GetMapping("/chef/allergies")
    public ResponseEntity<?> getChefAllergies() {
        return ResponseEntity.ok(guestMealService.getChefAllergies());
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    @PostMapping("/order-extra")
    public ResponseEntity<?> orderExtra(@RequestBody MealPreselectionDTO dto) {
        try {
            return ResponseEntity.ok(guestMealService.orderExtra(dto));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelFoodOrder(@PathVariable Integer orderId,
                                             @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            return ResponseEntity.ok(guestMealService.cancelFoodOrder(orderId, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
