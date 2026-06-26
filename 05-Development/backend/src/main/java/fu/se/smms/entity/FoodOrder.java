package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class FoodOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "room_booking_id")
    private RoomBooking roomBooking;

    @Column(name = "order_time", nullable = false)
    private LocalDateTime orderTime;

    @Column(name = "status", nullable = false)
    private String status; // PENDING, PREPARING, READY, DELIVERED, CANCELLED

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "origin")
    private String origin;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "cancellation_time")
    private LocalDateTime cancellationTime;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @ManyToOne
    @JoinColumn(name = "table_id")
    private RestaurantTable table;
}
