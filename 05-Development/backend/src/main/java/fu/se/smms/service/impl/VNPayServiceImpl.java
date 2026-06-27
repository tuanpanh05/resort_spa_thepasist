package fu.se.smms.service.impl;

import fu.se.smms.config.VNPayProperties;
import fu.se.smms.dto.VNPayPaymentDTO;
import fu.se.smms.entity.Invoice;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
import java.util.Map;
import java.util.TreeMap;

@Service
public class VNPayServiceImpl implements VNPayService {

    private static final Logger log = LoggerFactory.getLogger(VNPayServiceImpl.class);
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VNPayProperties vnPayProperties;

    public VNPayServiceImpl(VNPayProperties vnPayProperties) {
        this.vnPayProperties = vnPayProperties;
    }

    @Override
    public VNPayPaymentDTO createPaymentUrl(Invoice invoice, BigDecimal payableAmount) {
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
    public void verifyVNPaySignature(Map<String, String> callbackParams) {
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

    @Override
    public boolean isVNPayAmountValid(BigDecimal expectedPayableAmount, String rawAmount) {
        try {
            long expected = expectedPayableAmount
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValueExact();
            return expected == Long.parseLong(rawAmount);
        } catch (Exception ex) {
            return false;
        }
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
        if ("0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
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
}
