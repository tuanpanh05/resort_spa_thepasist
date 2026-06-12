package fu.se.smms.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for room booking history displayed on the Customer Profile page.
 */
public class BookingHistoryDTO {

    private Integer bookingId;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private String status;
    private BigDecimal totalDeposit;
    private LocalDateTime createdAt;
    private String packageName;   // Retreat package name (nullable)
    private List<RoomDetailDTO> rooms;

    public BookingHistoryDTO() {}

    // ---------------------------------------------------------------
    // Nested DTO for individual room lines within a booking
    // ---------------------------------------------------------------
    public static class RoomDetailDTO {
        private String roomNumber;
        private String typeName;
        private BigDecimal priceAtBooking;

        public RoomDetailDTO() {}

        public RoomDetailDTO(String roomNumber, String typeName, BigDecimal priceAtBooking) {
            this.roomNumber = roomNumber;
            this.typeName = typeName;
            this.priceAtBooking = priceAtBooking;
        }

        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public String getTypeName() { return typeName; }
        public void setTypeName(String typeName) { this.typeName = typeName; }
        public BigDecimal getPriceAtBooking() { return priceAtBooking; }
        public void setPriceAtBooking(BigDecimal priceAtBooking) { this.priceAtBooking = priceAtBooking; }
    }

    // ---------------------------------------------------------------
    // Builder
    // ---------------------------------------------------------------
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Integer bookingId;
        private LocalDateTime checkInDate;
        private LocalDateTime checkOutDate;
        private String status;
        private BigDecimal totalDeposit;
        private LocalDateTime createdAt;
        private String packageName;
        private List<RoomDetailDTO> rooms;

        public Builder bookingId(Integer bookingId) { this.bookingId = bookingId; return this; }
        public Builder checkInDate(LocalDateTime checkInDate) { this.checkInDate = checkInDate; return this; }
        public Builder checkOutDate(LocalDateTime checkOutDate) { this.checkOutDate = checkOutDate; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder totalDeposit(BigDecimal totalDeposit) { this.totalDeposit = totalDeposit; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder packageName(String packageName) { this.packageName = packageName; return this; }
        public Builder rooms(List<RoomDetailDTO> rooms) { this.rooms = rooms; return this; }

        public BookingHistoryDTO build() {
            BookingHistoryDTO dto = new BookingHistoryDTO();
            dto.bookingId = bookingId;
            dto.checkInDate = checkInDate;
            dto.checkOutDate = checkOutDate;
            dto.status = status;
            dto.totalDeposit = totalDeposit;
            dto.createdAt = createdAt;
            dto.packageName = packageName;
            dto.rooms = rooms;
            return dto;
        }
    }

    // ---------------------------------------------------------------
    // Getters and Setters
    // ---------------------------------------------------------------
    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

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

    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }

    public List<RoomDetailDTO> getRooms() { return rooms; }
    public void setRooms(List<RoomDetailDTO> rooms) { this.rooms = rooms; }
}
