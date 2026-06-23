package fu.se.smms.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SpaBookingResponseDTO {

    private Integer spaBookingId;
    private Integer guestId;
    private String guestName;
    private Integer spaServiceId;
    private String serviceName;
    private Integer therapistId;
    private String therapistName;
    private Integer treatmentRoomId;
    private String roomName;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String status;
    private BigDecimal priceAtBooking;
    private Boolean isPackageIncluded;

    public SpaBookingResponseDTO() {}

    public Integer getSpaBookingId() { return spaBookingId; }
    public void setSpaBookingId(Integer spaBookingId) { this.spaBookingId = spaBookingId; }

    public Integer getGuestId() { return guestId; }
    public void setGuestId(Integer guestId) { this.guestId = guestId; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public Integer getSpaServiceId() { return spaServiceId; }
    public void setSpaServiceId(Integer spaServiceId) { this.spaServiceId = spaServiceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Integer getTherapistId() { return therapistId; }
    public void setTherapistId(Integer therapistId) { this.therapistId = therapistId; }

    public String getTherapistName() { return therapistName; }
    public void setTherapistName(String therapistName) { this.therapistName = therapistName; }

    public Integer getTreatmentRoomId() { return treatmentRoomId; }
    public void setTreatmentRoomId(Integer treatmentRoomId) { this.treatmentRoomId = treatmentRoomId; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

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
