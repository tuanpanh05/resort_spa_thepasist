package fu.se.smms.controller;

import fu.se.smms.dto.BookingRequestDTO;
import fu.se.smms.dto.BookingResponseDTO;
import fu.se.smms.dto.InvoiceDTO;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.SystemConfiguration;
import fu.se.smms.entity.User;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.SystemConfigurationRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.InvoiceService;
import fu.se.smms.service.impl.BookingServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;

@RestController
@RequestMapping("/v1/bookings")
public class BookingController {

    @Autowired
    private BookingServiceImpl bookingService;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemConfigurationRepository systemConfigurationRepository;

    /**
     * UC07/UC-13: Create a new retreat package booking with deposit payment.
     * The booking is created with status PENDING_DEPOSIT, and an invoice is generated
     * automatically. The guest is then redirected to the payment page to pay the deposit.
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            Principal principal,
            @Valid @RequestBody BookingRequestDTO request) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new BusinessException(
                        "BOOKING-001", HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng đang đăng nhập."));

        // createBooking internally creates the invoice via invoiceService.createInvoice
        RoomBooking booking = bookingService.createBooking(
                user.getUserId(),
                request.getPackageId(),
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate());

        // Retrieve the invoice that was already created inside createBooking
        // createInvoice is idempotent — returns existing invoice if one already exists
        InvoiceDTO invoice = invoiceService.createInvoice(booking.getBookingId());

        BigDecimal depositRatio = systemConfigurationRepository.findByConfigKey("deposit_ratio")
                .map(SystemConfiguration::getConfigValue)
                .map(BigDecimal::new)
                .orElse(new BigDecimal("0.30"));

        BigDecimal requiredDeposit = invoice.getFinalAmount()
                .multiply(depositRatio)
                .setScale(0, RoundingMode.CEILING);

        BookingResponseDTO response = new BookingResponseDTO();
        response.setBookingId(booking.getBookingId());
        response.setInvoiceId(invoice.getInvoiceId());
        response.setTotalPrice(invoice.getFinalAmount());
        response.setRequiredDeposit(requiredDeposit);
        response.setStatus(booking.getStatus());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
