package fu.se.smms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity mapping the room_booking table.
 * One booking can include multiple rooms (via RoomBookingDetail).
 */
@Entity
@Table(name = "room_booking")
public class RoomBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Integer bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", referencedColumnName = "package_id")
    private RetreatPackage retreatPackage; // nullable

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "booking_packages",
        joinColumns = @JoinColumn(name = "booking_id"),
        inverseJoinColumns = @JoinColumn(name = "package_id")
    )
    private List<RetreatPackage> retreatPackages;

    @Column(name = "check_in_date", nullable = false)
    private LocalDateTime checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDateTime checkOutDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED

    @Column(name = "total_deposit", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalDeposit = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "cancellation_time")
    private LocalDateTime cancellationTime;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "special_requests", columnDefinition = "NVARCHAR(MAX)")
    private String specialRequests;

    @Column(name = "guests_count")
    private Integer guestsCount;

    @Column(name = "children_under_5")
    private Integer childrenUnder5;

    @Column(name = "children_5_to_12")
    private Integer children5to12;

    @Column(name = "children_count")
    private Integer childrenCount;

    @OneToMany(mappedBy = "roomBooking", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<RoomBookingDetail> details;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (totalDeposit == null) totalDeposit = BigDecimal.ZERO;
    }

    public RoomBooking() {}

    // Getters and Setters
    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public RetreatPackage getRetreatPackage() { return retreatPackage; }
    public void setRetreatPackage(RetreatPackage retreatPackage) {
        this.retreatPackage = retreatPackage;
        if (retreatPackage != null) {
            this.retreatPackages = java.util.List.of(retreatPackage);
        } else {
            this.retreatPackages = java.util.Collections.emptyList();
        }
    }

    public List<RetreatPackage> getRetreatPackages() { return retreatPackages; }
    public void setRetreatPackages(List<RetreatPackage> retreatPackages) {
        this.retreatPackages = retreatPackages;
        if (retreatPackages != null && !retreatPackages.isEmpty()) {
            this.retreatPackage = retreatPackages.get(0);
        } else {
            this.retreatPackage = null;
        }
    }

    public LocalDateTime getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDateTime checkInDate) { this.checkInDate = checkInDate; }

    public LocalDateTime getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDateTime checkOutDate) { this.checkOutDate = checkOutDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTotalDeposit() { return totalDeposit; }
    public void setTotalDeposit(BigDecimal totalDeposit) { this.totalDeposit = totalDeposit; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<RoomBookingDetail> getDetails() { return details; }
    public void setDetails(List<RoomBookingDetail> details) { this.details = details; }

    public Integer getPackageId() {
        return retreatPackage != null ? retreatPackage.getPackageId() : null;
    }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public LocalDateTime getCancellationTime() { return cancellationTime; }
    public void setCancellationTime(LocalDateTime cancellationTime) { this.cancellationTime = cancellationTime; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public Integer getGuestsCount() { return guestsCount; }
    public void setGuestsCount(Integer guestsCount) { this.guestsCount = guestsCount; }

    public Integer getChildrenUnder5() { return childrenUnder5; }
    public void setChildrenUnder5(Integer childrenUnder5) { this.childrenUnder5 = childrenUnder5; }

    public Integer getChildren5to12() { return children5to12; }
    public void setChildren5to12(Integer children5to12) { this.children5to12 = children5to12; }

    public Integer getChildrenCount() { return childrenCount; }
    public void setChildrenCount(Integer childrenCount) { this.childrenCount = childrenCount; }
}
