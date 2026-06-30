package fu.se.smms.dto;

import java.time.LocalDateTime;

/**
 * DTO for carrying checked-in guest residency info.
 * Includes both accompanying guests and primary guest representatives.
 */
public class GuestResidencyDTO {

    private Integer guestId;
    private Integer bookingId;
    private String fullName;
    private String identityDocument;
    private String relationship;
    private Boolean isChild;
    private LocalDateTime createdAt;

    // Representative Info
    private String representativeName;
    private String representativePhone;
    private String representativeEmail;
    private String roomNumber;

    public GuestResidencyDTO() {}

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

    public String getRepresentativeName() { return representativeName; }
    public void setRepresentativeName(String representativeName) { this.representativeName = representativeName; }

    public String getRepresentativePhone() { return representativePhone; }
    public void setRepresentativePhone(String representativePhone) { this.representativePhone = representativePhone; }

    public String getRepresentativeEmail() { return representativeEmail; }
    public void setRepresentativeEmail(String representativeEmail) { this.representativeEmail = representativeEmail; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
}
