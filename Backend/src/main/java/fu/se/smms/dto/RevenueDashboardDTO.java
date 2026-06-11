package fu.se.smms.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for UC24 & UC25: Revenue Dashboard and Reports.
 * Provides breakdown by room, spa, food revenue, occupancy rate,
 * and therapist utilization summary for the Manager dashboard.
 * BR-27: Revenue must be broken down by department.
 */
public class RevenueDashboardDTO {

    // === Period Info ===
    private Integer year;
    private Integer month; // null = full year view

    // === Revenue Breakdown (BR-27) ===
    private BigDecimal totalRoomRevenue;
    private BigDecimal totalSpaRevenue;
    private BigDecimal totalFoodRevenue;
    private BigDecimal totalTaxRevenue;
    private BigDecimal grandTotalRevenue;

    // === Occupancy Stats (UC25) ===
    private Integer totalRooms;
    private Integer occupiedRooms;
    private Double occupancyRatePercent;

    // === Transaction Counts ===
    private Long totalInvoicesPaid;
    private Long totalBookingsCheckedOut;

    // === Monthly Breakdown (for bar/pie charts) ===
    private List<MonthlyRevenueItem> monthlyBreakdown;

    // === Therapist Utilization (UC25 - therapist efficiency report) ===
    private List<TherapistUtilizationItem> therapistUtilization;

    // ─── Inner classes ───────────────────────────────────────────────────────

    public static class MonthlyRevenueItem {
        private String label; // e.g., "Tháng 01/2026"
        private BigDecimal roomRevenue;
        private BigDecimal spaRevenue;
        private BigDecimal foodRevenue;
        private BigDecimal totalRevenue;

        public MonthlyRevenueItem() {}

        public MonthlyRevenueItem(String label, BigDecimal roomRevenue,
                                   BigDecimal spaRevenue, BigDecimal foodRevenue) {
            this.label = label;
            this.roomRevenue = roomRevenue;
            this.spaRevenue = spaRevenue;
            this.foodRevenue = foodRevenue;
            this.totalRevenue = roomRevenue.add(spaRevenue).add(foodRevenue);
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public BigDecimal getRoomRevenue() { return roomRevenue; }
        public void setRoomRevenue(BigDecimal roomRevenue) { this.roomRevenue = roomRevenue; }
        public BigDecimal getSpaRevenue() { return spaRevenue; }
        public void setSpaRevenue(BigDecimal spaRevenue) { this.spaRevenue = spaRevenue; }
        public BigDecimal getFoodRevenue() { return foodRevenue; }
        public void setFoodRevenue(BigDecimal foodRevenue) { this.foodRevenue = foodRevenue; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    }

    public static class TherapistUtilizationItem {
        private Integer therapistId;
        private String therapistName;
        private Integer totalSessionsCompleted;
        private Integer totalMinutesWorked;
        private Integer scheduledMinutes; // from work_schedule
        private Double utilizationPercent; // (actualMinutes / scheduledMinutes) * 100

        public TherapistUtilizationItem() {}

        public Integer getTherapistId() { return therapistId; }
        public void setTherapistId(Integer therapistId) { this.therapistId = therapistId; }
        public String getTherapistName() { return therapistName; }
        public void setTherapistName(String therapistName) { this.therapistName = therapistName; }
        public Integer getTotalSessionsCompleted() { return totalSessionsCompleted; }
        public void setTotalSessionsCompleted(Integer totalSessionsCompleted) { this.totalSessionsCompleted = totalSessionsCompleted; }
        public Integer getTotalMinutesWorked() { return totalMinutesWorked; }
        public void setTotalMinutesWorked(Integer totalMinutesWorked) { this.totalMinutesWorked = totalMinutesWorked; }
        public Integer getScheduledMinutes() { return scheduledMinutes; }
        public void setScheduledMinutes(Integer scheduledMinutes) { this.scheduledMinutes = scheduledMinutes; }
        public Double getUtilizationPercent() { return utilizationPercent; }
        public void setUtilizationPercent(Double utilizationPercent) { this.utilizationPercent = utilizationPercent; }
    }

    // === Main DTO Getters & Setters ===

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public BigDecimal getTotalRoomRevenue() { return totalRoomRevenue; }
    public void setTotalRoomRevenue(BigDecimal totalRoomRevenue) { this.totalRoomRevenue = totalRoomRevenue; }
    public BigDecimal getTotalSpaRevenue() { return totalSpaRevenue; }
    public void setTotalSpaRevenue(BigDecimal totalSpaRevenue) { this.totalSpaRevenue = totalSpaRevenue; }
    public BigDecimal getTotalFoodRevenue() { return totalFoodRevenue; }
    public void setTotalFoodRevenue(BigDecimal totalFoodRevenue) { this.totalFoodRevenue = totalFoodRevenue; }
    public BigDecimal getTotalTaxRevenue() { return totalTaxRevenue; }
    public void setTotalTaxRevenue(BigDecimal totalTaxRevenue) { this.totalTaxRevenue = totalTaxRevenue; }
    public BigDecimal getGrandTotalRevenue() { return grandTotalRevenue; }
    public void setGrandTotalRevenue(BigDecimal grandTotalRevenue) { this.grandTotalRevenue = grandTotalRevenue; }
    public Integer getTotalRooms() { return totalRooms; }
    public void setTotalRooms(Integer totalRooms) { this.totalRooms = totalRooms; }
    public Integer getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(Integer occupiedRooms) { this.occupiedRooms = occupiedRooms; }
    public Double getOccupancyRatePercent() { return occupancyRatePercent; }
    public void setOccupancyRatePercent(Double occupancyRatePercent) { this.occupancyRatePercent = occupancyRatePercent; }
    public Long getTotalInvoicesPaid() { return totalInvoicesPaid; }
    public void setTotalInvoicesPaid(Long totalInvoicesPaid) { this.totalInvoicesPaid = totalInvoicesPaid; }
    public Long getTotalBookingsCheckedOut() { return totalBookingsCheckedOut; }
    public void setTotalBookingsCheckedOut(Long totalBookingsCheckedOut) { this.totalBookingsCheckedOut = totalBookingsCheckedOut; }
    public List<MonthlyRevenueItem> getMonthlyBreakdown() { return monthlyBreakdown; }
    public void setMonthlyBreakdown(List<MonthlyRevenueItem> monthlyBreakdown) { this.monthlyBreakdown = monthlyBreakdown; }
    public List<TherapistUtilizationItem> getTherapistUtilization() { return therapistUtilization; }
    public void setTherapistUtilization(List<TherapistUtilizationItem> therapistUtilization) { this.therapistUtilization = therapistUtilization; }
}
