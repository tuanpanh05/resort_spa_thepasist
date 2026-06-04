package fu.se.smms.dto;

import lombok.Data;

@Data
public class VNPayPaymentDTO {
    private String orderId;
    private long amount;
    private String orderInfo;
    private String returnUrl;
    private String paymentUrl;
    private String responseCode;
    private String transactionNo;
}
