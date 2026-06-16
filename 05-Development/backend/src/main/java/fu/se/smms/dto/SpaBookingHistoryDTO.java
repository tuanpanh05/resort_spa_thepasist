package fu.se.smms.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for spa booking history displayed on the Customer Profile page.
 */
public class SpaBookingHistoryDTO {

    private Integer spaBookingId;
    private String serviceName;
    private String serviceCategory;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String status;
    private BigDecimal priceAtBooking;
    private Boolean isPackageIncluded;

    public SpaBookingHistoryDTO() {}

    // ---------------------------------------------------------------
    // Builder
    // ---------------------------------------------------------------
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Integer spaBookingId;
        private String serviceName;
        private String serviceCategory;
        private LocalDateTime startDatetime;
        private LocalDateTime endDatetime;
        private String status;
        private BigDecimal priceAtBooking;
        private Boolean isPackageIncluded;

        public Builder spaBookingId(Integer spaBookingId) { this.spaBookingId = spaBookingId; return this; }
        public Builder serviceName(String serviceName) { this.serviceName = serviceName; return this; }
        public Builder serviceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; return this; }
        public Builder startDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; return this; }
        public Builder endDatetime(LocalDateTime endDatetime) { this.endDatetime = endDatetime; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder priceAtBooking(BigDecimal priceAtBooking) { this.priceAtBooking = priceAtBooking; return this; }
        public Builder isPackageIncluded(Boolean isPackageIncluded) { this.isPackageIncluded = isPackageIncluded; return this; }

        public SpaBookingHistoryDTO build() {
            SpaBookingHistoryDTO dto = new SpaBookingHistoryDTO();
            dto.spaBookingId = spaBookingId;
            dto.serviceName = serviceName;
            dto.serviceCategory = serviceCategory;
            dto.startDatetime = startDatetime;
            dto.endDatetime = endDatetime;
            dto.status = status;
            dto.priceAtBooking = priceAtBooking;
            dto.isPackageIncluded = isPackageIncluded;
            return dto;
        }
    }

    // ---------------------------------------------------------------
    // Getters and Setters
    // ---------------------------------------------------------------
    public Integer getSpaBookingId() { return spaBookingId; }
    public void setSpaBookingId(Integer spaBookingId) { this.spaBookingId = spaBookingId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }

    public LocalDateTime getStartDatetime() { return startDatetime; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }

    public LocalDateTime getEndDatetime() { return endDatetime; }
    public void setEndDatetime(LocalDateTime endDatetime) { this.endDatetime = endDatetime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getPriceAtBooking() { return priceAtBooking; }
    public void setPriceAtBooking(BigDecimal priceAtBooking) { this.priceAtBooking = priceAtBooking; }

    public Boolean getIsPackageIncluded() { return isPackageIncluded; }
    public void setIsPackageIncluded(Boolean isPackageIncluded) { this.isPackageIncluded = isPackageIncluded; }
}
