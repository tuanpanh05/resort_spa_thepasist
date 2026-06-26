package fu.se.smms.controller;

import fu.se.smms.entity.Voucher;
import fu.se.smms.service.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getVoucherById(@PathVariable Integer id) {
        return ResponseEntity.ok(voucherService.getVoucherById(id));
    }

    @PostMapping
    public ResponseEntity<Voucher> createVoucher(@RequestBody Voucher voucher) {
        return ResponseEntity.ok(voucherService.createVoucher(voucher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voucher> updateVoucher(@PathVariable Integer id, @RequestBody Voucher voucher) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, voucher));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Integer id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<Voucher> validateVoucher(@RequestParam String code, @RequestParam BigDecimal amount) {
        Voucher voucher = voucherService.validateAndGetVoucher(code, amount);
        return ResponseEntity.ok(voucher);
    }
}
