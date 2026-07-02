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
     * Supports BOTH authenticated users (Principal) AND guests (email+phone in request body).
     * If Principal is null/anonymous, a GUEST user is created or looked up by email.
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            Principal principal,
            @Valid @RequestBody BookingRequestDTO request) {

        User user;
        if (principal != null && principal.getName() != null
                && !principal.getName().isBlank()
                && !"anonymousUser".equals(principal.getName())) {
            // Authenticated user
            User loggedIn = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new BusinessException(
                            "BOOKING-001", HttpStatus.NOT_FOUND,
                            "Không tìm thấy người dùng đang đăng nhập."));
            if ("STAFF".equals(loggedIn.getRole()) || "ADMIN".equals(loggedIn.getRole())) {
                if (request.getEmail() == null || request.getEmail().isBlank()) {
                    throw new BusinessException(
                            "BOOKING-001", HttpStatus.BAD_REQUEST,
                            "Vui lòng nhập Email để đặt phòng.");
                }
                user = userRepository.findByEmail(request.getEmail()).orElseGet(() -> {
                    User newUser = User.builder()
                            .email(request.getEmail())
                            .fullName(request.getFullName() != null ? request.getFullName() : "Khách")
                            .phone(request.getPhone() != null ? request.getPhone() : "")
                            .role("GUEST")
                            .status("ACTIVE")
                            .passwordHash("GUEST_" + System.currentTimeMillis())
                            .build();
                    return userRepository.save(newUser);
                });
            } else {
                user = loggedIn;
            }
        } else {
            // Guest user — find or create by email from request body
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                throw new BusinessException(
                        "BOOKING-001", HttpStatus.BAD_REQUEST,
                        "Vui lòng nhập Email để đặt phòng.");
            }
            user = userRepository.findByEmail(request.getEmail()).orElseGet(() -> {
                User newUser = User.builder()
                        .email(request.getEmail())
                        .fullName(request.getFullName() != null ? request.getFullName() : "Khách")
                        .phone(request.getPhone() != null ? request.getPhone() : "")
                        .role("GUEST")
                        .status("ACTIVE")
                        .passwordHash("GUEST_" + System.currentTimeMillis())
                        .build();
                return userRepository.save(newUser);
            });
            // Update name/phone if provided and existing user didn't have them
            boolean updated = false;
            if (request.getFullName() != null && !request.getFullName().isBlank()
                    && (user.getFullName() == null || user.getFullName().isBlank() || "Khách".equals(user.getFullName()))) {
                user.setFullName(request.getFullName());
                updated = true;
            }
            if (request.getPhone() != null && !request.getPhone().isBlank()
                    && (user.getPhone() == null || user.getPhone().isBlank())) {
                user.setPhone(request.getPhone());
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
            }
        }

        // createBooking internally creates the invoice via invoiceService.createInvoice
        // BR-CHILD: Truyền thông tin trẻ em để tính slot và giảm giá
        RoomBooking booking = bookingService.createBooking(
                user.getUserId(),
                request.getPackageIds(),
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getGuestsCount(),
                request.getChildrenUnder5(),
                request.getChildren5to12());

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
