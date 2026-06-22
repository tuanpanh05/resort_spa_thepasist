package fu.se.smms.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceDTO {
    private Integer invoiceId;
    private Integer userId;
    private Integer bookingId;
    private BigDecimal roomSubtotal;
    private BigDecimal spaSubtotal;
    private BigDecimal foodSubtotal;
    private BigDecimal taxAndFees;
    private BigDecimal finalAmount;
    private BigDecimal depositAmount;
    private BigDecimal amountDue;
    private String status;
    private String vnpayTranId;
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;

    public Integer getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Integer invoiceId) {
        this.invoiceId = invoiceId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
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

    private String bookingStatus;

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    private String customerName;
    private String roomNumber;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public LocalDateTime getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDateTime checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDateTime getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDateTime checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
