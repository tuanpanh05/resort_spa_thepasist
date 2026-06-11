package fu.se.smms.service.impl;

import fu.se.smms.config.VNPayProperties;
import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.entity.Invoice;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.InvoiceRepository;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.service.InvoiceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class InvoiceServiceImpl implements InvoiceService {
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final InvoiceRepository invoiceRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final VNPayProperties vnPayProperties;

    public InvoiceServiceImpl(
            InvoiceRepository invoiceRepository,
            RoomBookingRepository roomBookingRepository,
            VNPayProperties vnPayProperties
    ) {
        this.invoiceRepository = invoiceRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.vnPayProperties = vnPayProperties;
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceById(Integer invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .map(this::toDto)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getInvoicesByUserId(Integer userId) {
        return invoiceRepository.findByUser_UserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public InvoiceDTO createInvoice(Integer bookingId) {
        Invoice invoice = invoiceRepository.findFirstByRoomBooking_BookingId(bookingId)
                .orElseGet(() -> buildInvoiceForBooking(bookingId));

        if (!"PAID".equals(invoice.getStatus())) {
            recalculate(invoice, bookingId);
            invoice = invoiceRepository.save(invoice);
        }

        return toDto(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public VNPayPaymentDTO createPaymentUrl(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));

        if ("PAID".equals(invoice.getStatus())) {
            throw conflict("Invoice is already paid");
        }
        if ("CANCELLED".equals(invoice.getStatus())) {
            throw conflict("Cancelled invoice cannot be paid");
        }

        BigDecimal payableAmount = payableAmount(invoice);
        long amountInVnpayUnit = payableAmount
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
        String orderId = invoice.getInvoiceId().toString();
        String orderInfo = "Thanh toan hoa don " + invoice.getInvoiceId();

        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Version", vnPayProperties.getVersion());
        params.put("vnp_Command", vnPayProperties.getCommand());
        params.put("vnp_TmnCode", vnPayProperties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amountInVnpayUnit));
        params.put("vnp_CurrCode", vnPayProperties.getCurrCode());
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", vnPayProperties.getOrderType());
        params.put("vnp_Locale", vnPayProperties.getLocale());
        params.put("vnp_ReturnUrl", vnPayProperties.getReturnUrl());
        params.put("vnp_IpAddr", currentClientIp());
        params.put("vnp_CreateDate", LocalDateTime.now().format(VNPAY_DATE_FORMAT));
        params.put("vnp_ExpireDate", LocalDateTime.now()
                .plusMinutes(vnPayProperties.getExpireMinutes())
                .format(VNPAY_DATE_FORMAT));

        String query = buildQuery(params);
        String secureHash = hmacSha512(vnPayProperties.getHashSecret(), query);

        VNPayPaymentDTO dto = new VNPayPaymentDTO();
        dto.setOrderId(orderId);
        dto.setAmount(payableAmount.setScale(0, RoundingMode.HALF_UP).longValueExact());
        dto.setOrderInfo(orderInfo);
        dto.setReturnUrl(vnPayProperties.getReturnUrl());
        dto.setPaymentUrl(vnPayProperties.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash);
        dto.setSecureHash(secureHash);
        return dto;
    }

    @Override
    @Transactional
    public InvoiceDTO markCashPayment(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));

        if ("CANCELLED".equals(invoice.getStatus())) {
            throw conflict("Cancelled invoice cannot be paid");
        }

        invoice.setStatus("PAID");
        invoice.setPaymentTime(LocalDateTime.now());
        invoice.setVnpayTranId(null);

        RoomBooking booking = invoice.getRoomBooking();
        if (booking != null) {
            booking.setStatus("CONFIRMED");
            roomBookingRepository.save(booking);
        }

        return toDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceDTO processPaymentCallback(VNPayPaymentDTO paymentResult) {
        Integer invoiceId = parseInvoiceId(paymentResult.getOrderId());
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));

        if ("PAID".equals(invoice.getStatus())) {
            return toDto(invoice);
        }

        boolean success = "00".equals(paymentResult.getResponseCode())
                && (paymentResult.getTransactionStatus() == null || "00".equals(paymentResult.getTransactionStatus()));

        if (success) {
            invoice.setStatus("PAID");
            invoice.setVnpayTranId(paymentResult.getTransactionNo());
            invoice.setPaymentTime(LocalDateTime.now());

            RoomBooking booking = invoice.getRoomBooking();
            if (booking != null) {
                booking.setStatus("CONFIRMED");
                roomBookingRepository.save(booking);
            }
        }

        return toDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceDTO processVNPayCallback(Map<String, String> callbackParams) {
        verifyVNPaySignature(callbackParams);

        VNPayPaymentDTO dto = new VNPayPaymentDTO();
        dto.setOrderId(callbackParams.get("vnp_TxnRef"));
        dto.setResponseCode(callbackParams.get("vnp_ResponseCode"));
        dto.setTransactionStatus(callbackParams.get("vnp_TransactionStatus"));
        dto.setTransactionNo(callbackParams.get("vnp_TransactionNo"));
        dto.setSecureHash(callbackParams.get("vnp_SecureHash"));
        validateVNPayAmount(dto.getOrderId(), callbackParams.get("vnp_Amount"));
        return processPaymentCallback(dto);
    }

    @Override
    @Transactional
    public Map<String, String> processVNPayIpn(Map<String, String> callbackParams) {
        try {
            verifyVNPaySignature(callbackParams);
            String orderId = callbackParams.get("vnp_TxnRef");
            Invoice invoice = invoiceRepository.findById(parseInvoiceId(orderId))
                    .orElse(null);
            if (invoice == null) {
                return ipnResponse("01", "Order not found");
            }
            if (!isVNPayAmountValid(invoice, callbackParams.get("vnp_Amount"))) {
                return ipnResponse("04", "Invalid amount");
            }
            if ("PAID".equals(invoice.getStatus())) {
                return ipnResponse("02", "Order already confirmed");
            }

            VNPayPaymentDTO dto = new VNPayPaymentDTO();
            dto.setOrderId(orderId);
            dto.setResponseCode(callbackParams.get("vnp_ResponseCode"));
            dto.setTransactionStatus(callbackParams.get("vnp_TransactionStatus"));
            dto.setTransactionNo(callbackParams.get("vnp_TransactionNo"));
            processPaymentCallback(dto);
            return ipnResponse("00", "Confirm Success");
        } catch (BusinessException ex) {
            if ("INV-403".equals(ex.getCode())) {
                return ipnResponse("97", "Invalid signature");
            }
            return ipnResponse("99", ex.getMessage());
        } catch (Exception ex) {
            return ipnResponse("99", "Unknown error");
        }
    }

    private Invoice buildInvoiceForBooking(Integer bookingId) {
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> notFound("Room booking not found: " + bookingId));

        Invoice invoice = new Invoice();
        invoice.setUser(booking.getUser());
        invoice.setRoomBooking(booking);
        invoice.setStatus("UNPAID");
        return invoice;
    }

    private void recalculate(Invoice invoice, Integer bookingId) {
        BigDecimal roomSubtotal = defaultZero(invoiceRepository.sumRoomSubtotal(bookingId));
        BigDecimal spaSubtotal = defaultZero(invoiceRepository.sumSpaSubtotal(bookingId));
        BigDecimal foodSubtotal = defaultZero(invoiceRepository.sumFoodSubtotal(bookingId));
        BigDecimal taxableBase = roomSubtotal.add(spaSubtotal).add(foodSubtotal);
        BigDecimal taxAndFees = taxableBase.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalAmount = taxableBase.add(taxAndFees);
        BigDecimal depositAmount = defaultZero(invoice.getRoomBooking().getTotalDeposit());
        BigDecimal amountDue = finalAmount.subtract(depositAmount);
        if (amountDue.signum() < 0) {
            throw conflict("Booking deposit cannot exceed invoice final amount");
        }

        invoice.setRoomSubtotal(roomSubtotal);
        invoice.setSpaSubtotal(spaSubtotal);
        invoice.setFoodSubtotal(foodSubtotal);
        invoice.setTaxAndFees(taxAndFees);
        invoice.setFinalAmount(finalAmount);
        invoice.setDepositAmount(depositAmount);
        invoice.setAmountDue(amountDue);
        if (invoice.getStatus() == null) {
            invoice.setStatus("UNPAID");
        }
    }

    private InvoiceDTO toDto(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setUserId(invoice.getUser() == null ? null : invoice.getUser().getUserId());
        dto.setBookingId(invoice.getRoomBooking() == null ? null : invoice.getRoomBooking().getBookingId());
        dto.setRoomSubtotal(invoice.getRoomSubtotal());
        dto.setSpaSubtotal(invoice.getSpaSubtotal());
        dto.setFoodSubtotal(invoice.getFoodSubtotal());
        dto.setTaxAndFees(invoice.getTaxAndFees());
        dto.setFinalAmount(invoice.getFinalAmount());
        dto.setDepositAmount(invoice.getDepositAmount());
        dto.setAmountDue(invoice.getAmountDue());
        dto.setStatus(invoice.getStatus());
        dto.setVnpayTranId(invoice.getVnpayTranId());
        dto.setPaymentTime(invoice.getPaymentTime());
        return dto;
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Integer parseInvoiceId(String orderId) {
        try {
            return Integer.valueOf(orderId);
        } catch (NumberFormatException | NullPointerException ex) {
            throw new BusinessException("INV-001", HttpStatus.BAD_REQUEST, "Invalid VNPay order id");
        }
    }

    private void verifyVNPaySignature(Map<String, String> callbackParams) {
        String receivedHash = callbackParams.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            throw new BusinessException("INV-001", HttpStatus.BAD_REQUEST, "Missing VNPay secure hash");
        }

        Map<String, String> signedParams = new TreeMap<>(callbackParams);
        signedParams.remove("vnp_SecureHash");
        signedParams.remove("vnp_SecureHashType");
        String calculatedHash = hmacSha512(vnPayProperties.getHashSecret(), buildQuery(signedParams));

        if (!calculatedHash.equalsIgnoreCase(receivedHash)) {
            throw new BusinessException("INV-403", HttpStatus.FORBIDDEN, "Invalid VNPay secure hash");
        }
    }

    private void validateVNPayAmount(String orderId, String rawAmount) {
        Invoice invoice = invoiceRepository.findById(parseInvoiceId(orderId))
                .orElseThrow(() -> notFound("Invoice not found: " + orderId));
        if (!isVNPayAmountValid(invoice, rawAmount)) {
            throw conflict("Invalid VNPay amount");
        }
    }

    private boolean isVNPayAmountValid(Invoice invoice, String rawAmount) {
        try {
            long expected = payableAmount(invoice)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValueExact();
            return expected == Long.parseLong(rawAmount);
        } catch (Exception ex) {
            return false;
        }
    }

    private Map<String, String> ipnResponse(String rspCode, String message) {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("RspCode", rspCode);
        response.put("Message", message);
        return response;
    }

    private BigDecimal payableAmount(Invoice invoice) {
        BigDecimal amountDue = defaultZero(invoice.getAmountDue());
        if (amountDue.signum() > 0) {
            return amountDue;
        }
        return defaultZero(invoice.getFinalAmount());
    }

    private String currentClientIp() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return "127.0.0.1";
        }
        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String buildQuery(Map<String, String> params) {
        return params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception ex) {
            throw new BusinessException("INV-500", HttpStatus.INTERNAL_SERVER_ERROR, "Cannot sign VNPay request");
        }
    }

    private BusinessException notFound(String message) {
        return new BusinessException("INV-404", HttpStatus.NOT_FOUND, message);
    }

    private BusinessException conflict(String message) {
        return new BusinessException("INV-409", HttpStatus.CONFLICT, message);
    }
}
