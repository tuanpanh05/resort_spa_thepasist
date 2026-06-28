package fu.se.smms.service;

import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.entity.Invoice;
import java.math.BigDecimal;
import java.util.Map;

public interface VNPayService {
    VNPayPaymentDTO createPaymentUrl(Invoice invoice, BigDecimal payableAmount);
    void verifyVNPaySignature(Map<String, String> callbackParams);
    boolean isVNPayAmountValid(BigDecimal expectedPayableAmount, String rawAmount);
}
