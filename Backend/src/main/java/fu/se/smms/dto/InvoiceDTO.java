package fu.se.smms.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InvoiceDTO {
    private Integer invoiceId;
    private Integer userId;
    private Integer bookingId;
    private BigDecimal roomSubtotal;
    private BigDecimal spaSubtotal;
    private BigDecimal foodSubtotal;
    private BigDecimal taxAndFees;
    private BigDecimal finalAmount;
    private String status;
    private String vnpayTranId;
    private LocalDateTime paymentTime;
}
