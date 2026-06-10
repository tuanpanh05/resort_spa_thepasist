package fu.se.smms.service;

import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import java.util.List;
import java.util.Map;

public interface InvoiceService {
    InvoiceDTO getInvoiceById(Integer invoiceId);
    List<InvoiceDTO> getInvoicesByUserId(Integer userId);
    InvoiceDTO createInvoice(Integer bookingId);
    VNPayPaymentDTO createPaymentUrl(Integer invoiceId);
    InvoiceDTO markCashPayment(Integer invoiceId);
    InvoiceDTO processPaymentCallback(VNPayPaymentDTO paymentResult);
    InvoiceDTO processVNPayCallback(Map<String, String> callbackParams);
    Map<String, String> processVNPayIpn(Map<String, String> callbackParams);
}
