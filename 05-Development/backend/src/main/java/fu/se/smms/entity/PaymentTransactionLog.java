package fu.se.smms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PaymentTransactionLog entity - BR-26 (Transaction Audit Trail).
 * Every successful financial transaction must be logged permanently and immutable.
 * Maps to dbo.payment_transaction_log table (Module 5 extension).
 */
@Entity
@Table(name = "payment_transaction_log")
public class PaymentTransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Integer logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    /** Payment gateway used: VNPAY, CASH */
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    /** Amount actually collected at this transaction */
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /** VNPay transaction reference number (null for CASH) */
    @Column(name = "gateway_ref", length = 100)
    private String gatewayRef;

    /** Raw VNPay response code or 'CASH' */
    @Column(name = "response_code", length = 10)
    private String responseCode;

    /** PAID, FAILED, REFUNDED */
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    /** Immutable timestamp of when transaction was recorded */
    @Column(name = "transaction_time", nullable = false, updatable = false)
    private LocalDateTime transactionTime;

    /** IP address for fraud tracing */
    @Column(name = "client_ip", length = 45)
    private String clientIp;

    @PrePersist
    protected void onCreate() {
        this.transactionTime = LocalDateTime.now();
    }

    // === Getters & Setters ===

    public Integer getLogId() {
        return logId;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getGatewayRef() {
        return gatewayRef;
    }

    public void setGatewayRef(String gatewayRef) {
        this.gatewayRef = gatewayRef;
    }

    public String getResponseCode() {
        return responseCode;
    }

    public void setResponseCode(String responseCode) {
        this.responseCode = responseCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public String getClientIp() {
        return clientIp;
    }

    public void setClientIp(String clientIp) {
        this.clientIp = clientIp;
    }
}
