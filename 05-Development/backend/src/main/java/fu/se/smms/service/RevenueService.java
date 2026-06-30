package fu.se.smms.service;

import fu.se.smms.dto.RevenueDashboardDTO;

/**
 * Service interface for UC24 (Revenue Dashboard) and UC25 (Export Reports).
 * Access restricted to MANAGER role (enforced at controller layer).
 * BR-27: Revenue must be accurately broken down by department.
 */
public interface RevenueService {

    /**
     * UC24: Generate revenue dashboard for a given period.
     * Includes room, spa, food revenue breakdown + occupancy rate + therapist utilization.
     *
     * @param year  Required year (e.g., 2026)
     * @param month Optional month (1-12). If null, returns full-year aggregate.
     * @return      RevenueDashboardDTO with chart-ready data
     */
    RevenueDashboardDTO getRevenueDashboard(Integer year, Integer month);

    /**
     * UC25: Get data payload for Excel report export.
     * Contains occupancy rate and therapist utilization for the given period.
     * The actual Excel generation is done at the controller layer using Apache POI or similar.
     *
     * @param year  Required year
     * @param month Optional month (1-12 or null for full year)
     * @return      RevenueDashboardDTO with utilization data populated
     */
    RevenueDashboardDTO getOccupancyReport(Integer year, Integer month);

    /**
     * Generate AI-assisted or statistical revenue forecast for N future months.
     *
     * @param months Number of future months to forecast
     * @return       RevenueForecastDTO with predicted values and AI insights
     */
    fu.se.smms.dto.RevenueForecastDTO getRevenueForecast(Integer months);
}

