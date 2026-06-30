package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "procurement_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcurementRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    @Column(name = "qty", nullable = false)
    private Double qty;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // e.g. "Chờ duyệt", "Đã nhập kho", "Từ chối"
}
