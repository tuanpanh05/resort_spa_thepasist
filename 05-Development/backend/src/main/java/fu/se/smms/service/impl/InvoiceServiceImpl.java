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
import fu.se.smms.repository.SpaBookingRepository;
import fu.se.smms.entity.SpaBooking;
import fu.se.smms.entity.FoodOrder;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomRepository;
import fu.se.smms.repository.SystemConfigurationRepository;
import fu.se.smms.service.EmailService;
import fu.se.smms.service.InvoiceService;
import fu.se.smms.entity.Voucher;
import fu.se.smms.repository.VoucherRepository;
import fu.se.smms.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletRequest;
import java.util.concurrent.CompletableFuture;
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
    private final EmailService emailService;
    private final SpaBookingRepository spaBookingRepository;

    @Autowired
    private VoucherRepository voucherRepository;
    @Autowired
    private VoucherService voucherService;

    public InvoiceServiceImpl(
            InvoiceRepository invoiceRepository,
            RoomBookingRepository roomBookingRepository,
            RoomRepository roomRepository,
            PaymentTransactionLogRepository transactionLogRepository,
            VNPayProperties vnPayProperties,
            SystemConfigurationRepository systemConfigurationRepository,
            FoodOrderRepository foodOrderRepository,
            EmailService emailService,
            SpaBookingRepository spaBookingRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.roomRepository = roomRepository;
        this.transactionLogRepository = transactionLogRepository;
        this.vnPayProperties = vnPayProperties;
        this.systemConfigurationRepository = systemConfigurationRepository;
        this.foodOrderRepository = foodOrderRepository;
        this.emailService = emailService;
        this.spaBookingRepository = spaBookingRepository;
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
    @Transactional
    public VNPayPaymentDTO createPaymentUrl(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));

        if ("PAID".equals(invoice.getStatus())) {
            throw conflict("Invoice is already paid");
        }
        if ("CANCELLED".equals(invoice.getStatus())) {
            throw conflict("Cancelled invoice cannot be paid");
        }

        RoomBooking booking = invoice.getRoomBooking();
        if (booking != null) {
            recalculate(invoice, booking.getBookingId());
            invoice = invoiceRepository.save(invoice);
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
        if (booking != null) {
            recalculate(invoice, booking.getBookingId());
        }
        BigDecimal payableAmount = payableAmount(invoice);

        if (booking != null && "PENDING_DEPOSIT".equals(booking.getStatus())) {
            // Cash deposit payment flow
            booking.setStatus("CONFIRMED");
            booking.setTotalDeposit(payableAmount);
            roomBookingRepository.save(booking);

            invoice.setDepositAmount(payableAmount);
            invoice.setAmountDue(invoice.getFinalAmount().subtract(payableAmount));
            invoice.setPaymentTime(LocalDateTime.now());
            
            incrementVoucherUsage(invoice);

            Invoice savedInvoice = invoiceRepository.save(invoice);
            writeTransactionLog(savedInvoice, "CASH", payableAmount, null, "00", "PAID");
            triggerRoomBookingConfirmationEmail(savedInvoice, booking);
            return toDto(savedInvoice);
        } else {
            // Final check-out payment flow
            invoice.setStatus("PAID");
            invoice.setAmountDue(BigDecimal.ZERO);
            invoice.setPaymentTime(LocalDateTime.now());
            invoice.setVnpayTranId(null);

            if (invoice.getDepositAmount() == null || invoice.getDepositAmount().compareTo(BigDecimal.ZERO) == 0) {
                incrementVoucherUsage(invoice);
            }

            Invoice savedInvoice = invoiceRepository.save(invoice);

            // BR-26: Write immutable audit trail log for cash payment
            writeTransactionLog(savedInvoice, "CASH", payableAmount, null, "00", "PAID");

            // Auto-send invoice (receipt) email after successful full payment
            triggerInvoiceEmail(savedInvoice);

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

        boolean triggerEmail = false;
        if (success) {
            if (booking != null && "PENDING_DEPOSIT".equals(booking.getStatus())) {
                booking.setStatus("CONFIRMED");
                booking.setTotalDeposit(paymentAmount);
                roomBookingRepository.save(booking);

                invoice.setDepositAmount(paymentAmount);
                invoice.setAmountDue(invoice.getFinalAmount().subtract(paymentAmount));
                invoice.setVnpayTranId(paymentResult.getTransactionNo());
                invoice.setPaymentTime(LocalDateTime.now());
                triggerEmail = true;

                incrementVoucherUsage(invoice);
            } else {
                invoice.setStatus("PAID");
                invoice.setAmountDue(BigDecimal.ZERO);
                invoice.setVnpayTranId(paymentResult.getTransactionNo());
                invoice.setPaymentTime(LocalDateTime.now());

                if (invoice.getDepositAmount() == null || invoice.getDepositAmount().compareTo(BigDecimal.ZERO) == 0) {
                    incrementVoucherUsage(invoice);
                }
            }
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);

        if (triggerEmail && booking != null) {
            triggerRoomBookingConfirmationEmail(savedInvoice, booking);
        }

        // Auto-send invoice (receipt) email when invoice is fully PAID
        if (success && "PAID".equals(savedInvoice.getStatus())) {
            triggerInvoiceEmail(savedInvoice);
        }

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

        String orderId = callbackParams.get("vnp_TxnRef");
        Integer invoiceId = parseInvoiceId(orderId);
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

        validateVNPayAmount(orderId, callbackParams.get("vnp_Amount"));

        VNPayPaymentDTO dto = new VNPayPaymentDTO();
        dto.setOrderId(orderId);
        dto.setResponseCode(callbackParams.get("vnp_ResponseCode"));
        dto.setTransactionStatus(callbackParams.get("vnp_TransactionStatus"));
        dto.setTransactionNo(callbackParams.get("vnp_TransactionNo"));
        dto.setSecureHash(callbackParams.get("vnp_SecureHash"));
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
            if ("PAID".equals(invoice.getStatus())) {
                return ipnResponse("02", "Order already confirmed");
            }
            RoomBooking booking = invoice.getRoomBooking();
            if (booking != null && "CONFIRMED".equals(booking.getStatus())
                    && defaultZero(invoice.getDepositAmount()).signum() > 0) {
                return ipnResponse("02", "Order already confirmed");
            }
            if (!isVNPayAmountValid(invoice, callbackParams.get("vnp_Amount"))) {
                return ipnResponse("04", "Invalid amount");
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

        RoomBooking booking = invoice.getRoomBooking();
        BigDecimal childDiscount = BigDecimal.ZERO;
        if (booking != null) {
            childDiscount = calculateSpaChildDiscount(booking);
            spaSubtotal = spaSubtotal.subtract(childDiscount);
            if (spaSubtotal.signum() < 0) {
                spaSubtotal = BigDecimal.ZERO;
            }
        }

        BigDecimal taxableBase = roomSubtotal.add(spaSubtotal).add(foodSubtotal);
        BigDecimal taxAndFees = taxableBase.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableBase.add(taxAndFees);

        // Apply voucher discount
        BigDecimal discount = BigDecimal.ZERO;
        if (invoice.getVoucher() != null) {
            Voucher voucher = invoice.getVoucher();
            if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
                discount = grandTotal.multiply(voucher.getDiscountValue().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                    discount = voucher.getMaxDiscountAmount();
                }
            } else if ("FIXED_AMOUNT".equalsIgnoreCase(voucher.getDiscountType())) {
                discount = voucher.getDiscountValue();
            }
            if (discount.compareTo(grandTotal) > 0) {
                discount = grandTotal;
            }
        }
        discount = discount.setScale(0, RoundingMode.HALF_UP);
        invoice.setDiscountAmount(discount);

        BigDecimal finalAmount = grandTotal.subtract(discount);
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

    private BigDecimal calculateSpaChildDiscount(RoomBooking booking) {
        if (booking == null) return BigDecimal.ZERO;

        int adults = booking.getGuestsCount() != null ? booking.getGuestsCount() : 1;
        int under5 = booking.getChildrenUnder5() != null ? booking.getChildrenUnder5() : 0;
        int between5And12 = booking.getChildren5to12() != null ? booking.getChildren5to12() : 0;

        int totalGuests = adults + under5 + between5And12;
        if (totalGuests <= 0) return BigDecimal.ZERO;

        BigDecimal activeSpaBookingsSum = BigDecimal.ZERO;
        try {
            List<SpaBooking> spaBookings = spaBookingRepository.findByRoomBookingId(booking.getBookingId());
            if (spaBookings != null) {
                for (SpaBooking sb : spaBookings) {
                    if (sb.getIsPackageIncluded() != null && !sb.getIsPackageIncluded()) {
                        BigDecimal price = sb.getPriceAtBooking() != null ? sb.getPriceAtBooking() : BigDecimal.ZERO;
                        if ("CONFIRMED".equalsIgnoreCase(sb.getStatus()) || "COMPLETED".equalsIgnoreCase(sb.getStatus())) {
                            activeSpaBookingsSum = activeSpaBookingsSum.add(price);
                        } else if ("CANCELLED".equalsIgnoreCase(sb.getStatus()) && sb.getRefundAmount() != null) {
                            activeSpaBookingsSum = activeSpaBookingsSum.add(price.subtract(sb.getRefundAmount()));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error calculating spa child discount: " + e.getMessage());
        }

        if (activeSpaBookingsSum.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discountUnder5 = activeSpaBookingsSum
                .multiply(BigDecimal.valueOf(under5))
                .divide(BigDecimal.valueOf(totalGuests), 4, RoundingMode.HALF_UP);

        BigDecimal discount5to12 = activeSpaBookingsSum
                .multiply(BigDecimal.valueOf(between5And12))
                .multiply(new BigDecimal("0.30"))
                .divide(BigDecimal.valueOf(totalGuests), 4, RoundingMode.HALF_UP);

        return discountUnder5.add(discount5to12).setScale(0, RoundingMode.HALF_UP);
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
        dto.setDiscountAmount(invoice.getDiscountAmount());
        if (invoice.getVoucher() != null) {
            dto.setVoucherCode(invoice.getVoucher().getCode());
        }
        BigDecimal childDiscount = calculateSpaChildDiscount(invoice.getRoomBooking());
        dto.setSpaChildDiscount(childDiscount);
        if (invoice.getUser() != null) {
            dto.setCustomerName(invoice.getUser().getFullName());
        } else {
            dto.setCustomerName("N/A");
        }
        if (invoice.getRoomBooking() != null) {
            RoomBooking rb = invoice.getRoomBooking();
            dto.setBookingStatus(rb.getStatus());
            dto.setCheckInDate(rb.getCheckInDate());
            dto.setCheckOutDate(rb.getCheckOutDate());
            dto.setCreatedAt(rb.getCreatedAt());
            dto.setCancellationReason(rb.getCancellationReason());
            dto.setCancellationTime(rb.getCancellationTime());
            if (rb.getUser() != null) {
                dto.setCustomerPhone(rb.getUser().getPhone());
                dto.setCustomerEmail(rb.getUser().getEmail());
            }

            // Gather all cancellations and calculate total refund
            StringBuilder sb = new StringBuilder();
            BigDecimal totalRefund = BigDecimal.ZERO;

            if ("CANCELLED".equalsIgnoreCase(rb.getStatus())) {
                sb.append("- Hủy toàn bộ đơn đặt phòng");
                if (rb.getRefundAmount() != null) {
                    totalRefund = totalRefund.add(rb.getRefundAmount());
                    sb.append(" (Hoàn tiền cọc: ").append(String.format("%,.0f ₫", rb.getRefundAmount())).append(")");
                }
                sb.append("\n");
            } else if (rb.getCancellationReason() != null && !rb.getCancellationReason().isBlank()) {
                sb.append("- ").append(rb.getCancellationReason()).append("\n");
                if (rb.getRefundAmount() != null) {
                    totalRefund = totalRefund.add(rb.getRefundAmount());
                }
            }

            try {
                List<SpaBooking> cancelledSpas = spaBookingRepository.findByRoomBookingId(rb.getBookingId());
                if (cancelledSpas != null) {
                    for (SpaBooking spa : cancelledSpas) {
                        if ("CANCELLED".equalsIgnoreCase(spa.getStatus())) {
                            sb.append("- Hủy lịch Spa: ").append(spa.getSpaService() != null ? spa.getSpaService().getName() : "Dịch vụ Spa");
                            if (spa.getRefundAmount() != null) {
                                totalRefund = totalRefund.add(spa.getRefundAmount());
                                sb.append(" (Hoàn trả: ").append(String.format("%,.0f ₫", spa.getRefundAmount())).append(")");
                            }
                            if (spa.getCancellationReason() != null && !spa.getCancellationReason().isBlank()) {
                                sb.append(" - Lý do: ").append(spa.getCancellationReason());
                            }
                            sb.append("\n");
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to query cancelled spa bookings: " + e.getMessage());
            }

            try {
                List<FoodOrder> foodOrders = foodOrderRepository.findByRoomBooking_BookingId(rb.getBookingId());
                if (foodOrders != null) {
                    for (FoodOrder fo : foodOrders) {
                        if ("CANCELLED".equalsIgnoreCase(fo.getStatus())) {
                            sb.append("- Hủy đơn gọi món (Đơn gọi món #").append(fo.getOrderId()).append(")");
                            if (fo.getRefundAmount() != null) {
                                totalRefund = totalRefund.add(fo.getRefundAmount());
                                sb.append(" (Hoàn trả: ").append(String.format("%,.0f ₫", fo.getRefundAmount())).append(")");
                            }
                            if (fo.getCancellationReason() != null && !fo.getCancellationReason().isBlank()) {
                                sb.append(" - Lý do: ").append(fo.getCancellationReason());
                            }
                            sb.append("\n");
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to query cancelled food orders: " + e.getMessage());
            }

            dto.setCancellationDetails(sb.toString().trim());
            dto.setRefundAmount(totalRefund);

            if (rb.getDetails() != null) {
                String roomNumbers = rb.getDetails().stream()
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

    private void triggerRoomBookingConfirmationEmail(Invoice invoice, RoomBooking booking) {
        if (booking == null || booking.getUser() == null || booking.getUser().getEmail() == null) {
            return;
        }

        String toEmail = booking.getUser().getEmail();
        String guestName = booking.getUser().getFullName();
        Integer bookingId = booking.getBookingId();
        LocalDateTime checkIn = booking.getCheckInDate();
        LocalDateTime checkOut = booking.getCheckOutDate();

        // Construct room details string
        String roomDetails = "N/A";
        if (booking.getDetails() != null && !booking.getDetails().isEmpty()) {
            roomDetails = booking.getDetails().stream()
                .map(detail -> {
                    String rNum = detail.getRoom() != null ? detail.getRoom().getRoomNumber() : "";
                    String rType = (detail.getRoom() != null && detail.getRoom().getRoomType() != null)
                        ? detail.getRoom().getRoomType().getTypeName() : "";
                    if (!rNum.isEmpty() && !rType.isEmpty()) {
                        return rType + " (Phòng " + rNum + ")";
                    } else if (!rNum.isEmpty()) {
                        return "Phòng " + rNum;
                    } else {
                        return rType;
                    }
                })
                .filter(s -> s != null && !s.isEmpty())
                .collect(java.util.stream.Collectors.joining(", "));
        }
        if (roomDetails.isEmpty()) {
            roomDetails = "N/A";
        }

        BigDecimal totalAmount = invoice.getFinalAmount();
        BigDecimal depositAmount = invoice.getDepositAmount();
        BigDecimal amountDue = invoice.getAmountDue();

        String finalRoomDetails = roomDetails;
        CompletableFuture.runAsync(() -> {
            try {
                log.info("[EMAIL] Triggering room booking confirmation email to: {}", toEmail);
                emailService.sendRoomBookingConfirmationEmail(
                    toEmail,
                    guestName,
                    bookingId,
                    checkIn,
                    checkOut,
                    finalRoomDetails,
                    totalAmount,
                    depositAmount,
                    amountDue
                );
            } catch (Exception ex) {
                log.error("[Email Room Booking Confirmation Error] {}", ex.getMessage());
            }
        });
    }

    private void triggerInvoiceEmail(Invoice invoice) {
        if (invoice == null || invoice.getUser() == null || invoice.getUser().getEmail() == null) {
            return;
        }
        String toEmail = invoice.getUser().getEmail();
        InvoiceDTO dto = toDto(invoice);
        CompletableFuture.runAsync(() -> {
            try {
                log.info("[EMAIL] Triggering invoice email to: {}", toEmail);
                emailService.sendInvoiceEmail(toEmail, dto);
            } catch (Exception ex) {
                log.error("[Email Invoice Error] {}", ex.getMessage());
            }
        });
    }

    @Override
    @Transactional
    public InvoiceDTO applyVoucher(Integer invoiceId, String code) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));
        if ("PAID".equals(invoice.getStatus())) {
            throw conflict("Cannot apply voucher to a paid invoice");
        }
        
        BigDecimal roomSubtotal = defaultZero(invoiceRepository.sumRoomSubtotal(invoice.getRoomBooking().getBookingId()));
        BigDecimal spaSubtotal = defaultZero(invoiceRepository.sumSpaSubtotal(invoice.getRoomBooking().getBookingId()));
        BigDecimal foodSubtotal = defaultZero(invoiceRepository.sumFoodSubtotal(invoice.getRoomBooking().getBookingId()));
        BigDecimal taxableBase = roomSubtotal.add(spaSubtotal).add(foodSubtotal);
        BigDecimal taxAndFees = taxableBase.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableBase.add(taxAndFees);

        Voucher voucher = voucherService.validateAndGetVoucher(code, grandTotal);
        invoice.setVoucher(voucher);
        
        recalculate(invoice, invoice.getRoomBooking().getBookingId());
        Invoice saved = invoiceRepository.save(invoice);
        return toDto(saved);
    }

    @Override
    @Transactional
    public InvoiceDTO removeVoucher(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> notFound("Invoice not found: " + invoiceId));
        if ("PAID".equals(invoice.getStatus())) {
            throw conflict("Cannot remove voucher from a paid invoice");
        }

        invoice.setVoucher(null);
        invoice.setDiscountAmount(BigDecimal.ZERO);
        
        recalculate(invoice, invoice.getRoomBooking().getBookingId());
        Invoice saved = invoiceRepository.save(invoice);
        return toDto(saved);
    }

    private void incrementVoucherUsage(Invoice invoice) {
        if (invoice.getVoucher() != null) {
            Voucher v = invoice.getVoucher();
            v.setUsedCount(v.getUsedCount() + 1);
            voucherRepository.save(v);
        }
    }
}

