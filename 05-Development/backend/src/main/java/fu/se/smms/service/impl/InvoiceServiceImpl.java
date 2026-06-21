package fu.se.smms.service.impl;

import fu.se.smms.config.VNPayProperties;
import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.entity.Invoice;
import fu.se.smms.entity.PaymentTransactionLog;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.SystemConfiguration;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.InvoiceRepository;
import fu.se.smms.repository.FoodOrderRepository;
import fu.se.smms.repository.PaymentTransactionLogRepository;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomRepository;
import fu.se.smms.repository.SystemConfigurationRepository;
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
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(InvoiceServiceImpl.class);
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final InvoiceRepository invoiceRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final RoomRepository roomRepository;
    private final PaymentTransactionLogRepository transactionLogRepository;
    private final VNPayProperties vnPayProperties;
    private final SystemConfigurationRepository systemConfigurationRepository;
    private final FoodOrderRepository foodOrderRepository;

    public InvoiceServiceImpl(
            InvoiceRepository invoiceRepository,
            RoomBookingRepository roomBookingRepository,
            RoomRepository roomRepository,
            PaymentTransactionLogRepository transactionLogRepository,
            VNPayProperties vnPayProperties,
            SystemConfigurationRepository systemConfigurationRepository,
            FoodOrderRepository foodOrderRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.roomRepository = roomRepository;
        this.transactionLogRepository = transactionLogRepository;
        this.vnPayProperties = vnPayProperties;
        this.systemConfigurationRepository = systemConfigurationRepository;
        this.foodOrderRepository = foodOrderRepository;
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
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
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
        String hashData = buildHashData(params);
        log.info("[VNPay Debug] hashSecret: {}", vnPayProperties.getHashSecret());
        log.info("[VNPay Debug] hashData: {}", hashData);
        String secureHash = hmacSha512(vnPayProperties.getHashSecret(), hashData);
        log.info("[VNPay Debug] secureHash: {}", secureHash);

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

        if ("PAID".equals(invoice.getStatus())) {
            throw conflict("Invoice is already paid");
        }
        if ("CANCELLED".equals(invoice.getStatus())) {
            throw conflict("Cancelled invoice cannot be paid");
        }

        RoomBooking booking = invoice.getRoomBooking();
        BigDecimal payableAmount = payableAmount(invoice);

        if (booking != null && "PENDING_DEPOSIT".equals(booking.getStatus())) {
            // Cash deposit payment flow
            booking.setStatus("CONFIRMED");
            booking.setTotalDeposit(payableAmount);
            roomBookingRepository.save(booking);

            invoice.setDepositAmount(payableAmount);
            invoice.setAmountDue(invoice.getFinalAmount().subtract(payableAmount));
            invoice.setPaymentTime(LocalDateTime.now());

            Invoice savedInvoice = invoiceRepository.save(invoice);
            writeTransactionLog(savedInvoice, "CASH", payableAmount, null, "00", "PAID");
            return toDto(savedInvoice);
        } else {
            // Final check-out payment flow
            invoice.setStatus("PAID");
            invoice.setPaymentTime(LocalDateTime.now());
            invoice.setVnpayTranId(null);

            Invoice savedInvoice = invoiceRepository.save(invoice);

            // BR-26: Write immutable audit trail log for cash payment
            writeTransactionLog(savedInvoice, "CASH", payableAmount, null, "00", "PAID");

            return toDto(savedInvoice);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void validateCheckoutLock(Integer bookingId) {
        // Module 5 - Consolidated Billing Constraint:
        // Receptionist cannot check out if there are pending spa sessions
        Long pendingSpa = invoiceRepository.countPendingSpaSessions(bookingId);
        if (pendingSpa != null && pendingSpa > 0) {
            throw new BusinessException("INV-409", HttpStatus.CONFLICT,
                    "Không thể Check-out: Còn " + pendingSpa +
                    " buổi trị liệu Spa chưa hoàn thành hoặc chưa xác nhận. " +
                    "Vui lòng hoàn tất tất cả lịch Spa trước khi trả phòng.");
        }
        // Also check for pending food orders
        Long pendingFood = invoiceRepository.countPendingFoodOrders(bookingId);
        if (pendingFood != null && pendingFood > 0) {
            throw new BusinessException("INV-409", HttpStatus.CONFLICT,
                    "Không thể Check-out: Còn " + pendingFood +
                    " đơn gọi món F&B đang chế biến hoặc chờ xử lý. " +
                    "Vui lòng đợi tất cả đơn ăn uống hoàn tất trước khi trả phòng.");
        }
    }

    @Override
    @Transactional
    public InvoiceDTO performCheckout(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));

        if (!"PAID".equals(invoice.getStatus())) {
            throw conflict("Cannot perform checkout: Invoice is not yet PAID. Current status: " + invoice.getStatus());
        }

        RoomBooking booking = invoice.getRoomBooking();
        if (booking == null) {
            throw notFound("Room booking not found for invoice: " + invoiceId);
        }

        // Validate checkout lock - ensure no pending orders
        validateCheckoutLock(booking.getBookingId());

        // Update booking status to CHECKED_OUT
        booking.setStatus("CHECKED_OUT");
        roomBookingRepository.save(booking);

        // BR-14: Mark associated rooms as DIRTY (Vacant/Needs Cleaning)
        int updatedRooms = roomRepository.markRoomsAsDirtyAfterCheckout(booking.getBookingId());
        if (updatedRooms == 0) {
            // Log warning - booking may not have room_booking_detail records but still proceed
        }

        return toDto(invoice);
    }

    @Override
    @Transactional
    public InvoiceDTO earlyCheckout(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));

        if (!"PAID".equals(invoice.getStatus())) {
            throw conflict("Cannot perform checkout: Invoice is not yet PAID. Current status: " + invoice.getStatus());
        }

        RoomBooking booking = invoice.getRoomBooking();
        if (booking == null) {
            throw notFound("Room booking not found for invoice: " + invoiceId);
        }

        // Force-cancel all PENDING / PREPARING food orders for this booking
        List<fu.se.smms.entity.FoodOrder> pendingOrders = foodOrderRepository
                .findByRoomBooking_BookingId(booking.getBookingId())
                .stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus())
                          || "PREPARING".equalsIgnoreCase(o.getStatus()))
                .toList();

        for (fu.se.smms.entity.FoodOrder order : pendingOrders) {
            order.setStatus("CANCELLED");
        }
        if (!pendingOrders.isEmpty()) {
            foodOrderRepository.saveAll(pendingOrders);
            log.info("[EarlyCheckout] Force-cancelled {} F&B order(s) for bookingId={}",
                    pendingOrders.size(), booking.getBookingId());
        }

        // Update booking status to CHECKED_OUT
        booking.setStatus("CHECKED_OUT");
        roomBookingRepository.save(booking);

        // BR-14: Mark associated rooms as DIRTY (Vacant/Needs Cleaning)
        roomRepository.markRoomsAsDirtyAfterCheckout(booking.getBookingId());

        return toDto(invoice);
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

        RoomBooking booking = invoice.getRoomBooking();
        if (booking != null && "CONFIRMED".equals(booking.getStatus())
                && defaultZero(invoice.getDepositAmount()).signum() > 0) {
            return toDto(invoice);
        }

        BigDecimal paymentAmount = payableAmount(invoice);

        boolean success = "00".equals(paymentResult.getResponseCode())
                && (paymentResult.getTransactionStatus() == null || "00".equals(paymentResult.getTransactionStatus()));

        if (success) {
            if (booking != null && "PENDING_DEPOSIT".equals(booking.getStatus())) {
                booking.setStatus("CONFIRMED");
                booking.setTotalDeposit(paymentAmount);
                roomBookingRepository.save(booking);

                invoice.setDepositAmount(paymentAmount);
                invoice.setAmountDue(invoice.getFinalAmount().subtract(paymentAmount));
                invoice.setVnpayTranId(paymentResult.getTransactionNo());
                invoice.setPaymentTime(LocalDateTime.now());
            } else {
                invoice.setStatus("PAID");
                invoice.setVnpayTranId(paymentResult.getTransactionNo());
                invoice.setPaymentTime(LocalDateTime.now());
            }
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // BR-26: Write audit trail for all VNPay callbacks (including failed ones)
        if (success) {
            writeTransactionLog(savedInvoice, "VNPAY", paymentAmount,
                    paymentResult.getTransactionNo(), paymentResult.getResponseCode(), "PAID");
        } else {
            writeTransactionLog(savedInvoice, "VNPAY", paymentAmount,
                    paymentResult.getTransactionNo(), paymentResult.getResponseCode(), "FAILED");
        }

        return toDto(savedInvoice);
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
            RoomBooking booking = invoice.getRoomBooking();
            if (booking != null && "CONFIRMED".equals(booking.getStatus())
                    && defaultZero(invoice.getDepositAmount()).signum() > 0) {
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
        if (invoice.getUser() != null) {
            dto.setCustomerName(invoice.getUser().getFullName());
        } else {
            dto.setCustomerName("N/A");
        }
        if (invoice.getRoomBooking() != null) {
            dto.setBookingStatus(invoice.getRoomBooking().getStatus());
            dto.setCheckInDate(invoice.getRoomBooking().getCheckInDate());
            dto.setCheckOutDate(invoice.getRoomBooking().getCheckOutDate());
            dto.setCreatedAt(invoice.getRoomBooking().getCreatedAt());
            if (invoice.getRoomBooking().getDetails() != null) {
                String roomNumbers = invoice.getRoomBooking().getDetails().stream()
                    .map(detail -> detail.getRoom() != null ? detail.getRoom().getRoomNumber() : "")
                    .filter(num -> !num.isBlank())
                    .collect(java.util.stream.Collectors.joining(", "));
                dto.setRoomNumber(roomNumbers.isEmpty() ? "N/A" : roomNumbers);
            } else {
                dto.setRoomNumber("N/A");
            }
        } else {
            dto.setRoomNumber("N/A");
        }
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

        Map<String, String> signedParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : callbackParams.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (key.startsWith("vnp_") && !"vnp_SecureHash".equals(key) && !"vnp_SecureHashType".equals(key)) {
                signedParams.put(key, value);
            }
        }

        String hashData = buildHashData(signedParams);
        String calculatedHash = hmacSha512(vnPayProperties.getHashSecret(), hashData);

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
        RoomBooking booking = invoice.getRoomBooking();
        if (booking != null && "PENDING_DEPOSIT".equals(booking.getStatus())) {
            BigDecimal finalAmount = defaultZero(invoice.getFinalAmount());
            return finalAmount.multiply(getDepositRatio()).setScale(0, RoundingMode.CEILING);
        }

        BigDecimal amountDue = defaultZero(invoice.getAmountDue());
        if (amountDue.signum() > 0) {
            return amountDue;
        }
        return defaultZero(invoice.getFinalAmount());
    }

    private BigDecimal getDepositRatio() {
        return systemConfigurationRepository.findByConfigKey("deposit_ratio")
                .map(SystemConfiguration::getConfigValue)
                .map(BigDecimal::new)
                .orElse(new BigDecimal("0.30"));
    }

    private String currentClientIp() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return "127.0.0.1";
        }
        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        String ip;
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            ip = forwardedFor.split(",")[0].trim();
        } else {
            ip = request.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }

    private String buildQuery(Map<String, String> params) {
        return params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String buildHashData(Map<String, String> params) {
        return params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .map(entry -> entry.getKey() + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String encode(String value) {
        if (value == null) return "";
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

    /**
     * BR-26: Transaction Audit Trail.
     * Writes an immutable transaction log record for every payment attempt.
     * This method must NOT throw exceptions (best-effort logging).
     */
    private void writeTransactionLog(Invoice invoice, String paymentMethod, BigDecimal amount,
                                      String gatewayRef, String responseCode, String status) {
        try {
            PaymentTransactionLog log = new PaymentTransactionLog();
            log.setInvoice(invoice);
            log.setPaymentMethod(paymentMethod);
            log.setAmount(amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            log.setGatewayRef(gatewayRef);
            log.setResponseCode(responseCode);
            log.setStatus(status);
            log.setClientIp(currentClientIp());
            transactionLogRepository.save(log);
        } catch (Exception ex) {
            // Log to application log but do not fail the payment flow
            // per BR-26: audit is best-effort for individual log rows but payment state is authoritative
        }
    }
}
