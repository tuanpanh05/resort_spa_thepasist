package fu.se.smms.dto;

import java.time.LocalDateTime;

/**
 * One bookable time slot for a spa service on a given day.
 * The backend has already verified a therapist AND a treatment room are free,
 * so the frontend can present it as a one-tap choice and pass the matched
 * resources straight to the schedule call (no second auto-match round-trip).
 */
public class TimeSlotDTO {

    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String label;            // e.g. "09:00"
    private Integer therapistId;
    private String therapistName;
    private Integer treatmentRoomId;
    private String roomName;

    public TimeSlotDTO() {}

    public TimeSlotDTO(LocalDateTime startDatetime, LocalDateTime endDatetime, String label,
                       Integer therapistId, String therapistName,
                       Integer treatmentRoomId, String roomName) {
        this.startDatetime = startDatetime;
        this.endDatetime = endDatetime;
        this.label = label;
        this.therapistId = therapistId;
        this.therapistName = therapistName;
        this.treatmentRoomId = treatmentRoomId;
        this.roomName = roomName;
    }

    public LocalDateTime getStartDatetime() { return startDatetime; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }

    public LocalDateTime getEndDatetime() { return endDatetime; }
    public void setEndDatetime(LocalDateTime endDatetime) { this.endDatetime = endDatetime; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Integer getTherapistId() { return therapistId; }
    public void setTherapistId(Integer therapistId) { this.therapistId = therapistId; }

    public String getTherapistName() { return therapistName; }
    public void setTherapistName(String therapistName) { this.therapistName = therapistName; }

    public Integer getTreatmentRoomId() { return treatmentRoomId; }
    public void setTreatmentRoomId(Integer treatmentRoomId) { this.treatmentRoomId = treatmentRoomId; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
}