package fu.se.smms.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for UC10 Booking Details & Itinerary Timeline.
 * Aggregates booking info, room info, package info, and timeline events
 * from spa bookings and food orders (Aggregator Pattern per ADR-004).
 */
public class ItineraryDTO {

    // Booking info
    private Integer bookingId;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private String bookingStatus;
    private BigDecimal totalDeposit;

    // Room info
    private String roomNumber;
    private String roomTypeName;

    // Package info
    private String packageName;
    private String packageDescription;
    private Integer packageDurationDays;

    // Timeline events (sorted by datetime)
    private List<TimelineEvent> timeline;

    public ItineraryDTO() {}

    // Getters and Setters
    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public LocalDateTime getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDateTime checkInDate) { this.checkInDate = checkInDate; }

    public LocalDateTime getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDateTime checkOutDate) { this.checkOutDate = checkOutDate; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public BigDecimal getTotalDeposit() { return totalDeposit; }
    public void setTotalDeposit(BigDecimal totalDeposit) { this.totalDeposit = totalDeposit; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }

    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }

    public String getPackageDescription() { return packageDescription; }
    public void setPackageDescription(String packageDescription) { this.packageDescription = packageDescription; }

    public Integer getPackageDurationDays() { return packageDurationDays; }
    public void setPackageDurationDays(Integer packageDurationDays) { this.packageDurationDays = packageDurationDays; }

    public List<TimelineEvent> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEvent> timeline) { this.timeline = timeline; }

    /**
     * Inner class representing a single event on the itinerary timeline.
     * Can be a spa booking, food order, or check-in/check-out event.
     */
    public static class TimelineEvent {
        private String type; // SPA, FOOD, CHECKIN, CHECKOUT
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String status;
        private BigDecimal price;

        public TimelineEvent() {}

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }
}
