package fu.se.smms.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPreselectionDTO {
    private Integer userId;
    private Integer bookingId;
    private List<MealSelectionItem> selections;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MealSelectionItem {
        private String date; // yyyy-MM-dd
        private String period; // Breakfast, Lunch, Dinner
        private Integer foodId;
        private Integer quantity;
        private String specialNote;
    }
}
