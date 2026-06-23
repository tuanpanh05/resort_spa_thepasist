package fu.se.smms.dto;

import java.time.LocalDateTime;

public class AutoMatchResponseDTO {

    private Integer therapistId;
    private String therapistName;
    private Integer treatmentRoomId;
    private String roomName;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;

    public AutoMatchResponseDTO() {}

    public AutoMatchResponseDTO(Integer therapistId, String therapistName, Integer treatmentRoomId, String roomName, LocalDateTime startDatetime, LocalDateTime endDatetime) {
        this.therapistId = therapistId;
        this.therapistName = therapistName;
        this.treatmentRoomId = treatmentRoomId;
        this.roomName = roomName;
        this.startDatetime = startDatetime;
        this.endDatetime = endDatetime;
    }

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
}
