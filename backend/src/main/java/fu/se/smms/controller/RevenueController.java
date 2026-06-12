package fu.se.smms.controller;

import fu.se.smms.dto.RevenueDashboardDTO;
import fu.se.smms.service.RevenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for UC24 (Revenue Dashboard) and UC25 (Occupancy & Utilization Report).
 * Access restricted to MANAGER role.
 * Endpoint: /api/revenue
 */
@RestController
@RequestMapping("/revenue")
public class RevenueController {

    private final RevenueService revenueService;

    public RevenueController(RevenueService revenueService) {
        this.revenueService = revenueService;
    }

    /**
     * UC24: Revenue Dashboard - full breakdown by year (and optional month).
     * GET /api/revenue/dashboard?year=2026
     * GET /api/revenue/dashboard?year=2026&month=6
     *
     * Returns: room_revenue, spa_revenue, food_revenue, tax, grand_total, occupancy_rate,
     *          monthly_breakdown (bar chart data), therapist_utilization.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<RevenueDashboardDTO> getDashboard(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        // Default to current year if not provided
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(revenueService.getRevenueDashboard(year, month));
    }

    /**
     * UC25: Occupancy & Therapist Utilization Report (for Excel export).
     * GET /api/revenue/occupancy-report?year=2026
     * GET /api/revenue/occupancy-report?year=2026&month=6
     *
     * Returns: occupancy_rate, therapist_utilization[] for the given period.
     * The frontend downloads this as an Excel file using the data in the response.
     */
    @GetMapping("/occupancy-report")
    public ResponseEntity<RevenueDashboardDTO> getOccupancyReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(revenueService.getOccupancyReport(year, month));
    }
}
