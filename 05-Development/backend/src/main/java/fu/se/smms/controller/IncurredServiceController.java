package fu.se.smms.controller;

import fu.se.smms.entity.IncurredService;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.repository.IncurredServiceRepository;
import fu.se.smms.service.InvoiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/incurred-services")
public class IncurredServiceController {

    private final IncurredServiceRepository incurredServiceRepository;
    private final InvoiceService invoiceService;

    public IncurredServiceController(IncurredServiceRepository incurredServiceRepository, InvoiceService invoiceService) {
        this.incurredServiceRepository = incurredServiceRepository;
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<List<IncurredService>> getAllServices() {
        return ResponseEntity.ok(incurredServiceRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<?> createServiceOrder(@RequestBody Map<String, Object> request) {
        try {
            String roomNumber = (String) request.get("room");
            String category = (String) request.get("category");
            String detail = (String) request.get("detail");
            Object priceObj = request.get("price");

            if (roomNumber == null || roomNumber.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Room number is required"));
            }
            if (category == null || category.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Category is required"));
            }
            if (detail == null || detail.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Detail description is required"));
            }
            if (priceObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Price is required"));
            }

            // Standardize room number lookup (e.g. support "101" to match "#S101" if not exact match)
            String searchRoomNumber = roomNumber.trim();
            // Find active booking for this room
            List<RoomBooking> bookings = incurredServiceRepository.findActiveBookingByRoomNumber(searchRoomNumber);
            if (bookings.isEmpty() && !searchRoomNumber.startsWith("#")) {
                // Try searching with prefix #S, #V, #P, #F, #NS, #NC to find any active booking
                String[] prefixes = {"#S", "#V", "#P", "#F", "#NS", "#NC"};
                for (String prefix : prefixes) {
                    bookings = incurredServiceRepository.findActiveBookingByRoomNumber(prefix + searchRoomNumber);
                    if (!bookings.isEmpty()) {
                        searchRoomNumber = prefix + searchRoomNumber;
                        break;
                    }
                }
            }

            // Safe parsing of price string (remove separators, currency symbols like 'đ', '.', ',', 'VND')
            String cleanPriceStr = String.valueOf(priceObj).replaceAll("[^\\d]", "");
            if (cleanPriceStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid price format"));
            }
            BigDecimal price = new BigDecimal(cleanPriceStr);

            IncurredService incurredService = new IncurredService();
            incurredService.setRoomNumber(searchRoomNumber);
            incurredService.setCategory(category);
            incurredService.setDetail(detail);
            incurredService.setPrice(price);
            incurredService.setStatus("Pending");

            if (!bookings.isEmpty()) {
                incurredService.setRoomBooking(bookings.get(0));
            }

            IncurredService saved = incurredServiceRepository.save(incurredService);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateServiceStatus(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }

        return incurredServiceRepository.findById(id)
                .map(service -> {
                    service.setStatus(newStatus);
                    IncurredService saved = incurredServiceRepository.save(service);

                    // Recalculate invoice if service transitions to Completed
                    if ("Completed".equalsIgnoreCase(newStatus) && service.getRoomBooking() != null) {
                        try {
                            invoiceService.createInvoice(service.getRoomBooking().getBookingId());
                        } catch (Exception ex) {
                            // Log warning but do not crash the status update
                            System.err.println("Warning: Recalculate invoice failed on service completed: " + ex.getMessage());
                        }
                    }

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
