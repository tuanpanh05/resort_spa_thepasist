package fu.se.smms.controller;
import fu.se.smms.dto.BookingRequestDTO;
import fu.se.smms.dto.ItineraryDTO;
import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.entity.RetreatPackage;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.RoomBookingDetail;
import fu.se.smms.entity.User;
import fu.se.smms.service.RoomBookingService;
import fu.se.smms.service.InvoiceService;
import fu.se.smms.service.impl.ItineraryServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bookings")
public class RoomBookingController {

    private final RoomBookingService roomBookingService;
    private final ItineraryServiceImpl itineraryService;
    private final InvoiceService invoiceService;

    public RoomBookingController(RoomBookingService roomBookingService,
                                  ItineraryServiceImpl itineraryService,
                                  InvoiceService invoiceService) {
        this.roomBookingService = roomBookingService;
        this.itineraryService = itineraryService;
        this.invoiceService = invoiceService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO request) {
        try {
            System.out.println("[RoomBookingController Debug] Received booking request for email: " + request.getEmail());
            RoomBooking booking = roomBookingService.createBooking(request);
            System.out.println("[RoomBookingController Debug] Booking created: ID=" + booking.getBookingId() + ", Status=" + booking.getStatus());
            InvoiceDTO invoice = invoiceService.createInvoice(booking.getBookingId());
            System.out.println("[RoomBookingController Debug] Invoice generated: ID=" + invoice.getInvoiceId() + ", Status=" + invoice.getStatus());
            Map<String, Object> response = toBookingMap(booking);
            response.put("invoiceId", invoice.getInvoiceId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[RoomBookingController Debug] Error creating booking:");
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create booking: " + e.getMessage());
        }
    }

    /**
     * Public endpoint: Lookup bookings by email + phone (no auth required).
     * Converts entities to safe Maps to avoid Hibernate proxy serialization issues.
     */
    @PostMapping("/lookup")
    public ResponseEntity<?> lookupBookings(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String phone = request.get("phone");
            List<RoomBooking> bookings = roomBookingService.lookupBookings(email, phone);

            // Convert to safe DTOs to avoid Jackson/Hibernate proxy serialization errors
            List<Map<String, Object>> result = bookings.stream()
                    .map(this::toBookingMap)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Public endpoint: Update booking details (name, phone, dates).
     */
    @PutMapping("/{bookingId}/update")
    public ResponseEntity<?> updateBooking(@PathVariable Integer bookingId,
                                            @RequestBody BookingRequestDTO request) {
        try {
            RoomBooking updated = roomBookingService.updateBooking(
                    bookingId, request.getEmail(), request.getPhone(), request);
            return ResponseEntity.ok(toBookingMap(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Public endpoint: Get itinerary timeline for a booking.
     */
    @GetMapping("/{bookingId}/itinerary")
    public ResponseEntity<?> getBookingItinerary(@PathVariable Integer bookingId) {
        try {
            ItineraryDTO itinerary = itineraryService.getTimeline(bookingId);
            return ResponseEntity.ok(itinerary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Helper: Convert RoomBooking entity to safe serializable Map ──
    private Map<String, Object> toBookingMap(RoomBooking b) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("bookingId", b.getBookingId());
        map.put("checkInDate", b.getCheckInDate());
        map.put("checkOutDate", b.getCheckOutDate());
        map.put("status", b.getStatus());
        map.put("totalDeposit", b.getTotalDeposit());
        map.put("createdAt", b.getCreatedAt());

        try {
            InvoiceDTO inv = invoiceService.createInvoice(b.getBookingId());
            if (inv != null) {
                map.put("invoiceId", inv.getInvoiceId());
            }
        } catch (Exception ignored) {}

        // User info
        User user = b.getUser();
        if (user != null) {
            Map<String, Object> userMap = new LinkedHashMap<>();
            userMap.put("userId", user.getUserId());
            userMap.put("fullName", user.getFullName());
            userMap.put("email", user.getEmail());
            userMap.put("phone", user.getPhone());
            userMap.put("status", user.getStatus());
            map.put("user", userMap);
        }

        // Room details
        List<RoomBookingDetail> details = b.getDetails();
        if (details != null && !details.isEmpty()) {
            List<Map<String, Object>> detailsList = new ArrayList<>();
            for (RoomBookingDetail d : details) {
                Map<String, Object> detMap = new LinkedHashMap<>();
                detMap.put("detailId", d.getDetailId());
                detMap.put("priceAtBooking", d.getPriceAtBooking());
                if (d.getRoom() != null) {
                    Map<String, Object> roomMap = new LinkedHashMap<>();
                    roomMap.put("roomId", d.getRoom().getRoomId());
                    roomMap.put("roomNumber", d.getRoom().getRoomNumber());
                    if (d.getRoom().getRoomType() != null) {
                        Map<String, Object> typeMap = new LinkedHashMap<>();
                        typeMap.put("roomTypeId", d.getRoom().getRoomType().getRoomTypeId());
                        typeMap.put("typeName", d.getRoom().getRoomType().getTypeName());
                        typeMap.put("basePricePerNight", d.getRoom().getRoomType().getBasePricePerNight());
                        roomMap.put("roomType", typeMap);
                    }
                    detMap.put("room", roomMap);
                }
                detailsList.add(detMap);
            }
            map.put("details", detailsList);
        }

        // Retreat packages
        List<RetreatPackage> pkgs = b.getRetreatPackages();
        if (pkgs != null && !pkgs.isEmpty()) {
            List<Map<String, Object>> pkgList = new ArrayList<>();
            for (RetreatPackage p : pkgs) {
                Map<String, Object> pkgMap = new LinkedHashMap<>();
                pkgMap.put("packageId", p.getPackageId());
                pkgMap.put("name", p.getName());
                pkgMap.put("description", p.getDescription());
                pkgMap.put("price", p.getPrice());
                pkgMap.put("durationDays", p.getDurationDays());
                pkgList.add(pkgMap);
            }
            map.put("retreatPackages", pkgList);
        } else {
            map.put("retreatPackages", Collections.emptyList());
        }

        // Legacy single package
        RetreatPackage singlePkg = b.getRetreatPackage();
        if (singlePkg != null) {
            Map<String, Object> pkgMap = new LinkedHashMap<>();
            pkgMap.put("packageId", singlePkg.getPackageId());
            pkgMap.put("name", singlePkg.getName());
            pkgMap.put("description", singlePkg.getDescription());
            pkgMap.put("price", singlePkg.getPrice());
            pkgMap.put("durationDays", singlePkg.getDurationDays());
            map.put("retreatPackage", pkgMap);
        }

        return map;
    }
}

