package fu.se.smms.controller;

import fu.se.smms.entity.DailyMealOrder;
import fu.se.smms.service.FoodComboService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/food-combo")
public class FoodComboController {

    private final FoodComboService foodComboService;

    public FoodComboController(FoodComboService foodComboService) {
        this.foodComboService = foodComboService;
    }

    /**
     * Endpoint for the System to auto-generate the daily menu for a specific booking.
     * Can be triggered when a user opens the "Order Food" page for the first time on a given day.
     *
     * @param bookingId The ID of the RoomBooking
     * @param serveDate The date they are eating (e.g., 2026-06-25)
     * @param mealType 'Breakfast', 'Lunch', or 'Dinner'
     * @return List of generated KOT (Kitchen Order Tickets) for the table
     */
    @PostMapping("/generate-menu")
    public ResponseEntity<List<DailyMealOrder>> generateFamilyMenu(
            @RequestParam Integer bookingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate serveDate,
            @RequestParam String mealType) {

        try {
            List<DailyMealOrder> generatedOrders = foodComboService.generateDefaultFamilyMenu(bookingId, serveDate, mealType);
            return ResponseEntity.ok(generatedOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
