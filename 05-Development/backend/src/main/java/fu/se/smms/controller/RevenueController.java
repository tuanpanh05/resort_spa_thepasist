package fu.se.smms.controller;

import fu.se.smms.dto.RevenueDashboardDTO;
import fu.se.smms.service.RevenueService;
import fu.se.smms.service.ReportExportService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

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
    private final ReportExportService reportExportService;

    public RevenueController(RevenueService revenueService, ReportExportService reportExportService) {
        this.revenueService = revenueService;
        this.reportExportService = reportExportService;
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
     * GET /api/revenue/forecast?months=3
     * Exposes AI-assisted or offline forecasted revenue values and textual analysis.
     */
    @GetMapping("/forecast")
    public ResponseEntity<fu.se.smms.dto.RevenueForecastDTO> getForecast(
            @RequestParam(required = false) Integer months) {
        if (months == null) {
            months = 3;
        }
        return ResponseEntity.ok(revenueService.getRevenueForecast(months));
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

    /**
     * Export revenue report as PDF
     */
    @GetMapping("/export-pdf")
    public void exportPdf(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpServletResponse response) throws Exception {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        RevenueDashboardDTO dto = revenueService.getRevenueDashboard(year, month);
        byte[] pdfBytes = reportExportService.generateRevenueReportPdf(dto);

        String filename = "BaoCaoVanHanh_" + (month != null ? month + "_" : "") + year + ".pdf";
        response.setContentType(MediaType.APPLICATION_PDF_VALUE);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        response.setContentLength(pdfBytes.length);
        response.getOutputStream().write(pdfBytes);
        response.getOutputStream().flush();
    }

    /**
     * Export revenue report as Excel
     */
    @GetMapping("/export-excel")
    public void exportExcel(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpServletResponse response) throws Exception {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        RevenueDashboardDTO dto = revenueService.getRevenueDashboard(year, month);
        byte[] excelBytes = reportExportService.generateRevenueReportExcel(dto);

        String filename = "BaoCaoVanHanh_" + (month != null ? month + "_" : "") + year + ".xlsx";
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        response.setContentLength(excelBytes.length);
        response.getOutputStream().write(excelBytes);
        response.getOutputStream().flush();
    }
}
