package fu.se.smms.dto;

import java.math.BigDecimal;

public class BookingResponseDTO {
    private Integer bookingId;
    private Integer invoiceId;
    private BigDecimal totalPrice;
    private BigDecimal requiredDeposit;
    private String status;

    public BookingResponseDTO() {}

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public Integer getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Integer invoiceId) {
        this.invoiceId = invoiceId;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BigDecimal getRequiredDeposit() {
        return requiredDeposit;
    }

    public void setRequiredDeposit(BigDecimal requiredDeposit) {
        this.requiredDeposit = requiredDeposit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
