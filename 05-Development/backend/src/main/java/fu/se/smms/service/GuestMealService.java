package fu.se.smms.service;

import fu.se.smms.dto.MealPreselectionDTO;
import java.util.List;
import java.util.Map;

public interface GuestMealService {
    Map<String, Object> getGuestProfile(String email);
    Map<String, Object> updateConsent(Integer userId, Boolean consent);
    List<Map<String, Object>> getFilteredMenu(Integer userId);
    Map<String, Object> preselectMeals(MealPreselectionDTO dto);
    List<Map<String, Object>> getChefAllergies();
    Map<String, Object> orderExtra(MealPreselectionDTO dto);
    Map<String, Object> cancelFoodOrder(Integer orderId, String reason);
}
