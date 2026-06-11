package fu.se.smms.service.impl;

import fu.se.smms.dto.RevenueDashboardDTO;
import fu.se.smms.dto.RevenueDashboardDTO.MonthlyRevenueItem;
import fu.se.smms.dto.RevenueDashboardDTO.TherapistUtilizationItem;
import fu.se.smms.repository.InvoiceRepository;
import fu.se.smms.service.RevenueService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of RevenueService for UC24 (Revenue Dashboard) and UC25 (Occupancy/Utilization Report).
 * BR-27: Revenue calculation is broken down precisely by department (Room, Spa, F&B).
 */
@Service
public class RevenueServiceImpl implements RevenueService {

    private final InvoiceRepository invoiceRepository;

    // Inject RoomRepository to count total rooms for occupancy rate
    private final fu.se.smms.repository.RoomRepository roomRepository;

    public RevenueServiceImpl(InvoiceRepository invoiceRepository,
                              fu.se.smms.repository.RoomRepository roomRepository) {
        this.invoiceRepository = invoiceRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueDashboardDTO getRevenueDashboard(Integer year, Integer month) {
        RevenueDashboardDTO dto = new RevenueDashboardDTO();
        dto.setYear(year);
        dto.setMonth(month);

        // BR-27: Revenue breakdown by department
        BigDecimal roomRev = nullToZero(invoiceRepository.sumRoomRevenueByPeriod(year, month));
        BigDecimal spaRev  = nullToZero(invoiceRepository.sumSpaRevenueByPeriod(year, month));
        BigDecimal foodRev = nullToZero(invoiceRepository.sumFoodRevenueByPeriod(year, month));
        BigDecimal taxRev  = nullToZero(invoiceRepository.sumTaxRevenueByPeriod(year, month));
        BigDecimal grandTotal = roomRev.add(spaRev).add(foodRev).add(taxRev);

        dto.setTotalRoomRevenue(roomRev);
        dto.setTotalSpaRevenue(spaRev);
        dto.setTotalFoodRevenue(foodRev);
        dto.setTotalTaxRevenue(taxRev);
        dto.setGrandTotalRevenue(grandTotal);

        // Transaction counts
        dto.setTotalInvoicesPaid(invoiceRepository.countPaidInvoicesByPeriod(year, month));
        dto.setTotalBookingsCheckedOut(invoiceRepository.countCheckedOutBookingsByPeriod(year, month));

        // Occupancy rate (UC25)
        long totalRooms = roomRepository.count();
        long occupiedRooms = roomRepository.findAll().stream()
                .filter(r -> "OCCUPIED".equals(r.getStatus()))
                .count();
        dto.setTotalRooms((int) totalRooms);
        dto.setOccupiedRooms((int) occupiedRooms);
        double occupancyRate = totalRooms > 0
                ? Math.round((double) occupiedRooms / totalRooms * 10000.0) / 100.0
                : 0.0;
        dto.setOccupancyRatePercent(occupancyRate);

        // Monthly breakdown for charts (only when viewing full year - month is null)
        if (month == null) {
            dto.setMonthlyBreakdown(buildMonthlyBreakdown(year));
        }

        // Therapist utilization (UC25)
        dto.setTherapistUtilization(buildTherapistUtilization(year, month));

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueDashboardDTO getOccupancyReport(Integer year, Integer month) {
        // Occupancy & Utilization only report (subset of dashboard)
        RevenueDashboardDTO dto = new RevenueDashboardDTO();
        dto.setYear(year);
        dto.setMonth(month);

        long totalRooms = roomRepository.count();
        long occupiedRooms = roomRepository.findAll().stream()
                .filter(r -> "OCCUPIED".equals(r.getStatus()))
                .count();
        dto.setTotalRooms((int) totalRooms);
        dto.setOccupiedRooms((int) occupiedRooms);
        double occupancyRate = totalRooms > 0
                ? Math.round((double) occupiedRooms / totalRooms * 10000.0) / 100.0
                : 0.0;
        dto.setOccupancyRatePercent(occupancyRate);
        dto.setTotalBookingsCheckedOut(invoiceRepository.countCheckedOutBookingsByPeriod(year, month));

        dto.setTherapistUtilization(buildTherapistUtilization(year, month));

        return dto;
    }

    // ─── Private Helper Methods ───────────────────────────────────────────────

    private List<MonthlyRevenueItem> buildMonthlyBreakdown(Integer year) {
        List<Object[]> rawData = invoiceRepository.findMonthlyRevenueBreakdown(year);
        // Build a map keyed by month number (1-12)
        Map<Integer, Object[]> dataByMonth = new HashMap<>();
        for (Object[] row : rawData) {
            int monthNum = ((Number) row[0]).intValue();
            dataByMonth.put(monthNum, row);
        }

        List<MonthlyRevenueItem> breakdown = new ArrayList<>();
        String[] monthNames = {"Tháng 01", "Tháng 02", "Tháng 03", "Tháng 04",
                               "Tháng 05", "Tháng 06", "Tháng 07", "Tháng 08",
                               "Tháng 09", "Tháng 10", "Tháng 11", "Tháng 12"};

        for (int m = 1; m <= 12; m++) {
            MonthlyRevenueItem item = new MonthlyRevenueItem();
            item.setLabel(monthNames[m - 1] + "/" + year);
            if (dataByMonth.containsKey(m)) {
                Object[] row = dataByMonth.get(m);
                item.setRoomRevenue(nullToZero(row[1]));
                item.setSpaRevenue(nullToZero(row[2]));
                item.setFoodRevenue(nullToZero(row[3]));
                item.setTotalRevenue(item.getRoomRevenue().add(item.getSpaRevenue()).add(item.getFoodRevenue()));
            } else {
                item.setRoomRevenue(BigDecimal.ZERO);
                item.setSpaRevenue(BigDecimal.ZERO);
                item.setFoodRevenue(BigDecimal.ZERO);
                item.setTotalRevenue(BigDecimal.ZERO);
            }
            breakdown.add(item);
        }
        return breakdown;
    }

    private List<TherapistUtilizationItem> buildTherapistUtilization(Integer year, Integer month) {
        List<Object[]> sessionData = invoiceRepository.findTherapistSessionSummary(year, month);
        List<Object[]> scheduleData = invoiceRepository.findTherapistScheduledMinutes(year, month);

        // Build schedule map keyed by therapist_id
        Map<Integer, Integer> scheduledMinutesMap = new HashMap<>();
        for (Object[] row : scheduleData) {
            int staffId = ((Number) row[0]).intValue();
            int scheduledMins = row[1] != null ? ((Number) row[1]).intValue() : 0;
            scheduledMinutesMap.put(staffId, scheduledMins);
        }

        List<TherapistUtilizationItem> result = new ArrayList<>();
        for (Object[] row : sessionData) {
            TherapistUtilizationItem item = new TherapistUtilizationItem();
            item.setTherapistId(((Number) row[0]).intValue());
            item.setTherapistName(row[1] != null ? row[1].toString() : "Unknown");
            item.setTotalSessionsCompleted(row[2] != null ? ((Number) row[2]).intValue() : 0);
            item.setTotalMinutesWorked(row[3] != null ? ((Number) row[3]).intValue() : 0);

            int scheduledMins = scheduledMinutesMap.getOrDefault(item.getTherapistId(), 0);
            item.setScheduledMinutes(scheduledMins);

            // Utilization = (actualMinutes / scheduledMinutes) * 100
            double utilization = scheduledMins > 0
                    ? Math.round((double) item.getTotalMinutesWorked() / scheduledMins * 10000.0) / 100.0
                    : 0.0;
            item.setUtilizationPercent(utilization);
            result.add(item);
        }
        return result;
    }

    private BigDecimal nullToZero(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        return new BigDecimal(value.toString()).setScale(2, RoundingMode.HALF_UP);
    }
}
