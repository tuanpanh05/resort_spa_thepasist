package fu.se.smms.service;

import fu.se.smms.entity.Voucher;
import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {
    List<Voucher> getAllVouchers();
    Voucher getVoucherById(Integer id);
    Voucher createVoucher(Voucher voucher);
    Voucher updateVoucher(Integer id, Voucher voucher);
    void deleteVoucher(Integer id);
    Voucher validateAndGetVoucher(String code, BigDecimal invoiceAmount);
}
