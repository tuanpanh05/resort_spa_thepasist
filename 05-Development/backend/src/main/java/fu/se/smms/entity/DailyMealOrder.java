package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_meal_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyMealOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private RoomBooking roomBooking;

    @Column(name = "serve_date", nullable = false)
    private LocalDate serveDate;

    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType; // 'Breakfast', 'Lunch', 'Dinner'

    @Column(name = "dietary_tag", nullable = false, length = 50)
    private String dietaryTag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private FoodMenu foodMenu;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING"; // 'PENDING', 'PREPARING', 'SERVED'
}
