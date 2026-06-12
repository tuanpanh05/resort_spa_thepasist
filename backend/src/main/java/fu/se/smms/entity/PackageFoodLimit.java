package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "package_food_limit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PackageFoodLimit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_food_id")
    private Integer packageFoodId;

    @Column(name = "package_id", nullable = false)
    private Integer packageId;

    @ManyToOne
    @JoinColumn(name = "food_id", nullable = false)
    private FoodMenu foodMenu;

    @Column(name = "quantity_per_day", nullable = false)
    private Integer quantityPerDay;
}
