package fu.se.smms.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SpaBookingRequestDTO {

    @NotNull(message = "Vui lòng chọn dịch vụ Spa.")
    private Integer spaServiceId;

    @NotNull(message = "Vui lòng chọn thời gian bắt đầu.")
    private LocalDateTime startDatetime;

    private Integer roomBookingId; // Nullable (if not in package, or for extra service)

    private Integer therapistId; // Nullable (if auto-matched)

    private Integer treatmentRoomId; // Nullable (if auto-matched)

    private Boolean isPackageIncluded = false;

    public SpaBookingRequestDTO() {}

    public Integer getSpaServiceId() { return spaServiceId; }
    public void setSpaServiceId(Integer spaServiceId) { this.spaServiceId = spaServiceId; }

    public LocalDateTime getStartDatetime() { return startDatetime; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }

    public Integer getRoomBookingId() { return roomBookingId; }
    public void setRoomBookingId(Integer roomBookingId) { this.roomBookingId = roomBookingId; }

    public Integer getTherapistId() { return therapistId; }
    public void setTherapistId(Integer therapistId) { this.therapistId = therapistId; }

    public Integer getTreatmentRoomId() { return treatmentRoomId; }
    public void setTreatmentRoomId(Integer treatmentRoomId) { this.treatmentRoomId = treatmentRoomId; }

    public Boolean getIsPackageIncluded() { return isPackageIncluded; }
    public void setIsPackageIncluded(Boolean isPackageIncluded) { this.isPackageIncluded = isPackageIncluded; }
}
