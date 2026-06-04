package fu.se.smms.service.impl;

import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.service.InvoiceService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Override
    public InvoiceDTO getInvoiceById(Integer invoiceId) {
        return null;
    }

    @Override
    public List<InvoiceDTO> getInvoicesByUserId(Integer userId) {
        return null;
    }

    @Override
    public InvoiceDTO createInvoice(Integer bookingId) {
        return null;
    }

    @Override
    public VNPayPaymentDTO createPaymentUrl(Integer invoiceId) {
        return null;
    }

    @Override
    public InvoiceDTO processPaymentCallback(VNPayPaymentDTO paymentResult) {
        return null;
    }
}
