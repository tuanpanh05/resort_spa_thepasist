package fu.se.smms.service.impl;

import fu.se.smms.config.VNPayProperties;
import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.entity.Invoice;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.InvoiceRepository;
import fu.se.smms.repository.PaymentTransactionLogRepository;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomRepository;
import fu.se.smms.repository.SystemConfigurationRepository;
import fu.se.smms.repository.FoodOrderRepository;
import fu.se.smms.repository.SpaBookingRepository;
import fu.se.smms.entity.SystemConfiguration;
import fu.se.smms.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for InvoiceServiceImpl - Module 5 (UC21-UC22).
 * Tests: invoice creation, VNPay URL generation, VNPay callback processing,
 *        checkout lock validation, performCheckout (BR-14), and audit trail (BR-26).
 */
class InvoiceServiceImplTest {
    private InvoiceRepository invoiceRepository;
    private RoomBookingRepository roomBookingRepository;
    private RoomRepository roomRepository;
    private PaymentTransactionLogRepository transactionLogRepository;
    private SystemConfigurationRepository systemConfigurationRepository;
    private FoodOrderRepository foodOrderRepository;
    private EmailService emailService;
    private SpaBookingRepository spaBookingRepository;
    private InvoiceServiceImpl service;
    private VNPayProperties vnPayProperties;

    @BeforeEach
    void setUp() {
        invoiceRepository = mock(InvoiceRepository.class);
        roomBookingRepository = mock(RoomBookingRepository.class);
        roomRepository = mock(RoomRepository.class);
        transactionLogRepository = mock(PaymentTransactionLogRepository.class);
        systemConfigurationRepository = mock(SystemConfigurationRepository.class);
        foodOrderRepository = mock(FoodOrderRepository.class);
        emailService = mock(EmailService.class);
        spaBookingRepository = mock(SpaBookingRepository.class);

        SystemConfiguration depositConfig = new SystemConfiguration();
        depositConfig.setConfigKey("deposit_ratio");
        depositConfig.setConfigValue("0.30");
        when(systemConfigurationRepository.findByConfigKey("deposit_ratio"))
                .thenReturn(Optional.of(depositConfig));

        vnPayProperties = new VNPayProperties();
        vnPayProperties.setPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        vnPayProperties.setReturnUrl("http://localhost:8080/api/invoices/vnpay-callback");
        vnPayProperties.setTmnCode("TEST");
        vnPayProperties.setHashSecret("test-secret");

        service = new InvoiceServiceImpl(
                invoiceRepository, roomBookingRepository,
                roomRepository, transactionLogRepository,
                vnPayProperties, systemConfigurationRepository,
                foodOrderRepository, emailService,
                spaBookingRepository
        );

        // Default stubbing to prevent recalculate() from throwing exceptions or returning null
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceRepository.sumRoomSubtotal(anyInt())).thenReturn(new BigDecimal("12500000.00"));
        when(invoiceRepository.sumSpaSubtotal(anyInt())).thenReturn(new BigDecimal("0.00"));
        when(invoiceRepository.sumFoodSubtotal(anyInt())).thenReturn(new BigDecimal("320000.00"));
    }

    // ─── UC21: Consolidated Invoice Creation ─────────────────────────────────

    @Test
    @DisplayName("UC21-TC01: createInvoice aggregates room, spa, food and applies 10% tax correctly")
    void createInvoiceAggregatesRoomSpaFoodAndTax() {
        User user = new User();
        user.setUserId(5);
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(1);
        booking.setUser(user);
        booking.setTotalDeposit(new BigDecimal("3750000.00"));

        when(invoiceRepository.findFirstByRoomBooking_BookingId(1)).thenReturn(Optional.empty());
        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));
        when(invoiceRepository.sumRoomSubtotal(1)).thenReturn(new BigDecimal("12500000.00"));
        when(invoiceRepository.sumSpaSubtotal(1)).thenReturn(new BigDecimal("0.00"));
        when(invoiceRepository.sumFoodSubtotal(1)).thenReturn(new BigDecimal("320000.00"));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice invoice = invocation.getArgument(0);
            invoice.setInvoiceId(1);
            return invoice;
        });

        InvoiceDTO dto = service.createInvoice(1);

        assertEquals(1, dto.getInvoiceId());
        assertEquals(5, dto.getUserId());
        assertEquals(1, dto.getBookingId());
        assertEquals(new BigDecimal("12500000.00"), dto.getRoomSubtotal());
        assertEquals(new BigDecimal("0.00"), dto.getSpaSubtotal());
        assertEquals(new BigDecimal("320000.00"), dto.getFoodSubtotal());
        assertEquals(new BigDecimal("1282000.00"), dto.getTaxAndFees()); // (12500000 + 320000) * 10%
        assertEquals(new BigDecimal("14102000.00"), dto.getFinalAmount());
        assertEquals(new BigDecimal("3750000.00"), dto.getDepositAmount());
        assertEquals(new BigDecimal("10352000.00"), dto.getAmountDue());
        assertEquals("UNPAID", dto.getStatus());
    }

    @Test
    @DisplayName("UC21-TC02: Deposit cannot exceed final amount - throws conflict")
    void createInvoice_depositExceedsFinal_throwsConflict() {
        User user = new User();
        user.setUserId(5);
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(1);
        booking.setUser(user);
        booking.setTotalDeposit(new BigDecimal("99999999.00")); // Way too high deposit

        when(invoiceRepository.findFirstByRoomBooking_BookingId(1)).thenReturn(Optional.empty());
        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));
        when(invoiceRepository.sumRoomSubtotal(1)).thenReturn(new BigDecimal("1000000.00"));
        when(invoiceRepository.sumSpaSubtotal(1)).thenReturn(BigDecimal.ZERO);
        when(invoiceRepository.sumFoodSubtotal(1)).thenReturn(BigDecimal.ZERO);

        assertThrows(BusinessException.class, () -> service.createInvoice(1));
    }

    // ─── UC22: VNPay Payment URL ──────────────────────────────────────────────

    @Test
    @DisplayName("UC22-TC01: createPaymentUrl generates valid VNPay signed URL")
    void createPaymentUrlSignsVNPayRequest() {
        Invoice invoice = unpaidInvoice();
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        VNPayPaymentDTO dto = service.createPaymentUrl(1);

        assertEquals("1", dto.getOrderId());
        assertEquals(10352000L, dto.getAmount());
        assertTrue(dto.getPaymentUrl().startsWith(vnPayProperties.getPayUrl()));
        assertTrue(dto.getPaymentUrl().contains("vnp_Amount=1035200000"));
        assertTrue(dto.getPaymentUrl().contains("vnp_TxnRef=1"));
        assertTrue(dto.getPaymentUrl().contains("vnp_SecureHash="));
    }

    @Test
    @DisplayName("UC22-TC02: Cannot create payment URL for already PAID invoice")
    void createPaymentUrl_alreadyPaid_throwsConflict() {
        Invoice invoice = unpaidInvoice();
        invoice.setStatus("PAID");
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.createPaymentUrl(1));
        assertEquals("INV-409", ex.getCode());
    }

    @Test
    @DisplayName("UC22-TC03: Cannot create payment URL for CANCELLED invoice")
    void createPaymentUrl_cancelled_throwsConflict() {
        Invoice invoice = unpaidInvoice();
        invoice.setStatus("CANCELLED");
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.createPaymentUrl(1));
        assertEquals("INV-409", ex.getCode());
    }

    // ─── UC22: VNPay Callback ─────────────────────────────────────────────────

    @Test
    @DisplayName("UC22-TC04: Valid VNPay callback marks invoice PAID and logs audit trail")
    void validVNPayCallbackMarksInvoicePaidAndLogsAuditTrail() {
        Invoice invoice = unpaidInvoice();
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Amount", "1035200000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "VNP123456");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", "1");
        params.put("vnp_SecureHash", sign(params, vnPayProperties.getHashSecret()));

        InvoiceDTO dto = service.processVNPayCallback(params);

        assertEquals("PAID", dto.getStatus());
        assertEquals(BigDecimal.ZERO, dto.getAmountDue());
        assertEquals("VNP123456", dto.getVnpayTranId());
        assertNotNull(dto.getPaymentTime());

        // BR-26: Verify audit trail was written
        verify(transactionLogRepository, atLeastOnce()).save(any());
    }

    @Test
    @DisplayName("UC22-TC05: Invalid VNPay hash is rejected with 403")
    void invalidVNPayCallbackHashIsRejected() {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "VNP123456");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", "1");
        params.put("vnp_SecureHash", "invalid-hash");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.processVNPayCallback(params));

        assertEquals("INV-403", ex.getCode());
        verify(invoiceRepository, never()).save(any());
    }

    @Test
    @DisplayName("UC22-TC06: Duplicate VNPay callback (idempotent) does not re-process PAID invoice")
    void duplicateVNPayCallback_alreadyPaid_returnsExistingState() {
        Invoice invoice = unpaidInvoice();
        invoice.setStatus("PAID");
        invoice.setVnpayTranId("VNP123456");
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Amount", "1035200000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "VNP123456");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", "1");
        params.put("vnp_SecureHash", sign(params, vnPayProperties.getHashSecret()));

        // IPN should handle idempotent: invoice already PAID → return "02 Already confirmed"
        Map<String, String> response = service.processVNPayIpn(params);
        assertEquals("02", response.get("RspCode"));
    }

    @Test
    @DisplayName("UC07: createPaymentUrl returns 30% deposit when booking is PENDING_DEPOSIT")
    void createPaymentUrl_pendingDeposit_returnsDepositAmount() {
        Invoice invoice = unpaidInvoice();
        invoice.getRoomBooking().setStatus("PENDING_DEPOSIT");
        invoice.getRoomBooking().setTotalDeposit(BigDecimal.ZERO);
        invoice.setDepositAmount(BigDecimal.ZERO);
        invoice.setAmountDue(new BigDecimal("14102000.00"));
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        VNPayPaymentDTO dto = service.createPaymentUrl(1);

        assertEquals(4230600L, dto.getAmount());
        assertTrue(dto.getPaymentUrl().contains("vnp_Amount=423060000"));
    }

    @Test
    @DisplayName("UC07: VNPay deposit callback confirms booking but keeps invoice UNPAID")
    void vnpayDepositCallback_confirmsBooking_keepsInvoiceUnpaid() {
        Invoice invoice = unpaidInvoice();
        invoice.getRoomBooking().setStatus("PENDING_DEPOSIT");
        invoice.getRoomBooking().setTotalDeposit(BigDecimal.ZERO);
        invoice.setDepositAmount(BigDecimal.ZERO);
        invoice.setAmountDue(new BigDecimal("14102000.00"));
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(roomBookingRepository.save(any(RoomBooking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Amount", "423060000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "VNP-DEP-001");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", "1");
        params.put("vnp_SecureHash", sign(params, vnPayProperties.getHashSecret()));

        InvoiceDTO dto = service.processVNPayCallback(params);

        assertEquals("UNPAID", dto.getStatus());
        assertEquals("CONFIRMED", dto.getBookingStatus());
        assertEquals(new BigDecimal("4230600"), dto.getDepositAmount());
        assertEquals(new BigDecimal("9871400.00"), dto.getAmountDue());
        verify(roomBookingRepository).save(argThat(b -> "CONFIRMED".equals(b.getStatus())));
    }

    // ─── UC22: Cash Payment ───────────────────────────────────────────────────

    @Test
    @DisplayName("UC22-TC07: Cash payment marks invoice PAID without VNPay transaction")
    void cashPaymentMarksInvoicePaidWithoutVNPayTransaction() {
        Invoice invoice = unpaidInvoice();
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InvoiceDTO dto = service.markCashPayment(1);

        assertEquals("PAID", dto.getStatus());
        assertEquals(BigDecimal.ZERO, dto.getAmountDue());
        assertNull(dto.getVnpayTranId());
        assertNotNull(dto.getPaymentTime());
        // BR-26: Audit trail should be written
        verify(transactionLogRepository, atLeastOnce()).save(any());
    }

    @Test
    @DisplayName("UC22-TC08: Cannot mark already PAID invoice as cash paid again")
    void markCashPayment_alreadyPaid_throwsConflict() {
        Invoice invoice = unpaidInvoice();
        invoice.setStatus("PAID");
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        assertThrows(BusinessException.class, () -> service.markCashPayment(1));
    }

    // ─── Module 5: Checkout Lock (Consolidated Billing Constraint) ───────────

    @Test
    @DisplayName("Module5-TC01: validateCheckoutLock passes when no pending orders")
    void validateCheckoutLock_noPendingOrders_noException() {
        when(invoiceRepository.countPendingSpaSessions(1)).thenReturn(0L);
        when(invoiceRepository.countPendingFoodOrders(1)).thenReturn(0L);

        assertDoesNotThrow(() -> service.validateCheckoutLock(1));
    }

    @Test
    @DisplayName("Module5-TC02: validateCheckoutLock blocks if pending spa sessions exist")
    void validateCheckoutLock_pendingSpa_throwsConflict() {
        when(invoiceRepository.countPendingSpaSessions(1)).thenReturn(1L);
        when(invoiceRepository.countPendingFoodOrders(1)).thenReturn(0L);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.validateCheckoutLock(1));
        assertEquals("INV-409", ex.getCode());
        assertTrue(ex.getMessage().contains("Spa"));
    }

    @Test
    @DisplayName("Module5-TC03: validateCheckoutLock blocks if pending food orders exist")
    void validateCheckoutLock_pendingFood_throwsConflict() {
        when(invoiceRepository.countPendingSpaSessions(1)).thenReturn(0L);
        when(invoiceRepository.countPendingFoodOrders(1)).thenReturn(2L);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.validateCheckoutLock(1));
        assertEquals("INV-409", ex.getCode());
        assertTrue(ex.getMessage().contains("F&B"));
    }

    // ─── Module 5: performCheckout (BR-14) ───────────────────────────────────

    @Test
    @DisplayName("Module5-TC04: performCheckout sets booking CHECKED_OUT and rooms DIRTY (BR-14)")
    void performCheckout_paidInvoice_updatesBookingAndRooms() {
        Invoice invoice = unpaidInvoice();
        invoice.setStatus("PAID");
        RoomBooking booking = invoice.getRoomBooking();

        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.countPendingSpaSessions(1)).thenReturn(0L);
        when(invoiceRepository.countPendingFoodOrders(1)).thenReturn(0L);
        when(roomBookingRepository.save(any(RoomBooking.class))).thenReturn(booking);
        when(roomRepository.markRoomsAsDirtyAfterCheckout(1)).thenReturn(1);

        InvoiceDTO result = service.performCheckout(1);

        assertNotNull(result);
        // Verify booking was updated to CHECKED_OUT
        verify(roomBookingRepository).save(argThat(b -> "CHECKED_OUT".equals(b.getStatus())));
        // Verify rooms were marked DIRTY (BR-14)
        verify(roomRepository).markRoomsAsDirtyAfterCheckout(1);
    }

    @Test
    @DisplayName("Module5-TC05: performCheckout fails if invoice is not PAID")
    void performCheckout_unpaidInvoice_throwsConflict() {
        Invoice invoice = unpaidInvoice(); // Status = UNPAID
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.performCheckout(1));
        assertEquals("INV-409", ex.getCode());
        assertTrue(ex.getMessage().contains("PAID"));
    }

    @Test
    @DisplayName("Module5-TC06: performCheckout fails if there are still pending spa sessions")
    void performCheckout_paidButPendingSpa_throwsConflict() {
        Invoice invoice = unpaidInvoice();
        invoice.setStatus("PAID");

        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.countPendingSpaSessions(1)).thenReturn(1L);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.performCheckout(1));
        assertEquals("INV-409", ex.getCode());
        verify(roomRepository, never()).markRoomsAsDirtyAfterCheckout(any());
    }

    // ─── VNPay IPN ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("UC22-TC09: VNPay IPN with invalid signature returns error code 97")
    void ipnWithInvalidSignature_returns97() {
        Map<String, String> params = Map.of(
                "vnp_TxnRef", "1",
                "vnp_SecureHash", "invalid-hash"
        );

        Map<String, String> response = service.processVNPayIpn(params);
        assertEquals("97", response.get("RspCode"));
    }

    // ─── Child Food Discount Tests ──────────────────────────────────────────

    @Test
    @DisplayName("UC21-TC02: createInvoice applies 100% food discount for children under 5")
    void childUnder5FoodDiscountTest() {
        User user = new User();
        user.setUserId(5);

        RoomBooking booking = new RoomBooking();
        booking.setBookingId(1);
        booking.setUser(user);
        // 2 adults + 1 child under 5 = 3 people. Under 5 is not counted as slot.
        booking.setGuestsCount(2); 
        booking.setChildrenUnder5(1);
        booking.setChildren5to12(0);

        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1);
        invoice.setUser(user);
        invoice.setRoomBooking(booking);

        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));
        when(invoiceRepository.findFirstByRoomBooking_BookingId(1)).thenReturn(Optional.of(invoice));

        // Subtotals setup: room=0, spa=0, food=300,000 VND
        when(invoiceRepository.sumRoomSubtotal(1)).thenReturn(BigDecimal.ZERO);
        when(invoiceRepository.sumSpaSubtotal(1)).thenReturn(BigDecimal.ZERO);
        when(invoiceRepository.sumFoodSubtotal(1)).thenReturn(new BigDecimal("300000.00"));

        InvoiceDTO result = service.createInvoice(1);

        // Proportional count: 3 people total (2 adults + 1 child under 5).
        // Proportional food cost for child under 5: 300,000 * 1/3 = 100,000 VND.
        // Discount: 100,000 * 100% = 100,000 VND.
        // Expected food remaining: 300,000 - 100,000 = 200,000 VND.
        // FinalAmount (with 10% tax on 200k): 200,000 + 20,000 = 220,000 VND.
        assertEquals(new BigDecimal("100000"), result.getFoodChildDiscount());
        assertEquals(new BigDecimal("200000.00"), result.getFoodSubtotal());
        assertEquals(new BigDecimal("220000.00"), result.getFinalAmount());
    }

    @Test
    @DisplayName("UC21-TC03: createInvoice applies 30% food discount for children 5-12")
    void child5to12FoodDiscountTest() {
        User user = new User();
        user.setUserId(5);

        RoomBooking booking = new RoomBooking();
        booking.setBookingId(1);
        booking.setUser(user);
        // 2 adults + 1 child (5-12) = 3 slots total (guestsCount = 3 because 5-12 counts as slot).
        booking.setGuestsCount(3); 
        booking.setChildrenUnder5(0);
        booking.setChildren5to12(1);

        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1);
        invoice.setUser(user);
        invoice.setRoomBooking(booking);

        when(roomBookingRepository.findById(1)).thenReturn(Optional.of(booking));
        when(invoiceRepository.findFirstByRoomBooking_BookingId(1)).thenReturn(Optional.of(invoice));

        // Subtotals setup: room=0, spa=0, food=300,000 VND
        when(invoiceRepository.sumRoomSubtotal(1)).thenReturn(BigDecimal.ZERO);
        when(invoiceRepository.sumSpaSubtotal(1)).thenReturn(BigDecimal.ZERO);
        when(invoiceRepository.sumFoodSubtotal(1)).thenReturn(new BigDecimal("300000.00"));

        InvoiceDTO result = service.createInvoice(1);

        // Proportional count: 3 people total (3 slots).
        // Proportional food cost for child 5-12: 300,000 * 1/3 = 100,000 VND.
        // Discount: 100,000 * 30% = 30,000 VND.
        // Expected food remaining: 300,000 - 30,000 = 270,000 VND.
        // FinalAmount (with 10% tax on 270k): 270,000 + 27,000 = 297,000 VND.
        assertEquals(new BigDecimal("30000"), result.getFoodChildDiscount());
        assertEquals(new BigDecimal("270000.00"), result.getFoodSubtotal());
        assertEquals(new BigDecimal("297000.00"), result.getFinalAmount());
    }

    // ─── Helper methods ────────────────────────────────────────────────────────

    private Invoice unpaidInvoice() {
        User user = new User();
        user.setUserId(5);
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(1);
        booking.setUser(user);
        booking.setTotalDeposit(new BigDecimal("3750000.00"));

        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1);
        invoice.setUser(user);
        invoice.setRoomBooking(booking);
        invoice.setRoomSubtotal(new BigDecimal("12500000.00"));
        invoice.setSpaSubtotal(new BigDecimal("0.00"));
        invoice.setFoodSubtotal(new BigDecimal("320000.00"));
        invoice.setTaxAndFees(new BigDecimal("1282000.00"));
        invoice.setFinalAmount(new BigDecimal("14102000.00"));
        invoice.setDepositAmount(new BigDecimal("3750000.00"));
        invoice.setAmountDue(new BigDecimal("10352000.00"));
        invoice.setStatus("UNPAID");
        return invoice;
    }

    private String sign(Map<String, String> params, String secret) {
        try {
            Map<String, String> signedParams = new TreeMap<>(params);
            signedParams.remove("vnp_SecureHash");
            signedParams.remove("vnp_SecureHashType");
            String data = signedParams.entrySet().stream()
                    .map(entry -> entry.getKey() + "=" + entry.getValue())
                    .reduce((left, right) -> left + "&" + right)
                    .orElse("");
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
