package fu.se.smms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Entity for room_booking_detail – the join table linking a booking to one or more rooms.
 */
@Entity
@Table(name = "room_booking_detail")
public class RoomBookingDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Integer detailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", referencedColumnName = "booking_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private RoomBooking roomBooking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", referencedColumnName = "room_id")
    private Room room;

    @Column(name = "price_at_booking", precision = 12, scale = 2, nullable = false)
    private BigDecimal priceAtBooking;

    public RoomBookingDetail() {}

    public Integer getDetailId() { return detailId; }
    public void setDetailId(Integer detailId) { this.detailId = detailId; }

    public RoomBooking getRoomBooking() { return roomBooking; }
    public void setRoomBooking(RoomBooking roomBooking) { this.roomBooking = roomBooking; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public BigDecimal getPriceAtBooking() { return priceAtBooking; }
    public void setPriceAtBooking(BigDecimal priceAtBooking) { this.priceAtBooking = priceAtBooking; }
}
