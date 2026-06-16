package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "food_menu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class FoodMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id")
    private Integer foodId;

    @Column(name = "dish_name", nullable = false)
    private String dishName;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "dietary_tags", nullable = false)
    private String dietaryTags;

    @Column(name = "category")
    private String category;

    @Column(name = "allergens")
    private String allergens;

    @Column(name = "is_today_menu", nullable = false)
    @Builder.Default
    private Boolean isTodayMenu = true;

    @Column(name = "sold_out", nullable = false)
    @Builder.Default
    private Boolean soldOut = false;

    @Column(name = "ingredients")
    private String ingredients;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_package_included", nullable = false)
    @Builder.Default
    private Boolean isPackageIncluded = true;

    @Column(name = "periods")
    @Builder.Default
    private String periods = "Lunch";

    @Column(name = "available_days")
    @Builder.Default
    private String availableDays = "0,1,2,3,4,5,6";

    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = true;
}

