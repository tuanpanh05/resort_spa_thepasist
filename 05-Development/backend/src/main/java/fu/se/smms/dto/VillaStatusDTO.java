package fu.se.smms.dto;

import java.math.BigDecimal;

/**
 * DTO for UC09 Villa/Room status management.
 * Used for both listing rooms and updating room status.
 */
public class VillaStatusDTO {

    private Integer roomId;
    private String roomNumber;
    private String roomTypeName;
    private String status;
    private Integer capacity;
    private BigDecimal basePrice;
    private String guestName; // Current guest name if OCCUPIED

    public VillaStatusDTO() {}

    // Getters and Setters
    public Integer getRoomId() { return roomId; }
    public void setRoomId(Integer roomId) { this.roomId = roomId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
}
