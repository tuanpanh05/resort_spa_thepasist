package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookingId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer packageId; // Or ManyToOne reference if package entity is created
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private String status;
    private BigDecimal totalDeposit;
    private LocalDateTime createdAt;
}
