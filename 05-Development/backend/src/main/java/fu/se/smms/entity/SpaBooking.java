package fu.se.smms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity mapping the spa_booking table.
 */
@Entity
@Table(name = "spa_booking")
public class SpaBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "spa_booking_id")
    private Integer spaBookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_booking_id", referencedColumnName = "booking_id")
    private RoomBooking roomBooking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spa_id", referencedColumnName = "service_id")
    private SpaService spaService;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "therapist_id", referencedColumnName = "user_id")
    private User therapist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_room_id", referencedColumnName = "treatment_room_id")
    private TreatmentRoom treatmentRoom;

    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDatetime;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW

    @Column(name = "price_at_booking", precision = 12, scale = 2, nullable = false)
    private BigDecimal priceAtBooking;

    @Column(name = "is_package_included", nullable = false)
    private Boolean isPackageIncluded = false;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "PENDING";
        if (isPackageIncluded == null) isPackageIncluded = false;
    }

    public SpaBooking() {}

    // Getters and Setters
    public Integer getSpaBookingId() { return spaBookingId; }
    public void setSpaBookingId(Integer spaBookingId) { this.spaBookingId = spaBookingId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public RoomBooking getRoomBooking() { return roomBooking; }
    public void setRoomBooking(RoomBooking roomBooking) { this.roomBooking = roomBooking; }

    public SpaService getSpaService() { return spaService; }
    public void setSpaService(SpaService spaService) { this.spaService = spaService; }

    public User getTherapist() { return therapist; }
    public void setTherapist(User therapist) { this.therapist = therapist; }

    public TreatmentRoom getTreatmentRoom() { return treatmentRoom; }
    public void setTreatmentRoom(TreatmentRoom treatmentRoom) { this.treatmentRoom = treatmentRoom; }

    public LocalDateTime getStartDatetime() { return startDatetime; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }

    public LocalDateTime getEndDatetime() { return endDatetime; }
    public void setEndDatetime(LocalDateTime endDatetime) { this.endDatetime = endDatetime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getPriceAtBooking() { return priceAtBooking; }
    public void setPriceAtBooking(BigDecimal priceAtBooking) { this.priceAtBooking = priceAtBooking; }

    public Boolean getIsPackageIncluded() { return isPackageIncluded; }
    public void setIsPackageIncluded(Boolean isPackageIncluded) { this.isPackageIncluded = isPackageIncluded; }
}
