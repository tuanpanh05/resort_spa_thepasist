package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer invoiceId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "room_booking_id")
    private RoomBooking roomBooking;

    private BigDecimal roomSubtotal;
    private BigDecimal spaSubtotal;
    private BigDecimal foodSubtotal;
    private BigDecimal taxAndFees;
    private BigDecimal finalAmount;
    private String status;
    private String vnpayTranId;
    private LocalDateTime paymentTime;
}
