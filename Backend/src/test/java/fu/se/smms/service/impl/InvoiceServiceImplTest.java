package fu.se.smms.service.impl;

import fu.se.smms.config.VNPayProperties;
import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.entity.Invoice;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.InvoiceRepository;
import fu.se.smms.repository.RoomBookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InvoiceServiceImplTest {
    private InvoiceRepository invoiceRepository;
    private RoomBookingRepository roomBookingRepository;
    private InvoiceServiceImpl service;
    private VNPayProperties vnPayProperties;

    @BeforeEach
    void setUp() {
        invoiceRepository = mock(InvoiceRepository.class);
        roomBookingRepository = mock(RoomBookingRepository.class);

        vnPayProperties = new VNPayProperties();
        vnPayProperties.setPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        vnPayProperties.setReturnUrl("http://localhost:8080/api/invoices/vnpay-callback");
        vnPayProperties.setTmnCode("TEST");
        vnPayProperties.setHashSecret("test-secret");

        service = new InvoiceServiceImpl(invoiceRepository, roomBookingRepository, vnPayProperties);
    }

    @Test
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
        assertEquals(new BigDecimal("1282000.00"), dto.getTaxAndFees());
        assertEquals(new BigDecimal("14102000.00"), dto.getFinalAmount());
        assertEquals(new BigDecimal("3750000.00"), dto.getDepositAmount());
        assertEquals(new BigDecimal("10352000.00"), dto.getAmountDue());
        assertEquals("UNPAID", dto.getStatus());
    }

    @Test
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
    void validVNPayCallbackMarksInvoicePaid() {
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
        assertEquals("VNP123456", dto.getVnpayTranId());
        assertNotNull(dto.getPaymentTime());
    }

    @Test
    void invalidVNPayCallbackHashIsRejected() {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "VNP123456");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", "1");
        params.put("vnp_SecureHash", "invalid");

        BusinessException ex = assertThrows(BusinessException.class, () -> service.processVNPayCallback(params));

        assertEquals("INV-403", ex.getCode());
        verify(invoiceRepository, never()).save(any());
    }

    @Test
    void cashPaymentMarksInvoicePaidWithoutVNPayTransaction() {
        Invoice invoice = unpaidInvoice();
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InvoiceDTO dto = service.markCashPayment(1);

        assertEquals("PAID", dto.getStatus());
        assertNull(dto.getVnpayTranId());
        assertNotNull(dto.getPaymentTime());
    }

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
