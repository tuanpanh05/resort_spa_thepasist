package fu.se.smms.dto;

/**
 * DTO carrying details for adding extra services to an existing booking.
 */
public class AddExtraServicesDTO {

    private Integer roomId;
    private Integer packageId;
    private String checkInDate;
    private String checkOutDate;
    
    private Integer foodMenuId;
    private Integer foodQuantity;

    private Integer spaServiceId;
    private String spaStartDatetime;

    public AddExtraServicesDTO() {}

    public Integer getRoomId() { return roomId; }
    public void setRoomId(Integer roomId) { this.roomId = roomId; }

    public Integer getPackageId() { return packageId; }
    public void setPackageId(Integer packageId) { this.packageId = packageId; }

    public String getCheckInDate() { return checkInDate; }
    public void setCheckInDate(String checkInDate) { this.checkInDate = checkInDate; }

    public String getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(String checkOutDate) { this.checkOutDate = checkOutDate; }

    public Integer getFoodMenuId() { return foodMenuId; }
    public void setFoodMenuId(Integer foodMenuId) { this.foodMenuId = foodMenuId; }

    public Integer getFoodQuantity() { return foodQuantity; }
    public void setFoodQuantity(Integer foodQuantity) { this.foodQuantity = foodQuantity; }

    public Integer getSpaServiceId() { return spaServiceId; }
    public void setSpaServiceId(Integer spaServiceId) { this.spaServiceId = spaServiceId; }

    public String getSpaStartDatetime() { return spaStartDatetime; }
    public void setSpaStartDatetime(String spaStartDatetime) { this.spaStartDatetime = spaStartDatetime; }
}
