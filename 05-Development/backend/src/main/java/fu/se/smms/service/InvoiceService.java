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

    /**
     * UC21/UC22 - Consolidated Billing Constraint (Module 5):
     * Validates that a booking has no pending spa sessions or unfinished food orders.
     * Throws BusinessException(INV-409) if any pending items are found.
     * Must be called before allowing checkout to proceed.
     *
     * @param bookingId The booking to validate
     * @throws fu.se.smms.exception.BusinessException if pending orders exist
     */
    void validateCheckoutLock(Integer bookingId);

    /**
     * UC22 - Process Payment & Check-out:
     * After invoice is PAID, updates RoomBooking status to CHECKED_OUT
     * and marks associated rooms as DIRTY (Vacant/Needs Cleaning - BR-14).
     *
     * @param invoiceId The paid invoice to finalize checkout
     * @return Updated InvoiceDTO with CHECKED_OUT booking status
     */
    InvoiceDTO performCheckout(Integer invoiceId);
}

