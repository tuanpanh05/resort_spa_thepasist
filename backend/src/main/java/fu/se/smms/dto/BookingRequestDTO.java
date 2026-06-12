package fu.se.smms.dto;

import java.util.List;
import java.util.Map;

public class BookingRequestDTO {

    private String fullName;
    private String email;
    private String phone;
    private String checkInDate;
    private String checkOutDate;
    private Integer guestsCount;

    private Integer villaId;
    private Integer packageId;
    private List<Integer> serviceIds;

    // Medical profile fields
    private String allergies;
    private Boolean explicitConsentSigned;

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

    public String getCheckInDate() { return checkInDate; }
    public void setCheckInDate(String checkInDate) { this.checkInDate = checkInDate; }

    public String getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(String checkOutDate) { this.checkOutDate = checkOutDate; }

    public Integer getGuestsCount() { return guestsCount; }
    public void setGuestsCount(Integer guestsCount) { this.guestsCount = guestsCount; }

    public Integer getVillaId() { return villaId; }
    public void setVillaId(Integer villaId) { this.villaId = villaId; }

    public Integer getPackageId() { return packageId; }
    public void setPackageId(Integer packageId) { this.packageId = packageId; }

    public List<Integer> getServiceIds() { return serviceIds; }
    public void setServiceIds(List<Integer> serviceIds) { this.serviceIds = serviceIds; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public Boolean getExplicitConsentSigned() { return explicitConsentSigned; }
    public void setExplicitConsentSigned(Boolean explicitConsentSigned) { this.explicitConsentSigned = explicitConsentSigned; }

    public Map<String, Map<String, Map<Integer, Integer>>> getMealSelections() { return mealSelections; }
    public void setMealSelections(Map<String, Map<String, Map<Integer, Integer>>> mealSelections) { this.mealSelections = mealSelections; }
}
