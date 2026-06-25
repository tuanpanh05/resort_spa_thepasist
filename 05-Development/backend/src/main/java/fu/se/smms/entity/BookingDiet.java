package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_diet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private RoomBooking roomBooking;

    @Column(name = "dietary_tag", nullable = false, length = 50)
    private String dietaryTag; // e.g., 'Omnivore', 'Vegan', 'Keto'

    @Column(name = "guest_count", nullable = false)
    @Builder.Default
    private Integer guestCount = 1;
}
