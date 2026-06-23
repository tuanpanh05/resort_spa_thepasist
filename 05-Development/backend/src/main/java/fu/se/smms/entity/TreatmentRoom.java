package fu.se.smms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "treatment_room")
public class TreatmentRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "treatment_room_id")
    private Integer treatmentRoomId;

    @Column(name = "room_name", nullable = false, unique = true, columnDefinition = "NVARCHAR(255)")
    private String roomName;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING

    public TreatmentRoom() {}

    public TreatmentRoom(Integer treatmentRoomId, String roomName, String status) {
        this.treatmentRoomId = treatmentRoomId;
        this.roomName = roomName;
        this.status = status;
    }

    public Integer getTreatmentRoomId() {
        return treatmentRoomId;
    }

    public void setTreatmentRoomId(Integer treatmentRoomId) {
        this.treatmentRoomId = treatmentRoomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
