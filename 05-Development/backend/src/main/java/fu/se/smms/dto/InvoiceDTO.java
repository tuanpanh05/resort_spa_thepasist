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
    private BigDecimal serviceSubtotal;
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

    public BigDecimal getServiceSubtotal() {
        return serviceSubtotal;
    }

    public void setServiceSubtotal(BigDecimal serviceSubtotal) {
        this.serviceSubtotal = serviceSubtotal;
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

    private String customerPhone;
    private String customerEmail;
    private String cancellationReason;
    private LocalDateTime cancellationTime;
    private BigDecimal refundAmount;
    private String cancellationDetails;
    private String voucherCode;
    private BigDecimal discountAmount;

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public LocalDateTime getCancellationTime() { return cancellationTime; }
    public void setCancellationTime(LocalDateTime cancellationTime) { this.cancellationTime = cancellationTime; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getCancellationDetails() { return cancellationDetails; }
    public void setCancellationDetails(String cancellationDetails) { this.cancellationDetails = cancellationDetails; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    private BigDecimal spaChildDiscount;
    public BigDecimal getSpaChildDiscount() { return spaChildDiscount; }
    public void setSpaChildDiscount(BigDecimal spaChildDiscount) { this.spaChildDiscount = spaChildDiscount; }
}
