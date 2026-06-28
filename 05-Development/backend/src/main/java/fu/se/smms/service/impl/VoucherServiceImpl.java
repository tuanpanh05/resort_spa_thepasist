package fu.se.smms.service.impl;

import fu.se.smms.entity.Voucher;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.VoucherRepository;
import fu.se.smms.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VoucherServiceImpl implements VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Override
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @Override
    public Voucher getVoucherById(Integer id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new BusinessException("VOUCHER_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy voucher."));
    }

    @Override
    @Transactional
    public Voucher createVoucher(Voucher voucher) {
        validateVoucherData(voucher);
        if (voucherRepository.findByCodeIgnoreCase(voucher.getCode()).isPresent()) {
            throw new BusinessException("DUPLICATE_VOUCHER_CODE", HttpStatus.BAD_REQUEST, "Mã voucher đã tồn tại trong hệ thống.");
        }
        return voucherRepository.save(voucher);
    }

    @Override
    @Transactional
    public Voucher updateVoucher(Integer id, Voucher voucher) {
        validateVoucherData(voucher);
        Voucher existing = getVoucherById(id);
        
        // If code changed, check for duplicates
        if (!existing.getCode().equalsIgnoreCase(voucher.getCode())) {
            if (voucherRepository.findByCodeIgnoreCase(voucher.getCode()).isPresent()) {
                throw new BusinessException("DUPLICATE_VOUCHER_CODE", HttpStatus.BAD_REQUEST, "Mã voucher mới đã tồn tại trong hệ thống.");
            }
        }

        existing.setCode(voucher.getCode());
        existing.setDiscountType(voucher.getDiscountType());
        existing.setDiscountValue(voucher.getDiscountValue());
        existing.setMaxDiscountAmount(voucher.getMaxDiscountAmount());
        existing.setMinBookingAmount(voucher.getMinBookingAmount());
        existing.setStartDate(voucher.getStartDate());
        existing.setExpiryDate(voucher.getExpiryDate());
        existing.setUsageLimit(voucher.getUsageLimit());
        existing.setUsedCount(voucher.getUsedCount());
        existing.setStatus(voucher.getStatus());

        return voucherRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteVoucher(Integer id) {
        Voucher voucher = getVoucherById(id);
        voucherRepository.delete(voucher);
    }

    @Override
    public Voucher validateAndGetVoucher(String code, BigDecimal invoiceAmount) {
        if (code == null || code.trim().isEmpty()) {
            throw new BusinessException("INVALID_CODE", HttpStatus.BAD_REQUEST, "Mã giảm giá không được để trống.");
        }

        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BusinessException("VOUCHER_NOT_FOUND", HttpStatus.BAD_REQUEST, "Mã giảm giá không tồn tại."));

        LocalDateTime now = LocalDateTime.now();

        if (!"ACTIVE".equalsIgnoreCase(voucher.getStatus())) {
            throw new BusinessException("VOUCHER_INACTIVE", HttpStatus.BAD_REQUEST, "Mã giảm giá này hiện không hoạt động.");
        }

        if (voucher.getStartDate() != null && voucher.getStartDate().isAfter(now)) {
            throw new BusinessException("VOUCHER_NOT_STARTED", HttpStatus.BAD_REQUEST, "Chương trình giảm giá này chưa bắt đầu.");
        }

        if (voucher.getExpiryDate() != null && voucher.getExpiryDate().isBefore(now)) {
            throw new BusinessException("VOUCHER_EXPIRED", HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết hạn sử dụng.");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BusinessException("VOUCHER_LIMIT_EXCEEDED", HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết lượt sử dụng.");
        }

        if (voucher.getMinBookingAmount() != null && invoiceAmount.compareTo(voucher.getMinBookingAmount()) < 0) {
            String formattedMin = String.format("%,.0f ₫", voucher.getMinBookingAmount());
            throw new BusinessException("VOUCHER_MIN_AMOUNT_NOT_MET", HttpStatus.BAD_REQUEST, 
                    "Mã này chỉ áp dụng cho hóa đơn tối thiểu từ " + formattedMin);
        }

        return voucher;
    }

    private void validateVoucherData(Voucher voucher) {
        // 1. Kiểm tra giá trị giảm giá (Không được bỏ trống)
        if (voucher.getDiscountValue() == null) {
            throw new BusinessException("INVALID_VALUE", HttpStatus.BAD_REQUEST, "Giá trị giảm giá không được để trống.");
        }
        
        // Chuyển đổi BigDecimal sang double để so sánh dễ hiểu hơn
        double value = voucher.getDiscountValue().doubleValue();
        if (value <= 0) {
            throw new BusinessException("INVALID_VALUE", HttpStatus.BAD_REQUEST, "Giá trị giảm giá phải lớn hơn 0.");
        }

        // 2. Nếu chọn hình thức giảm theo Phần trăm (PERCENTAGE)
        if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
            if (value > 100) {
                throw new BusinessException("INVALID_PERCENTAGE", HttpStatus.BAD_REQUEST, "Mức giảm phần trăm không được vượt quá 100%.");
            }
        }

        // 3. Kiểm tra số tiền giảm tối đa (Không được là số âm)
        if (voucher.getMaxDiscountAmount() != null) {
            double maxDiscount = voucher.getMaxDiscountAmount().doubleValue();
            if (maxDiscount < 0) {
                throw new BusinessException("INVALID_MAX_DISCOUNT", HttpStatus.BAD_REQUEST, "Số tiền giảm tối đa không được âm.");
            }
        }

        // 4. Kiểm tra giá trị hóa đơn tối thiểu (Không được là số âm)
        if (voucher.getMinBookingAmount() != null) {
            double minBooking = voucher.getMinBookingAmount().doubleValue();
            if (minBooking < 0) {
                throw new BusinessException("INVALID_MIN_BOOKING", HttpStatus.BAD_REQUEST, "Hóa đơn tối thiểu không được âm.");
            }
        }

        // 5. Kiểm tra giới hạn số lần sử dụng (Phải lớn hơn 0)
        if (voucher.getUsageLimit() != null && voucher.getUsageLimit() <= 0) {
            throw new BusinessException("INVALID_USAGE_LIMIT", HttpStatus.BAD_REQUEST, "Số lần sử dụng tối đa phải lớn hơn 0.");
        }
    }
}
