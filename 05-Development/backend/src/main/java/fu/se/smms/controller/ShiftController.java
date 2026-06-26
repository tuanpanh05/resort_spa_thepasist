package fu.se.smms.controller;

import fu.se.smms.entity.Shift;
import fu.se.smms.entity.SwapRequest;
import fu.se.smms.repository.ShiftRepository;
import fu.se.smms.repository.SwapRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shifts")
public class ShiftController {

    private final ShiftRepository shiftRepository;
    private final SwapRequestRepository swapRequestRepository;

    public ShiftController(ShiftRepository shiftRepository, SwapRequestRepository swapRequestRepository) {
        this.shiftRepository = shiftRepository;
        this.swapRequestRepository = swapRequestRepository;
    }

    @GetMapping
    public ResponseEntity<List<Shift>> getAllShifts() {
        return ResponseEntity.ok(shiftRepository.findAll());
    }

    @GetMapping("/swap-requests")
    public ResponseEntity<List<SwapRequest>> getAllSwapRequests() {
        return ResponseEntity.ok(swapRequestRepository.findAll());
    }

    @PostMapping("/swap-requests/{id}/approve")
    public ResponseEntity<SwapRequest> approveSwapRequest(@PathVariable Integer id) {
        return swapRequestRepository.findById(id)
                .map(req -> {
                    req.setStatus("Approved");
                    return ResponseEntity.ok(swapRequestRepository.save(req));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/swap-requests/{id}/reject")
    public ResponseEntity<SwapRequest> rejectSwapRequest(@PathVariable Integer id) {
        return swapRequestRepository.findById(id)
                .map(req -> {
                    req.setStatus("Rejected");
                    return ResponseEntity.ok(swapRequestRepository.save(req));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Shift> updateShiftStatus(@PathVariable Integer id, @RequestParam String status) {
        return shiftRepository.findById(id)
                .map(shift -> {
                    shift.setStatus(status);
                    return ResponseEntity.ok(shiftRepository.save(shift));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
