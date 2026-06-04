package fu.se.smms.service;

import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import java.util.List;

public interface InvoiceService {
    InvoiceDTO getInvoiceById(Integer invoiceId);
    List<InvoiceDTO> getInvoicesByUserId(Integer userId);
    InvoiceDTO createInvoice(Integer bookingId);
    VNPayPaymentDTO createPaymentUrl(Integer invoiceId);
    InvoiceDTO processPaymentCallback(VNPayPaymentDTO paymentResult);
}
