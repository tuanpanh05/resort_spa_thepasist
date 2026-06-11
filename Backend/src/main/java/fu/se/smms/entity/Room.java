package fu.se.smms.entity;

import jakarta.persistence.*;

/**
 * Room entity - Physical room/villa assets.
 * Used for BR-14: After checkout, room status changes to DIRTY (Vacant/Needs Cleaning).
 */
@Entity
@Table(name = "room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Integer roomId;

    @Column(name = "room_type_id", nullable = false)
    private Integer roomTypeId;

    @Column(name = "room_number", nullable = false, unique = true, length = 50)
    private String roomNumber;

    /**
     * AVAILABLE | OCCUPIED | MAINTENANCE | DIRTY
     * After checkout: set to DIRTY (Vacant/Needs Cleaning) per BR-14
     */
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    // === Getters & Setters ===

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    public Integer getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Integer roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
