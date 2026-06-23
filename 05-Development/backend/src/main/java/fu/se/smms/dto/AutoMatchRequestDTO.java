package fu.se.smms.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AutoMatchRequestDTO {

    @NotNull(message = "Vui lòng chọn dịch vụ Spa.")
    private Integer spaServiceId;

    @NotNull(message = "Vui lòng chọn thời gian bắt đầu.")
    private LocalDateTime startDatetime;

    public AutoMatchRequestDTO() {}

    public Integer getSpaServiceId() { return spaServiceId; }
    public void setSpaServiceId(Integer spaServiceId) { this.spaServiceId = spaServiceId; }

    public LocalDateTime getStartDatetime() { return startDatetime; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }
}
