package fu.se.smms.service.impl;

import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.RoomBookingDetail;
import fu.se.smms.entity.User;
import fu.se.smms.entity.Room;
import fu.se.smms.entity.RetreatPackage;
import fu.se.smms.entity.SystemConfiguration;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomBookingDetailRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.repository.RoomRepository;
import fu.se.smms.repository.RetreatPackageRepository;
import fu.se.smms.repository.SystemConfigurationRepository;
import fu.se.smms.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Implementation of Booking business logic.
 * Covers:
 *   RESORT-M2-TC-002 — Deposit payment validation (BR-06: min 30% or config ratio)
 *   RESORT-M2-TC-003 — Prevent overlapping room bookings (BR-09)
 */
@Service
public class BookingServiceImpl {

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    @Autowired
    private RoomBookingDetailRepository roomBookingDetailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RetreatPackageRepository retreatPackageRepository;

    @Autowired
    private SystemConfigurationRepository systemConfigurationRepository;

    @Autowired
    private InvoiceService invoiceService;

    /**
     * Confirm a booking payment by verifying the deposit meets the minimum threshold.
     *
     * @param bookingId    The booking to confirm.
     * @param depositPaid  The deposit amount the guest is paying now.
     * @param totalAmount  The total price of the booking.
     * @return true if payment confirmed and booking status updated to CONFIRMED.
     * @throws BusinessException BOOKING-002 if deposit is below minimum ratio of total.
     */
    @Transactional
    public boolean confirmPayment(Integer bookingId, BigDecimal depositPaid, BigDecimal totalAmount) {
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(
                        "BOOKING-001", HttpStatus.NOT_FOUND,
                        "Không tìm thấy đặt phòng với ID: " + bookingId));

        // Fetch deposit ratio dynamically from configurations
        String configVal = systemConfigurationRepository.findByConfigKey("deposit_ratio")
                .map(SystemConfiguration::getConfigValue)
                .orElse("0.30");
        BigDecimal depositRatio = new BigDecimal(configVal);

        BigDecimal minimumDeposit = totalAmount.multiply(depositRatio)
                .setScale(0, RoundingMode.CEILING);

        if (depositPaid.compareTo(minimumDeposit) < 0) {
            throw new BusinessException(
                    "BOOKING-002", HttpStatus.BAD_REQUEST,
                    String.format("Số tiền đặt cọc (%.0f VND) thấp hơn mức tối thiểu %.0f%% (%.0f VND).",
                            depositPaid, depositRatio.multiply(new BigDecimal("100")), minimumDeposit));
        }

        booking.setStatus("CONFIRMED");
        booking.setTotalDeposit(depositPaid);
        roomBookingRepository.save(booking);
        return true;
    }

    /**
     * Create a new room booking, checking for date-range conflicts first.
     *
     * @param userId    The guest's user ID.
     * @param packageId Optional package ID (nullable).
     * @param roomId    The room/villa to book.
     * @param checkIn   Requested check-in date/time.
     * @param checkOut  Requested check-out date/time.
     * @return The saved RoomBooking entity.
     * @throws BusinessException BOOKING-003 (CONFLICT) if the room is already booked for those dates.
     */
    @Transactional
    public RoomBooking createBooking(Integer userId, Integer packageId, Integer roomId,
                                     LocalDateTime checkIn, LocalDateTime checkOut) {
        // Validate dates
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new BusinessException(
                    "BOOKING-001", HttpStatus.BAD_REQUEST,
                    "Ngày nhận phòng phải trước ngày trả phòng.");
        }

        // Load User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        "BOOKING-001", HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng với ID: " + userId));

        // Load Room
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(
                        "BOOKING-001", HttpStatus.NOT_FOUND,
                        "Không tìm thấy phòng với ID: " + roomId));

        // Load Retreat Package if specified
        RetreatPackage retreatPackage = null;
        if (packageId != null) {
            retreatPackage = retreatPackageRepository.findById(packageId)
                    .orElseThrow(() -> new BusinessException(
                            "BOOKING-001", HttpStatus.NOT_FOUND,
                            "Không tìm thấy gói trị liệu với ID: " + packageId));

            if (!"ACTIVE".equals(retreatPackage.getStatus())) {
                throw new BusinessException(
                        "BOOKING-001", HttpStatus.BAD_REQUEST,
                        "Gói trị liệu này hiện không hoạt động.");
            }
        }

        // BR-09: Check for overlapping bookings
        if (roomBookingRepository.existsOverlappingBooking(roomId, checkIn, checkOut)) {
            throw new BusinessException(
                    "BOOKING-003", HttpStatus.CONFLICT,
                    "Phòng/Villa này đã được đặt trong khoảng thời gian yêu cầu. Vui lòng chọn ngày khác.");
        }

        // Create RoomBooking
        RoomBooking booking = new RoomBooking();
        booking.setUser(user);
        booking.setRetreatPackage(retreatPackage);
        booking.setCheckInDate(checkIn);
        booking.setCheckOutDate(checkOut);
        booking.setStatus("PENDING_DEPOSIT");
        booking.setTotalDeposit(BigDecimal.ZERO);
        booking.setCreatedAt(LocalDateTime.now());

        RoomBooking savedBooking = roomBookingRepository.save(booking);

        // Create RoomBookingDetail
        RoomBookingDetail detail = new RoomBookingDetail();
        detail.setRoomBooking(savedBooking);
        detail.setRoom(room);

        BigDecimal priceAtBooking = BigDecimal.ZERO;
        if (room.getRoomType() != null && room.getRoomType().getBasePricePerNight() != null) {
            priceAtBooking = room.getRoomType().getBasePricePerNight();
        }
        detail.setPriceAtBooking(priceAtBooking);

        roomBookingDetailRepository.save(detail);

        // Initialize consolidated invoice via InvoiceService
        invoiceService.createInvoice(savedBooking.getBookingId());

        return savedBooking;
    }
}
