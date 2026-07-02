package fu.se.smms.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class BookingRequestDTO {

    private String fullName;
    private String email;
    private String phone;
    private Integer guestsCount;
    private Integer childrenCount;
    private Integer childrenUnder5;
    private Integer children5to12;

    private Integer roomId;
    private List<Integer> roomIds;
    private Integer villaId;
    private Integer roomQuantity;
    private Map<String, Integer> roomTypeQuantities;

    private Integer packageId;
    private List<Integer> packageIds;
    private List<Integer> serviceIds;

    @NotNull(message = "Vui lòng chọn ngày nhận phòng.")
    private String checkInDate;

    @NotNull(message = "Vui lòng chọn ngày trả phòng.")
    private String checkOutDate;

    // Medical profile fields
    private String allergies;
    private Boolean explicitConsentSigned;
    private String specialRequests;

    // Guest identity and accompanying guests
    private String identityDocument;
    private String nationality;
    private String documentType;
    private List<AccompanyingGuestDTO> accompanyingGuests;

    // Meal selections
    // Structure: Date (YYYY-MM-DD) -> Period (Breakfast, Lunch, Dinner) -> FoodId -> Quantity
    private Map<String, Map<String, Map<Integer, Integer>>> mealSelections;

    public BookingRequestDTO() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Integer getGuestsCount() { return guestsCount; }
    public void setGuestsCount(Integer guestsCount) { this.guestsCount = guestsCount; }

    public Integer getRoomId() { return roomId; }
    public void setRoomId(Integer roomId) { this.roomId = roomId; }

    public List<Integer> getRoomIds() { return roomIds; }
    public void setRoomIds(List<Integer> roomIds) { this.roomIds = roomIds; }

    public Integer getVillaId() { return villaId; }
    public void setVillaId(Integer villaId) { this.villaId = villaId; }

    public Integer getRoomQuantity() {
        return (roomQuantity == null || roomQuantity < 1) ? 1 : roomQuantity;
    }
    public void setRoomQuantity(Integer roomQuantity) { this.roomQuantity = roomQuantity; }

    public Map<String, Integer> getRoomTypeQuantities() { return roomTypeQuantities; }
    public void setRoomTypeQuantities(Map<String, Integer> roomTypeQuantities) { this.roomTypeQuantities = roomTypeQuantities; }

    public Integer getPackageId() { return packageId; }
    public void setPackageId(Integer packageId) { this.packageId = packageId; }

    public List<Integer> getPackageIds() {
        if (packageIds == null || packageIds.isEmpty()) {
            if (packageId != null) {
                return java.util.List.of(packageId);
            }
            return java.util.Collections.emptyList();
        }
        return packageIds;
    }
    public void setPackageIds(List<Integer> packageIds) { this.packageIds = packageIds; }

    public List<Integer> getServiceIds() { return serviceIds; }
    public void setServiceIds(List<Integer> serviceIds) { this.serviceIds = serviceIds; }

    private LocalDateTime parseDateTime(String dateStr, int defaultHour) {
        if (dateStr == null || dateStr.isBlank()) return null;
        dateStr = dateStr.trim();
        try {
            if (dateStr.length() == 10) {
                return java.time.LocalDate.parse(dateStr).atTime(defaultHour, 0, 0);
            }
            if (dateStr.contains("T")) {
                if (dateStr.indexOf('T') != dateStr.lastIndexOf('T')) {
                    dateStr = dateStr.substring(0, dateStr.lastIndexOf('T'));
                }
                if (dateStr.length() == 16) {
                    return LocalDateTime.parse(dateStr, java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                }
                return LocalDateTime.parse(dateStr);
            }
            if (dateStr.contains(" ")) {
                String[] parts = dateStr.split(" ");
                java.time.LocalDate date = java.time.LocalDate.parse(parts[0]);
                String timePart = parts[1];
                if (timePart.length() == 5) timePart += ":00";
                return date.atTime(java.time.LocalTime.parse(timePart));
            }
            return java.time.LocalDate.parse(dateStr).atTime(defaultHour, 0, 0);
        } catch (Exception e) {
            throw new RuntimeException("Định dạng ngày không hợp lệ: " + dateStr, e);
        }
    }

    public LocalDateTime getCheckInDate() { 
        return parseDateTime(checkInDate, 14); 
    }
    public void setCheckInDate(String checkInDate) { this.checkInDate = checkInDate; }

    public LocalDateTime getCheckOutDate() { 
        return parseDateTime(checkOutDate, 12); 
    }
    public void setCheckOutDate(String checkOutDate) { this.checkOutDate = checkOutDate; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public Boolean getExplicitConsentSigned() { return explicitConsentSigned; }
    public void setExplicitConsentSigned(Boolean explicitConsentSigned) { this.explicitConsentSigned = explicitConsentSigned; }

    public Map<String, Map<String, Map<Integer, Integer>>> getMealSelections() { return mealSelections; }
    public void setMealSelections(Map<String, Map<String, Map<Integer, Integer>>> mealSelections) { this.mealSelections = mealSelections; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public Integer getChildrenCount() { return childrenCount; }
    public void setChildrenCount(Integer childrenCount) { this.childrenCount = childrenCount; }

    public Integer getChildrenUnder5() { return childrenUnder5; }
    public void setChildrenUnder5(Integer childrenUnder5) { this.childrenUnder5 = childrenUnder5; }

    public Integer getChildren5to12() { return children5to12; }
    public void setChildren5to12(Integer children5to12) { this.children5to12 = children5to12; }

    public String getIdentityDocument() { return identityDocument; }
    public void setIdentityDocument(String identityDocument) { this.identityDocument = identityDocument; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public List<AccompanyingGuestDTO> getAccompanyingGuests() { return accompanyingGuests; }
    public void setAccompanyingGuests(List<AccompanyingGuestDTO> accompanyingGuests) { this.accompanyingGuests = accompanyingGuests; }
}
