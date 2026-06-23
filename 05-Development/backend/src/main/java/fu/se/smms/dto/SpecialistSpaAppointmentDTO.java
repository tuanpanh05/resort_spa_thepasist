package fu.se.smms.dto;

import java.time.LocalDateTime;

/**
 * DTO for the specialist dashboard schedule view.
 * Complies with strict data minimization (Nghị định 13/2023/NĐ-CP):
 * - Excludes foodAllergies and financial information.
 * - Only includes physicalCondition if directly relevant to therapy.
 */
public class SpecialistSpaAppointmentDTO {

    private Integer spaBookingId;
    private Integer guestId;
    private String guestName;
    private String serviceName;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String status;
    private String treatmentRoomName;
    private String note; // Physical notes / condition for therapist (e.g. back pain, joint issues)
    private String therapistName;

    public SpecialistSpaAppointmentDTO() {}

    public Integer getSpaBookingId() { return spaBookingId; }
    public void setSpaBookingId(Integer spaBookingId) { this.spaBookingId = spaBookingId; }

    public Integer getGuestId() { return guestId; }
    public void setGuestId(Integer guestId) { this.guestId = guestId; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public LocalDateTime getStartDatetime() { return startDatetime; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }

    public LocalDateTime getEndDatetime() { return endDatetime; }
    public void setEndDatetime(LocalDateTime endDatetime) { this.endDatetime = endDatetime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTreatmentRoomName() { return treatmentRoomName; }
    public void setTreatmentRoomName(String treatmentRoomName) { this.treatmentRoomName = treatmentRoomName; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getTherapistName() { return therapistName; }
    public void setTherapistName(String therapistName) { this.therapistName = therapistName; }
}
