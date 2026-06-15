package fu.se.smms.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class BookingRequestDTO {

    private Integer packageId; // Optional

    @NotNull(message = "Vui lòng chọn biệt thự/phòng trống.")
    private Integer roomId;

    @NotNull(message = "Vui lòng chọn ngày nhận phòng.")
    private LocalDateTime checkInDate;

    @NotNull(message = "Vui lòng chọn ngày trả phòng.")
    private LocalDateTime checkOutDate;

    public BookingRequestDTO() {}

    public Integer getPackageId() {
        return packageId;
    }

    public void setPackageId(Integer packageId) {
        this.packageId = packageId;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    public LocalDateTime getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDateTime checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDateTime getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDateTime checkOutDate) {
        this.checkOutDate = checkOutDate;
    }
}
