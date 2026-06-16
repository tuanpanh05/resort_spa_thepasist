package fu.se.smms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "room_types")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_type_id")
    private Integer roomTypeId;

    @Column(name = "type_name", nullable = false, length = 100)
    private String typeName; // e.g., Garden Villa, Hillside Suite, Premium Pool Villa

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "base_price_per_night", precision = 12, scale = 2)
    private BigDecimal basePricePerNight;

    @Column(name = "max_occupancy")
    private Integer maxOccupancy;

    @Column(name = "area_sqm")
    private Integer areaSqm;

    public RoomType() {}

    // Getters and Setters
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
}
