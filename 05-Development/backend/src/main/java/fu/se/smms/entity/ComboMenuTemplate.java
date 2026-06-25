package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "combo_menu_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboMenuTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private RetreatPackage retreatPackage;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber; // 1 to 7

    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType; // 'Breakfast', 'Lunch', 'Dinner'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private FoodMenu foodMenu;
}
