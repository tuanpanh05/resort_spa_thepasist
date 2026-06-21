package fu.se.smms.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class RoomTypeDTO {
    private Integer roomTypeId;

    @NotBlank(message = "Room type name is required")
    private String typeName;

    private String description;
    private BigDecimal basePricePerNight;
    private Integer maxOccupancy;
    private Integer areaSqm;

    public RoomTypeDTO() {}

    public Integer getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(Integer roomTypeId) { this.roomTypeId = roomTypeId; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBasePricePerNight() { return basePricePerNight; }
    public void setBasePricePerNight(BigDecimal basePricePerNight) { this.basePricePerNight = basePricePerNight; }

    public Integer getMaxOccupancy() { return maxOccupancy; }
    public void setMaxOccupancy(Integer maxOccupancy) { this.maxOccupancy = maxOccupancy; }

    public Integer getAreaSqm() { return areaSqm; }
    public void setAreaSqm(Integer areaSqm) { this.areaSqm = areaSqm; }

    private Long availableRoomsCount;
    public Long getAvailableRoomsCount() { return availableRoomsCount; }
    public void setAvailableRoomsCount(Long availableRoomsCount) { this.availableRoomsCount = availableRoomsCount; }
}
