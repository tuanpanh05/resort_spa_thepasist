package fu.se.smms.controller;

import fu.se.smms.dto.BookingRequestDTO;
import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.service.InvoiceService;
import fu.se.smms.service.RoomBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class RoomBookingController {

    private final RoomBookingService roomBookingService;
    private final InvoiceService invoiceService;

    public RoomBookingController(RoomBookingService roomBookingService, InvoiceService invoiceService) {
        this.roomBookingService = roomBookingService;
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
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("bookingId", booking.getBookingId());
            response.put("status", booking.getStatus());
            response.put("invoiceId", invoice.getInvoiceId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[RoomBookingController Debug] Error creating booking:");
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create booking: " + e.getMessage());
        }
    }
}

