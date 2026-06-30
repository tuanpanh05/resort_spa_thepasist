package fu.se.smms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing accompanying guests checking in with the main guest.
 * Maps to 'accompanying_guest' table.
 */
@Entity
@Table(name = "accompanying_guest")
public class AccompanyingGuest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "guest_id")
    private Integer guestId;

    @Column(name = "booking_id", nullable = false)
    private Integer bookingId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "identity_document", length = 50)
    private String identityDocument;

    @Column(name = "relationship", length = 50)
    private String relationship;

    @Column(name = "is_child", nullable = false)
    private Boolean isChild = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public AccompanyingGuest() {}

    public Integer getGuestId() { return guestId; }
    public void setGuestId(Integer guestId) { this.guestId = guestId; }

    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getIdentityDocument() { return identityDocument; }
    public void setIdentityDocument(String identityDocument) { this.identityDocument = identityDocument; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public Boolean getIsChild() { return isChild; }
    public void setIsChild(Boolean isChild) { this.isChild = isChild; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
