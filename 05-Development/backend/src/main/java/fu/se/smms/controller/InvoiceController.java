package fu.se.smms.controller;

import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
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

    @PostMapping("/{id}/cash-payment")
    public ResponseEntity<InvoiceDTO> markCashPayment(@PathVariable Integer id) {
        return ResponseEntity.ok(invoiceService.markCashPayment(id));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<InvoiceDTO> paymentReturn(@RequestParam Map<String, String> callbackData) {
        return ResponseEntity.ok(invoiceService.processVNPayCallback(callbackData));
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<InvoiceDTO> paymentCallback(@RequestParam Map<String, String> callbackData) {
        return ResponseEntity.ok(invoiceService.processVNPayCallback(callbackData));
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> paymentIpn(@RequestParam Map<String, String> callbackData) {
        return ResponseEntity.ok(invoiceService.processVNPayIpn(callbackData));
    }

    /**
     * UC21/UC22 - Consolidated Billing Constraint check.
     * Receptionist calls this BEFORE attempting checkout.
     * Returns 200 OK if all orders are settled, 409 CONFLICT if pending orders exist.
     * GET /api/invoices/booking/{bookingId}/validate-checkout
     */
    @GetMapping("/booking/{bookingId}/validate-checkout")
    public ResponseEntity<Void> validateCheckout(@PathVariable Integer bookingId) {
        invoiceService.validateCheckoutLock(bookingId);
        return ResponseEntity.ok().build();
    }

    /**
     * UC22 - Process Payment & Check-out (BR-14).
     * After invoice is PAID, performs final checkout:
     * - Sets booking status to CHECKED_OUT
     * - Marks rooms as DIRTY (Vacant/Needs Cleaning)
     * POST /api/invoices/{id}/perform-checkout
     */
    @PostMapping("/{id}/perform-checkout")
    public ResponseEntity<InvoiceDTO> performCheckout(@PathVariable Integer id) {
        return ResponseEntity.ok(invoiceService.performCheckout(id));
    }

    /**
     * UC22-EarlyCheckout - Early Check-out (BR-14, Force Cancel F&B).
     * Force-cancels all PENDING/PREPARING FoodOrders, then checks out.
     * POST /api/invoices/{id}/early-checkout
     */
    @PostMapping("/{id}/early-checkout")
    public ResponseEntity<InvoiceDTO> earlyCheckout(@PathVariable Integer id) {
        return ResponseEntity.ok(invoiceService.earlyCheckout(id));
    }
}
