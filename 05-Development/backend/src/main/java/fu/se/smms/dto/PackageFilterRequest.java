package fu.se.smms.dto;

import java.math.BigDecimal;

/**
 * UC6 – Request body/params for filtering retreat packages.
 * All fields are optional; null means "no filter on this field".
 *
 * Supported filters:
 *  - keyword      : Free-text search on name/description
 *  - healthGoal   : YOGA | WEIGHT_LOSS | STRESS_RELIEF | DETOX | GENERAL
 *  - minPrice     : Minimum package price (VND)
 *  - maxPrice     : Maximum package price (VND)
 *  - maxDurationDays : Max number of days in the package
 */
public class PackageFilterRequest {

    private String keyword;
    private String healthGoal;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer maxDurationDays;

    public PackageFilterRequest() {}

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public String getHealthGoal() { return healthGoal; }
    public void setHealthGoal(String healthGoal) { this.healthGoal = healthGoal; }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public Integer getMaxDurationDays() { return maxDurationDays; }
    public void setMaxDurationDays(Integer maxDurationDays) { this.maxDurationDays = maxDurationDays; }
}
