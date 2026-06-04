package fu.se.smms.controller;

import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoice(@PathVariable Integer id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InvoiceDTO>> getUserInvoices(@PathVariable Integer userId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByUserId(userId));
    }

    @PostMapping("/create")
    public ResponseEntity<InvoiceDTO> createInvoice(@RequestParam Integer bookingId) {
        return ResponseEntity.ok(invoiceService.createInvoice(bookingId));
    }

    @PostMapping("/{id}/payment-url")
    public ResponseEntity<VNPayPaymentDTO> getPaymentUrl(@PathVariable Integer id) {
        return ResponseEntity.ok(invoiceService.createPaymentUrl(id));
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<InvoiceDTO> paymentCallback(@ModelAttribute VNPayPaymentDTO callbackData) {
        return ResponseEntity.ok(invoiceService.processPaymentCallback(callbackData));
    }
}
