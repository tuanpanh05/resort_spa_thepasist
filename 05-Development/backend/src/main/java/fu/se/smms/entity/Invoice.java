package fu.se.smms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Integer invoiceId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "room_booking_id")
    private RoomBooking roomBooking;

    @Column(name = "room_subtotal")
    private BigDecimal roomSubtotal;
    @Column(name = "spa_subtotal")
    private BigDecimal spaSubtotal;
    @Column(name = "food_subtotal")
    private BigDecimal foodSubtotal;
    @Column(name = "tax_and_fees")
    private BigDecimal taxAndFees;
    @Column(name = "final_amount")
    private BigDecimal finalAmount;
    @Column(name = "deposit_amount")
    private BigDecimal depositAmount;
    @Column(name = "amount_due")
    private BigDecimal amountDue;
    @Column(name = "status")
    private String status;
    @Column(name = "vnpay_tran_id")
    private String vnpayTranId;
    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    public Integer getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Integer invoiceId) {
        this.invoiceId = invoiceId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public RoomBooking getRoomBooking() {
        return roomBooking;
    }

    public void setRoomBooking(RoomBooking roomBooking) {
        this.roomBooking = roomBooking;
    }

    public BigDecimal getRoomSubtotal() {
        return roomSubtotal;
    }

    public void setRoomSubtotal(BigDecimal roomSubtotal) {
        this.roomSubtotal = roomSubtotal;
    }

    public BigDecimal getSpaSubtotal() {
        return spaSubtotal;
    }

    public void setSpaSubtotal(BigDecimal spaSubtotal) {
        this.spaSubtotal = spaSubtotal;
    }

    public BigDecimal getFoodSubtotal() {
        return foodSubtotal;
    }

    public void setFoodSubtotal(BigDecimal foodSubtotal) {
        this.foodSubtotal = foodSubtotal;
    }

    public BigDecimal getTaxAndFees() {
        return taxAndFees;
    }

    public void setTaxAndFees(BigDecimal taxAndFees) {
        this.taxAndFees = taxAndFees;
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(BigDecimal finalAmount) {
        this.finalAmount = finalAmount;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(BigDecimal depositAmount) {
        this.depositAmount = depositAmount;
    }

    public BigDecimal getAmountDue() {
        return amountDue;
    }

    public void setAmountDue(BigDecimal amountDue) {
        this.amountDue = amountDue;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVnpayTranId() {
        return vnpayTranId;
    }

    public void setVnpayTranId(String vnpayTranId) {
        this.vnpayTranId = vnpayTranId;
    }

    public LocalDateTime getPaymentTime() {
        return paymentTime;
    }

    public void setPaymentTime(LocalDateTime paymentTime) {
        this.paymentTime = paymentTime;
    }

    public Voucher getVoucher() {
        return voucher;
    }

    public void setVoucher(Voucher voucher) {
        this.voucher = voucher;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }
}
